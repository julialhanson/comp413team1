import multer from "multer";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

// Debug credentials path
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log("Credentials path:", credentialsPath);
console.log("File exists:", fs.existsSync(credentialsPath));

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: credentialsPath,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

console.log("Project ID:", process.env.GOOGLE_CLOUD_PROJECT_ID);

const BUCKET_NAME = process.env.BUCKET_NAME;
const HEATMAP_BUCKET_NAME = process.env.HEATMAP_BUCKET_NAME;

const uploadToGCP = async (bucketName, file, filename) => {
  const bucket = storage.bucket(bucketName);
  const image = bucket.file(filename);

  const [imageExists] = await image.exists();
  if (imageExists) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const blobStream = image.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("Upload error:", err);
      reject(new Error("Unable to upload image."));
    });

    blobStream.on("finish", () => {
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      resolve({
        message: "Upload successful",
        imageUrl,
      });
    });

    blobStream.end(file.buffer);
  });
};

const getSignedUrlFromGCP = async (filename, bucketName) => {
  if (!filename) {
    return null;
  }

  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options);

  return url;
}

export const getSignedUrlForImage = async (filename) => {
  return await getSignedUrlFromGCP(filename, BUCKET_NAME)
};

export const getSignedUrlForHeatmap = async (filename) => {
  return await getSignedUrlFromGCP(filename, HEATMAP_BUCKET_NAME)
};

export const uploadImageToGCP = async (file, filename) => {
  return await uploadToGCP(BUCKET_NAME, file, filename);
};

export const uploadHeatmapToGCP = async (file, filename) => {
  return await uploadToGCP(HEATMAP_BUCKET_NAME, file, filename);
};