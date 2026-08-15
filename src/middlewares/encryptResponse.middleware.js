import CryptoJS from 'crypto-js';
import logger from '../utils/logger.js';

export const encryptResponse = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        try {
            const secretKey = process.env.ENCRYPTION_SECRET;
            if (secretKey && data) {
                const encryptedData = CryptoJS.AES.encrypt(
                    JSON.stringify(data), 
                    secretKey
                ).toString();
                return originalJson.call(this, { encryptedData });
            }
        } catch (error) {
            logger.error('Response encryption failed', error);
        }
        
        return originalJson.call(this, data);
    };

    next();
};
