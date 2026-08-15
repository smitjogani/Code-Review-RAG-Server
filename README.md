# Oriva: Code-Review-RAG (Server)

## 🚀 The Problem It Solves
Modern codebases are massive and complex. When developers join a new project or attempt to debug a systemic issue, they spend hours reading through disconnected files, tracing dependencies, and trying to understand architectural patterns. Traditional AI tools lack full context—they only understand the specific snippets you paste into them.

**Oriva** solves this by acting as a highly intelligent, context-aware Principal Engineer. By ingesting your entire codebase (either via ZIP upload or public/private GitHub repositories) and storing it in a vector database, Oriva allows you to chat directly with your entire codebase. It instantly understands the structure, dependencies, and logic of your code, enabling you to identify architectural flaws, generate specialized IDE prompts to fix bugs, and onboard onto new projects in minutes.

## ✨ Key Features
- **Intelligent RAG Engine**: Combines Google's Gemini LLM with Pinecone Vector DB to answer questions with deep context spanning your entire codebase.
- **GitHub PAT Support**: Securely ingest both public and private GitHub repositories using Personal Access Tokens.
- **"Get Prompt for Fix" AI Generator**: When the AI finds an issue, one click generates a token-optimized, persona-driven prompt tailored for specific IDEs (Cursor, VS Code Copilot, Claude, Antigravity).
- **End-to-End Payload Encryption**: Zero data leakage. All sensitive requests and API responses are encrypted using AES-256 (`CryptoJS`) before traversing the network.
- **Instant Demo Mode**: "Skip Login" capability for users who want to bypass backend authentication and test the UI/UX instantly.
- **Smart Error Handling**: Clear, user-friendly UI errors directly piped from the backend to the frontend (e.g., catching missing GitHub PAT permissions).
- **Rich Markdown UI**: Beautiful glassmorphism UI with Tailwind CSS, rendering syntax-highlighted code blocks, tables, and AI reference sources gracefully.

## 🛠 Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React, React-Markdown.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose) for user/project metadata.
- **Vector Database (RAG)**: Pinecone.
- **AI / LLM**: Google Generative AI (Gemini 1.5 Pro/Flash).
- **Security**: CryptoJS (AES-256 Symmetric Encryption), JWT Authentication, bcryptjs.
- **File Processing**: `multer`, `adm-zip`, `simple-git`.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Database (Local or Atlas)
- Pinecone Account & API Key
- Google AI Studio API Key (for Gemini)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Code-Review-RAG-Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and populate it with the necessary keys:
   ```env
   # Application
   PORT=8000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173

   # Database
   MONGODB_URI=mongodb://localhost:27017/oriva-rag

   # Security & Encryption
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_SECRET=your_super_secret_encryption_key_here

   # AI APIs
   GEMINI_API_KEY=your_google_gemini_api_key
   GEMINI_MODEL=gemini-1.5-pro

   # Vector Database
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index_name
   ```
   > **Note:** The `ENCRYPTION_SECRET` must exactly match the `VITE_ENCRYPTION_SECRET` set in the frontend client.

4. **Run the Server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```
   The server will start on `http://localhost:8000`.

## Project Structure Highlights

- `src/controllers/project.controller.js`: The heart of the RAG engine. Handles extracting `.zip` files or cloning GitHub repos, chunking the code, generating embeddings via Gemini, and upserting them into Pinecone.
- `src/controllers/chat.controller.js`: Manages the conversational interface, querying Pinecone for relevant code context and constructing prompts for Gemini to answer.
- `src/middlewares/decrypt.middleware.js` & `encryptResponse.middleware.js`: Custom middlewares responsible for symmetric payload masking.
- `src/middlewares/auth.middleware.js`: Verifies JWT tokens from HTTP-only cookies for protected routes.

## Security Architecture

Oriva implements a unique security layer. The client encrypts all sensitive request payloads before sending them over the network. 
1. The `decryptPayload` middleware intercepts incoming POST/PUT requests, decrypts the AES-256 payload using the shared `ENCRYPTION_SECRET`, and reconstructs `req.body` so the controllers can operate normally.
2. The `encryptResponse` middleware hooks into `res.json()`, encrypting the JSON response body before it is sent over the wire back to the client.
