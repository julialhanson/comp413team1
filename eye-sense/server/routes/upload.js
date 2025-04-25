import express from "express";
import multer from "multer";
import { authenticateToken } from "../utils/authenticate.js";
import {
  getGoogleCloudAccess,
  getHeatmapAsBase64,
  getImageAsBase64,
  getSignedUrlForImage,
  uploadHeatmapToGCP,
  uploadImageToGCP,
} from "../utils/gcp.js";

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.get("/access", async (req, res) => {
  try {
    const googleCloudAccess = await getGoogleCloudAccess();

    res.status(200).send(googleCloudAccess);
  } catch (error) {
    console.error("Error getting access token:", error);
    res.status(500).send("Server error getting access token");
  }
});

// Get image from GCP storage with a signed url
router.get("/:filename", authenticateToken, async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const { filename } = req.params;
    console.log("filename:", filename);

    const url = await getSignedUrlForImage(filename);

    res.status(200).json({ signedUrl: url });
  } catch (error) {
    res.status(500).send(`Could not generate signed URL for file ${filename}`);
  }
});

// Get image from GCP storage as base 64
router.get("/images/:filename/base64", authenticateToken, async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const { filename } = req.params;
    console.log("filename:", filename);

    const base64 = await getImageAsBase64(filename);

    res.status(200).json({ base64 });
  } catch (error) {
    res.status(500).send(`Could not generate base64 for image ${filename}`);
  }
});

// Get image from GCP storage as base 64
router.get(
  "/heatmaps/:filename/base64",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("req.params:", req.params);
      const { filename } = req.params;
      console.log("filename:", filename);

      const base64 = await getHeatmapAsBase64(filename);

      res.status(200).json({ base64 });
    } catch (error) {
      res.status(500).send(`Could not generate base64 for heatmap ${filename}`);
    }
  }
);

// Upload image to GCP endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const result = await uploadImageToGCP(req.file, req.body.filename);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error during upload");
  }
});

// Upload heatmap to GCP endpoint
router.post("/heatmap", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const result = await uploadHeatmapToGCP(req.file, req.body.filename);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error during upload");
  }
});

router.get("/image-proxy", async (req, res) => {
  const imageUrl = req.query.url;

  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  res.setHeader("Content-Type", response.headers.get("content-type"));
  res.send(Buffer.from(buffer));
});

export default router;
