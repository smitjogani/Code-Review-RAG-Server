import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: process.env.GEMINI_API_KEY
    });
    const vectors = await embeddings.embedDocuments(["hello world"]);
    console.log("Dimension:", vectors[0].length);
}
test();
