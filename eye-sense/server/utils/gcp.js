import { Storage } from "@google-cloud/storage";
import { GoogleAuth } from "google-auth-library";
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
const PROJECT_ID = process.env.PROJECT_ID;
const ENDPOINT_ID = process.env.ENDPOINT_ID;

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
      const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
      resolve({
        message: "Upload successful",
        imageUrl,
      });
    });

    blobStream.end(file.buffer);
  });
};

export const getGoogleCloudAccess = async () => {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
    projectId: PROJECT_ID,
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = accessTokenResponse.token;
  return {
    accessToken,
    projectId: PROJECT_ID,
    endpointId: ENDPOINT_ID,
  };
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
};

const getMediaAsBase64 = async (filename, bucketName) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  const chunks = [];

  return new Promise((resolve, reject) => {
    file
      .createReadStream()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString("base64");
        const mimeType = file.metadata?.contentType || "image/png";
        const dataUrl = `data:${mimeType};base64,${base64}`;
        resolve(base64);
      })
      .on("error", (err) => {
        console.error("Error reading file:", err);
        reject(err);
      });
  });
};

export const getSignedUrlForImage = async (filename) => {
  return await getSignedUrlFromGCP(filename, BUCKET_NAME);
};

export const getSignedUrlForHeatmap = async (filename) => {
  return await getSignedUrlFromGCP(filename, HEATMAP_BUCKET_NAME);
};

export const uploadImageToGCP = async (file, filename) => {
  return await uploadToGCP(BUCKET_NAME, file, filename);
};

export const uploadHeatmapToGCP = async (file, filename) => {
  return await uploadToGCP(HEATMAP_BUCKET_NAME, file, filename);
};

export const getImageAsBase64 = async (filename) => {
  return await getMediaAsBase64(filename, BUCKET_NAME);
};

export const getHeatmapAsBase64 = async (filename) => {
  return await getMediaAsBase64(filename, HEATMAP_BUCKET_NAME);
};
