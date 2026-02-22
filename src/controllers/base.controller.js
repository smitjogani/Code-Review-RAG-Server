import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class BaseController {
    constructor(service) {
        this.service = service;
    }

    create = asyncHandler(async (req, res) => {
        const result = await this.service.createItem(req.body);
        res.status(201).json(new ApiResponse(201, result, "Created successfully"));
    });

    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await this.service.getItemById(id);
        if (!result) {
            return res.status(404).json(new ApiResponse(404, null, "Not Found"));
        }
        res.status(200).json(new ApiResponse(200, result, "Fetched successfully"));
    });

    getAll = asyncHandler(async (req, res) => {
        const result = await this.service.getAllItems(req.query);
        res.status(200).json(new ApiResponse(200, result, "Fetched all successfully"));
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await this.service.updateItem(id, req.body);
        if (!result) {
            return res.status(404).json(new ApiResponse(404, null, "Not Found"));
        }
        res.status(200).json(new ApiResponse(200, result, "Updated successfully"));
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await this.service.deleteItem(id);
        res.status(200).json(new ApiResponse(200, null, "Deleted successfully"));
    });
}

export { BaseController };
