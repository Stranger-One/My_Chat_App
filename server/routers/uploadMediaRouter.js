import express from "express";
import { upload } from "../middlewares/uploadMedia.js";
import { uploadMedia } from "../controllers/mediaController.js";

const router = express.Router();


router.post('/upload-media', upload.single('file'), uploadMedia)

export default router;