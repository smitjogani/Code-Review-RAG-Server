import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import simpleGit from 'simple-git';
import { glob } from 'glob';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PineconeEmbeddings } from '@langchain/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import logger from '../../utils/logger.js';
import config from '../../config/index.js';
import { analysisService } from './analysis.service.js';

class IngestionService {
    constructor() {
        this.baseDir = path.join(process.cwd(), 'uploads');
        fs.ensureDirSync(this.baseDir);
        this._pinecone = null;
        this._pineconeIndex = null;
    }

    getPineconeIndex() {
        if (!this._pineconeIndex) {
            if (!config.pineconeApiKey) {
                throw new Error("Please set PINECONE_API_KEY for ingestion");
            }
            this._pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
            this._pineconeIndex = this._pinecone.Index(config.pineconeIndex);
        }
        return this._pineconeIndex;
    }

    async processProject(project) {
        let sourcePath;
        try {
            logger.info(`Starting ingestion for project: ${project._id}`);

            // 1. Get Source Code
            if (project.type === 'zip' && project.filePath) {
                sourcePath = await this.extractZip(project.filePath);
            } else if (project.type === 'github' && project.repoUrl) {
                sourcePath = await this.cloneRepo(project.repoUrl, project.githubToken);
            } else {
                throw new Error("Invalid project source configuration");
            }

            // 2. Read Files
            const documents = await this.loadDocuments(sourcePath);
            logger.info(`Loaded ${documents.length} documents for project: ${project._id}`);

            // 2.5 Generate Analysis Report
            const fileList = documents.map(d => d.metadata.source);
            const coreFiles = documents.filter(d =>
                d.metadata.source.includes('package.json') ||
                d.metadata.source.includes('README') ||
                d.metadata.source.includes('index') ||
                d.metadata.source.includes('main') ||
                d.metadata.source.includes('App') ||
                d.metadata.source.includes('server')
            ).slice(0, 5);

            // 2. Start Project Analysis in background (Parallel)
            logger.info("Initiating parallel processing: Architecture Analysis + Vector Embedding");
            const reportPromise = analysisService.generateReport(fileList, coreFiles.map(d => ({ path: d.metadata.source, content: d.pageContent })), {
                language: project.language,
                framework: project.framework
            });

            // 3. Split Text
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const chunks = await splitter.createDocuments(
                documents.map(doc => doc.pageContent),
                documents.map(doc => doc.metadata)
            );

            // Filter out any empty chunks
            const validChunks = chunks.filter(chunk => chunk.pageContent && chunk.pageContent.trim().length > 0);

            if (validChunks.length === 0) {
                logger.warn(`No valid text content found to embed for project: ${project._id}`);
                const finalReport = await reportPromise;
                return { success: true, chunkCount: 0, report: finalReport };
            }

            // 4. Embed & Store in Pinecone
            logger.info(`Embedding pipeline started: ${validChunks.length} chunks`);
            const embeddings = new PineconeEmbeddings({
                pineconeApiKey: config.pineconeApiKey,
                model: "llama-text-embed-v2"
            });

            const batchSize = 100;
            const allVectors = [];
            const finalChunks = [];
            const batches = [];

            for (let i = 0; i < validChunks.length; i += batchSize) {
                batches.push(validChunks.slice(i, i + batchSize));
            }

            // Process batches with optimized concurrency
            const concurrencyLimit = 5; // Increased for faster processing
            for (let i = 0; i < batches.length; i += concurrencyLimit) {
                const currentBatchSet = batches.slice(i, i + concurrencyLimit);

                await Promise.all(currentBatchSet.map(async (batch, batchIdx) => {
                    const globalBatchIdx = i + batchIdx;
                    const texts = batch.map(c => c.pageContent);

                    try {
                        const progress = Math.round(((globalBatchIdx + 1) / batches.length) * 100);
                        logger.info(`[Embedding] Progress: ${progress}% - Batch ${globalBatchIdx + 1}/${batches.length}`);

                        const vectors = await embeddings.embedDocuments(texts);

                        if (vectors && vectors.length > 0) {
                            vectors.forEach((vec, idx) => {
                                if (vec && vec.length > 0) {
                                    allVectors.push(vec);
                                    finalChunks.push(batch[idx]);
                                }
                            });
                        }
                    } catch (err) {
                        logger.error(`Embedding Batch ${globalBatchIdx + 1} Error:`, err.message || err);
                    }
                }));

                if (i + concurrencyLimit < batches.length) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Reduced throttle
                }
            }

            if (allVectors.length === 0) {
                throw new Error("Vector generation failed.");
            }

            // Namespace isolation
            const vectorStore = await PineconeStore.fromExistingIndex(
                embeddings,
                {
                    pineconeIndex: this.getPineconeIndex(),
                    namespace: project._id.toString()
                }
            );

            await vectorStore.addVectors(allVectors, finalChunks);
            logger.info(`Vector sync complete for project: ${project._id}`);

            // 5. Finalize Report
            logger.info("Awaiting final architecture report...");
            const report = await reportPromise;
            logger.info(`Ingestion finalized for project: ${project._id}`);

            // Cleanup
            try {
                if (sourcePath) await fs.rm(sourcePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
            } catch (cleanupErr) {
                logger.warn(`Failed to cleanup source path ${sourcePath}: ${cleanupErr.message}`);
            }

            return { success: true, chunkCount: chunks.length, report };

        } catch (error) {
            logger.error(`Error processing project ${project._id}:`, error);
            try {
                if (sourcePath) await fs.rm(sourcePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
            } catch (cleanupErr) {
                logger.warn(`Failed to cleanup source path ${sourcePath}: ${cleanupErr.message}`);
            }
            throw error;
        }
    }

    async extractZip(filePath) {
        const extractPath = path.join(this.baseDir, `extract-${Date.now()}`);
        fs.ensureDirSync(extractPath);

        const zip = new AdmZip(filePath);
        zip.extractAllTo(extractPath, true);

        return extractPath;
    }

    async cloneRepo(repoUrl, token) {
        const clonePath = path.join(this.baseDir, `repo-${Date.now()}`);
        fs.ensureDirSync(clonePath);

        let finalUrl = repoUrl;
        if (token) {
            try {
                const urlObj = new URL(repoUrl);
                urlObj.username = token;
                finalUrl = urlObj.toString();
            } catch (err) {
                logger.warn("Invalid repo URL format for token injection");
            }
        }

        // Disable terminal prompts so git doesn't hang/crash asking for a password in the background
        const git = simpleGit().env('GIT_TERMINAL_PROMPT', '0');
        await git.clone(finalUrl, clonePath);

        return clonePath;
    }

    async loadDocuments(dirPath) {
        const files = await glob('**/*.{js,jsx,ts,tsx,py,java,go,rs,php,c,cpp,h,hpp,cs,rb,md,json,yaml,yml,html,css}', {
            cwd: dirPath,
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/package-lock.json', '**/yarn.lock', '**/target/**', '**/vendor/**', '**/bin/**', '**/obj/**'],
            nodir: true,
            absolute: true
        });

        logger.info(`Found ${files.length} candidate files for ingestion.`);

        const docPromises = files.map(async (file) => {
            try {
                const content = await fs.readFile(file, 'utf-8');
                const relativePath = path.relative(dirPath, file);

                // Skip extremely large files
                if (content.length > 150000) return null;

                return {
                    pageContent: content,
                    metadata: { source: relativePath }
                };
            } catch (err) {
                logger.warn(`Skipping file ${file}: ${err.message}`);
                return null;
            }
        });

        const docs = await Promise.all(docPromises);
        return docs.filter(doc => doc !== null);
    }
}

export const ingestionService = new IngestionService();
