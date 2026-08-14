import express from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

import rateLimit from 'express-rate-limit';

const router = express.Router();
const controller = new ProjectController();

const createLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 project creations per windowMs
    message: 'Too many projects created from this IP, please try again after 15 minutes'
});

// Use Multer for file upload on create
router.post('/', createLimiter, upload.single('file'), controller.create);
router.post('/:id/chat', controller.chat);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
