class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async createItem(data) {
        return await this.repository.create(data);
    }

    async getItemById(id) {
        return await this.repository.findById(id);
    }

    async getAllItems(filter) {
        return await this.repository.findAll(filter);
    }

    async updateItem(id, data) {
        return await this.repository.update(id, data);
    }

    async deleteItem(id) {
        return await this.repository.delete(id);
    }
}

export { BaseService };
