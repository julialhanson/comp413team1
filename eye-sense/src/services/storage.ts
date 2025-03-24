import { Storage } from '@google-cloud/storage';

// Initialize storage
const storage = new Storage({
    keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'your-bucket-name';
const bucket = storage.bucket(bucketName);

export const uploadImage = async (file: File): Promise<string> => {
    try {
        const blob = bucket.file(file.name);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.type,
            },
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                reject(error);
            });

            blobStream.on('finish', async () => {
                // Make the file public
                await blob.makePublic();

                // Get the public URL
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
                resolve(publicUrl);
            });

            // Convert File to Buffer and write to stream
            const reader = new FileReader();
            reader.onload = () => {
                const buffer = Buffer.from(reader.result as ArrayBuffer);
                blobStream.end(buffer);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    } catch (error) {
        console.error('Error uploading to Google Cloud Storage:', error);
        throw error;
    }
}; 