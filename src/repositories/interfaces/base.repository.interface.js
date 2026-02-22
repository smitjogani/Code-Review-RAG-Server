/**
 * Interface-like structure for Repository
 * Since JS doesn't have interfaces, this serves as a contract.
 */
class BaseRepositoryInterface {
    create(data) { throw new Error("Method not implemented"); }
    findById(id) { throw new Error("Method not implemented"); }
    findAll(filter) { throw new Error("Method not implemented"); }
    update(id, data) { throw new Error("Method not implemented"); }
    delete(id) { throw new Error("Method not implemented"); }
}

export { BaseRepositoryInterface };
