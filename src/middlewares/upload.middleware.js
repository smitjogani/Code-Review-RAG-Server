import multer from 'multer';
import path from 'path';
import config from '../config/index.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Parse limit string (e.g. "10mb") to bytes
const parseLimit = (limit) => {
    if (typeof limit === 'number') return limit;
    if (!limit) return 10 * 1024 * 1024; // Default 10MB

    // Simple parser: check if ends with mb or kb
    const lower = limit.toString().toLowerCase();
    if (lower.endsWith('mb')) {
        return parseInt(lower) * 1024 * 1024;
    }
    if (lower.endsWith('kb')) {
        return parseInt(lower) * 1024;
    }
    return parseInt(limit);
};

const fileFilter = (req, file, cb) => {
    // Only accept zip files
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        cb(null, true);
    } else {
        cb(new Error('Only ZIP files are allowed'), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: parseLimit(config.uploadLimit) },
    fileFilter: fileFilter
});
