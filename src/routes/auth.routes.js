import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import { decryptPayload } from '../middlewares/decrypt.middleware.js';
import { encryptResponse } from '../middlewares/encryptResponse.middleware.js';

const router = express.Router();

router.post('/register', decryptPayload, encryptResponse, registerUser);
router.post('/login', decryptPayload, encryptResponse, loginUser);
router.post('/logout', logoutUser);

export default router;
