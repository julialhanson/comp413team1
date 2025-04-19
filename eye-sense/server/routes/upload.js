import express from "express";
import multer from "multer";
import { authenticateToken } from "../utils/authenticate.js";
import { getSignedUrlFromGCP, uploadImageToGCP } from "../utils/gcp.js";

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get image from GCP storage with a signed url
router.get("/:filename", authenticateToken, async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const { filename } = req.params;
    console.log("filename:", filename);

    const url = getSignedUrlFromGCP(filename);

    res.status(200).json({ signedUrl: url });
  } catch (error) {
    res.status(500).send(`Could not generate signed URL for file ${filename}`);
  }
});

// Upload endpoint
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

router.get('/image-proxy', async (req, res) => {
  const imageUrl = req.query.url;

  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  res.setHeader('Content-Type', response.headers.get('content-type'));
  res.send(Buffer.from(buffer));
});

export default router;
