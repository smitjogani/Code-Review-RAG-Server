import { BaseController } from './base.controller.js';
import { ProjectService } from '../services/project.service.js';
import { ingestionService } from '../services/rag/ingestion.service.js';
import { chatService } from '../services/rag/chat.service.js';
import { getDemoChatResponse } from '../data/demoResponses.js';
import { validateProject } from '../validators/project.validator.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

class ProjectController extends BaseController {
    constructor() {
        super(new ProjectService());
    }

    create = asyncHandler(async (req, res) => {
        // Merge file path if uploaded
        const payload = {
            ...req.body,
            filePath: req.file ? req.file.path : undefined
        };

        const { error, value } = validateProject(payload);
        if (error) {
            // Cleanup file if validation fails
            // (Ideally unlink file here)
            throw new ApiError(400, "Validation Error", error.details);
        }

        // Create Project Entry in DB
        const project = await this.service.createItem(value);

        // Trigger Asset Ingestion (Async)
        ingestionService.processProject(project).then((result) => {
            // Update status AND store analytics report
            this.service.updateItem(project._id, {
                status: "completed",
                analysisReport: result.report
            });
        }).catch((err) => {
            console.error("Ingestion Failed:", err);
            this.service.updateItem(project._id, { status: "failed" });
        });

        res.status(201).json(
            new ApiResponse(201, project, "Project created and processing started")
        );
    });

    chat = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { question } = req.body;

        if (!question) {
            throw new ApiError(400, "Question is required");
        }

        // Verify project exists
        const project = await this.service.getItemById(id);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        if (project.metadata?.demo) {
            const result = getDemoChatResponse(question);
            return res.status(200).json(
                new ApiResponse(200, result, "Demo answer generated successfully")
            );
        }

        // Get answer from RAG pipeline
        const result = await chatService.getAnswer(id.toString(), question); // Use string ID for map lookup

        // (Future: Save Q&A history)

        res.status(200).json(
            new ApiResponse(200, result, "Answer generated successfully")
        );
    });

    // Override getById to return project details with report if completed
    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await this.service.getItemById(id);
        if (!result) {
            return res.status(404).json(new ApiResponse(404, null, "Not Found"));
        }
        res.status(200).json(new ApiResponse(200, result, "Fetched successfully"));
    });
}

export { ProjectController };
