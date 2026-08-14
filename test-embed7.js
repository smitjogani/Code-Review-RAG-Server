import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
            apiKey: process.env.GEMINI_API_KEY
        });
        console.log("Calling embedDocuments...");
        const vectors = await embeddings.embedDocuments(["hello world"]);
        console.log("Vectors length:", vectors.length);
        console.log("Vector 0 length:", vectors[0] ? vectors[0].length : 'undefined');
    } catch(e) {
        console.log("Error caught:");
        console.log(e);
    }
}
test();
