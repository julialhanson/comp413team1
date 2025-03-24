import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStorageConnection() {
    try {
        const storage = new Storage({
            keyFilename: path.resolve(process.cwd(), process.env.GOOGLE_CLOUD_KEYFILE || ''),
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });

        const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;

        console.log('Testing Google Cloud Storage connection...');
        console.log(`Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
        console.log(`Bucket name: ${bucketName}`);

        // List buckets to test authentication
        const [buckets] = await storage.getBuckets();
        console.log('Successfully connected to Google Cloud Storage!');
        console.log('Available buckets:', buckets.map(bucket => bucket.name));

        // Test if we can access our specific bucket
        const bucket = storage.bucket(bucketName!);
        const [exists] = await bucket.exists();

        if (exists) {
            console.log(`Successfully found bucket: ${bucketName}`);

            // Create a test file
            const testBuffer = Buffer.from('Hello, World!', 'utf-8');
            const testFile = bucket.file('test.txt');

            // Upload the test file
            await testFile.save(testBuffer);
            console.log('Successfully uploaded test file!');

            // Delete the test file
            await testFile.delete();
            console.log('Successfully deleted test file!');
        } else {
            console.error(`Bucket ${bucketName} not found!`);
        }
    } catch (error) {
        console.error('Error testing storage connection:', error);
    }
}

testStorageConnection(); 