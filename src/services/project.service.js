import { BaseService } from './base.service.js';
import { ProjectRepository } from '../repositories/project.repository.js';

class ProjectService extends BaseService {
    constructor() {
        super(new ProjectRepository());
    }

    // Specific business logic
    async processIngestion(projectId) {
        // Logic to trigger RAG pipeline
        // For now just update status
        return await this.updateItem(projectId, { status: "processing" });
    }
}

export { ProjectService };
