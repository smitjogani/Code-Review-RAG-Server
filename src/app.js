import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import logger from './utils/logger.js';

// Import routes
import projectRoutes from './routes/project.routes.js';

const app = express();

// Security and Logging
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// CORS
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

// Body Parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/v1/projects", projectRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.json({ message: "OK" });
});

// Root Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Code Review RAG API" });
});

// Error Handling
app.use(errorHandler);

export { app };
