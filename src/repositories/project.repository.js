import { MongooseRepository } from './base.repository.js';
import Project from '../models/project.model.js';

class ProjectRepository extends MongooseRepository {
    constructor() {
        super(Project);
    }

    // Add specific methods created beyond basic CRUD here
    async findByStatus(status) {
        return await this.model.find({ status });
    }
}

export { ProjectRepository };
