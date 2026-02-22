import express from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();
const controller = new ProjectController();

// Use Multer for file upload on create
router.post('/', upload.single('file'), controller.create);
router.post('/:id/chat', controller.chat);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
