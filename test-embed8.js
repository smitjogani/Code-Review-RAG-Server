import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
            apiKey: process.env.GEMINI_API_KEY
        });
        const vector = await embeddings.embedQuery("hello world");
        console.log("Vector length:", vector.length);
    } catch(e) {
        console.log("Error:", e);
    }
}
test();
