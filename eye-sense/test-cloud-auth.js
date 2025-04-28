import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage();

async function listBuckets() {
    try {
        const [buckets] = await storage.getBuckets();
        console.log('Buckets:');
        buckets.forEach(bucket => {
            console.log(bucket.name);
        });
    } catch (error) {
        console.error('Error listing buckets:', error);
    }
}

listBuckets();