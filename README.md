# Oriva: Code-Review-RAG (Server)

Oriva is an advanced AI-powered codebase analysis and chat assistant. This repository contains the Backend Server, acting as the core Retrieval-Augmented Generation (RAG) engine that powers the Oriva client. 

## Key Features

- **RAG Engine**: Utilizes **Pinecone** as a Vector Database and **Google Generative AI (Gemini 1.5 Pro/Flash)** for embedding generation and intelligent chat responses.
- **Codebase Ingestion**: Capable of ingesting codebases via direct `.zip` file uploads (using `multer` and `adm-zip`) or via public GitHub repository URLs (using `axios` and `jszip`).
- **End-to-End Payload Encryption**: Employs custom Express middlewares to automatically decrypt incoming API requests and encrypt outgoing responses using AES-256 symmetric encryption, ensuring zero data leakage in transit.
- **Secure Authentication**: Robust JWT-based authentication system storing tokens securely in HTTP-only, secure cookies.
- **Rate Limiting**: Protects AI API endpoints (like repository analysis) from abuse using `express-rate-limit`.
- **Global Error Handling**: Custom error formatting that strips sensitive stack traces in production environments.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Vector Database**: Pinecone
- **AI / LLM**: Google Generative AI SDK (`@google/generative-ai`)
- **Cryptography**: CryptoJS (AES-256), bcryptjs, jsonwebtoken
- **File Processing**: multer, adm-zip, jszip

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
