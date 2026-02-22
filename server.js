import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./src/app.js";
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

dotenv.config();

const startServer = async () => {
    try {
        await mongoose.connect(config.mongoURI);
        logger.info("MongoDB Connected");

        app.listen(config.port, () => {
            logger.info(`Server is running at port : ${config.port}`);
        });
    } catch (error) {
        logger.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

startServer();
