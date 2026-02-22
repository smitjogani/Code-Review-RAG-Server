import { BaseRepositoryInterface } from "./interfaces/base.repository.interface.js";

class MongooseRepository extends BaseRepositoryInterface {
    constructor(model) {
        super();
        this.model = model;
    }

    async create(data) {
        return await this.model.create(data);
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findAll(filter = {}) {
        return await this.model.find(filter);
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}

export { MongooseRepository };
