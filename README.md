# Oravia Intelligence (Server)

This is the backend for **Oravia Intelligence**, managing all AI orchestrations, database integrations, server-side caching, and file ingestion processes for our codebase analysis system.

## Core Features
- **Pinecone Vector Database Integrations:** Indexes huge codebases into rapid text chunks using Langchain.
- **REST APIs:** Seamless routing logic built in Express.js.
- **Google Generative AI integration:** For advanced semantic searching and robust markdown reports utilizing `ChatGoogleGenerativeAI`.
- **Multer file ingestion:** Unzip & process 10MB+ GitHub source code rapidly.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file mapping the following variables correctly (or refer to `config/index.js` for expected variables):
   - `PORT`: (default 5000)
   - `GEMINI_API_KEY`: Google Generative AI API Key
   - `PINECONE_API_KEY`: Pinecone API Key
   - `PINECONE_INDEX`: Pinecone Index name
   - `MONGODB_URI`: Connection string for project logging
   - `GITHUB_TOKEN`: For securely cloning repos

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```
