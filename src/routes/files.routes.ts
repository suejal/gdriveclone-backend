import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadFile, listFiles, getSignedUrl, renameFile, trashFile, restoreFile, deleteFile } from "../controllers/files.controller.js";

const router = express.Router();

router.get("/", authenticate, asyncHandler(listFiles));
router.post("/upload", authenticate, asyncHandler(uploadFile));
router.get("/:id/signed-url", authenticate, asyncHandler(getSignedUrl));
router.patch("/:id", authenticate, asyncHandler(renameFile));
router.post("/:id/trash", authenticate, asyncHandler(trashFile));
router.post("/:id/restore", authenticate, asyncHandler(restoreFile));
router.delete("/:id", authenticate, asyncHandler(deleteFile));

export default router;

