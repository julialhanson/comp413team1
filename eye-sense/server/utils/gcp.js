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
const PROJECT_ID = process.env.PROJECT_ID;
const ENDPOINT_ID = process.env.ENDPOINT_ID;

export const getSignedUrlFromGCP = async (filename) => {
  if (!filename) {
    return null;
  }

  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await storage
    .bucket(BUCKET_NAME)
    .file(filename)
    .getSignedUrl(options);

  return url;
};

export const uploadImageToGCP = async (file, filename) => {
  const bucket = storage.bucket(BUCKET_NAME);
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
