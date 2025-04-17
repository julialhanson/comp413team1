import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Debug credentials path
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log('Credentials path:', credentialsPath);
console.log('File exists:', fs.existsSync(credentialsPath));

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: credentialsPath,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);

const bucketName = 'eye-sense-image-data';

// Configure multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const bucket = storage.bucket(bucketName);

        // Create a unique filename
        const timestamp = Date.now();
        const originalName = path.parse(req.file.originalname).name;
        const extension = path.parse(req.file.originalname).ext;
        const filename = `${originalName}-${timestamp}${extension}`;

        // Create a new blob in the bucket and upload the file data
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error('Upload error:', err);
            res.status(500).send('Unable to upload image.');
        });

        blobStream.on('finish', () => {
            // Construct the public URL
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
            res.status(200).json({
                message: 'Upload successful',
                imageUrl: publicUrl,
            });
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error during upload');
    }
});

export default router; 