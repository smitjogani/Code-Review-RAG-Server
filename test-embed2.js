import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "embedding-001",
            apiKey: process.env.GEMINI_API_KEY
        });
        const vectors = await embeddings.embedDocuments(["hello world"]);
        console.log("Dimension:", vectors[0].length);
    } catch(e) {
        console.log("Error:", e);
    }
}
test();
