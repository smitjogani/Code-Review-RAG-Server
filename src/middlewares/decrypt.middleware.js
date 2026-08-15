import CryptoJS from 'crypto-js';
import logger from '../utils/logger.js';

// Decryption middleware
export const decryptPayload = (req, res, next) => {
    // If there is no encrypted data in the body, proceed.
    if (!req.body || !req.body.encryptedData) {
        return next();
    }

    try {
        const secretKey = process.env.ENCRYPTION_SECRET;
        const bytes = CryptoJS.AES.decrypt(req.body.encryptedData, secretKey);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        // Replace req.body with the decrypted payload
        req.body = decryptedData;

        next();
    } catch (error) {
        logger.error('Payload decryption failed:', error);
        res.status(400).json({ success: false, message: 'Invalid payload format or encryption' });
    }
};
