import express from "express";
import multer from "multer";
import { uploadFileToS3 } from "../services/s3_service.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const url = await uploadFileToS3(file);
    res.status(200).json({ message: "File uploaded successfully", url });
  } catch (error) {
    res.status(500).json({ error: "Error uploading file", details: error.message });
  }
});

export default router;
