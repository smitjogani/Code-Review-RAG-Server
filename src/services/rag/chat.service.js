
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PineconeStore, PineconeEmbeddings } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import logger from '../../utils/logger.js';
import config from '../../config/index.js';
import { ApiError } from '../../utils/ApiError.js';

class ChatService {
    constructor() {
        this._llm = null;
        this._embeddings = null;
        this._pinecone = null;
        this._pineconeIndex = null;
    }

    getLlm() {
        if (!this._llm) {
            if (!config.googleApiKey) {
                throw new Error("Please set GOOGLE_API_KEY or GEMINI_API_KEY for chat");
            }
            this._llm = new ChatGoogleGenerativeAI({
                model: config.geminiModel,
                apiKey: config.googleApiKey,
                temperature: 0.1,
            });
        }
        return this._llm;
    }

    getEmbeddings() {
        if (!this._embeddings) {
            if (!config.pineconeApiKey) {
                throw new Error("Please set PINECONE_API_KEY for embeddings");
            }
            this._embeddings = new PineconeEmbeddings({
                pineconeApiKey: config.pineconeApiKey,
                model: "llama-text-embed-v2"
            });
        }
        return this._embeddings;
    }

    getPineconeIndex() {
        if (!this._pineconeIndex) {
            if (!config.pineconeApiKey) {
                throw new Error("Please set PINECONE_API_KEY for vector search");
            }
            this._pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
            this._pineconeIndex = this._pinecone.Index(config.pineconeIndex);
        }
        return this._pineconeIndex;
    }

    async getAnswer(projectId, question) {
        // 1. Get Vector Store (From Pinecone)
        const vectorStore = await PineconeStore.fromExistingIndex(
            this.getEmbeddings(),
            { pineconeIndex: this.getPineconeIndex(), namespace: projectId.toString() }
        );

        if (!vectorStore) {
            // Technically vectorStore is always returned even if empty, 
            // but if search yields nothing we handle it below.
        }

        // 2. Similarity Search
        // Retrieve top 5 most relevant chunks
        const results = await vectorStore.similaritySearch(question, 5);

        if (results.length === 0) {
            return { answer: "I couldn't find any relevant code in your project to answer that. Did the project finish processing?", sources: [] };
        }

        // Format context
        const context = results.map(doc => `File: ${doc.metadata.source}\n\`\`\`\n${doc.pageContent}\n\`\`\``).join("\n\n---\n\n");
        const sources = results.map(doc => ({ file: doc.metadata.source, lines: 'N/A' }));

        // 3. Construct Prompt (Improved)
        const promptTemplate = PromptTemplate.fromTemplate(`
You are a Principal Software Architect and Code Reviewer.
Your goal is to help a developer understand their codebase by answering their questions accurately based on the provided code structure and content.

Context (Codebase Snippets):
{context}

User Question:
{question}

Instructions:
- Analyze the code snippets provided in the context.
- Answer the question specifically using the logic, variable names, and patterns found in the snippets.
- If the context contains the answer, explain *how* it works with code examples from the context.
- If the context is missing specific details needed to answer fully, state "I see [X] in the code, but I'm missing [Y] to be certain," and then provide the best possible inference based on standard practices for this language/framework.
- Do NOT hallucinate code that isn't there.
- Use Markdown formatting (headers, code blocks, bold text) for readability.
- ALWAYS end your response with EXACTLY the following marker: "--- SUGGESTED_QUESTIONS ---", followed by exactly 3 suggested follow-up questions the user can ask, each on a new line starting with "- ".

Answer:
        `);

        // 4. Generate Response
        const chain = promptTemplate.pipe(this.getLlm()).pipe(new StringOutputParser());
        const rawResponse = await chain.invoke({
            context: context,
            question: question
        });

        const parts = rawResponse.split("--- SUGGESTED_QUESTIONS ---");
        const answerText = parts[0].trim();

        let extractedSuggestions = [];
        if (parts[1]) {
            extractedSuggestions = parts[1].split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace('-', '').trim());
        }

        return {
            answer: answerText,
            sources: sources,
            suggestions: extractedSuggestions
        };
    }
}

export const chatService = new ChatService();
