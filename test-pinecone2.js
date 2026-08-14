import { PineconeEmbeddings } from "@langchain/pinecone";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const embeddings = new PineconeEmbeddings({
            pineconeApiKey: process.env.PINECONE_API_KEY,
            model: "llama-text-embed-v2"
        });
        const vector = await embeddings.embedQuery("hello world");
        console.log("Vector length:", vector.length);
    } catch(e) {
        console.log("Error:", e);
    }
}
test();
