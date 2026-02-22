import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 8000,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/codebase_rag',
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    googleApiKey: process.env.GOOGLE_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    uploadLimit: process.env.UPLOAD_LIMIT || '10mb',
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndex: process.env.PINECONE_INDEX || 'codebase-rag'
};
