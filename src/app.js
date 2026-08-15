import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import logger from './utils/logger.js';

// Import routes
import projectRoutes from './routes/project.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Security and Logging
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 5000 : 500, // higher limit to handle polling
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);


// CORS
app.use(cors({
    origin: config.corsOrigin === '*' ? 'http://localhost:5173' : config.corsOrigin, // Stricter default if '*'
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
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
