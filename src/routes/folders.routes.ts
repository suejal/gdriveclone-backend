import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createFolder, listFolders, renameFolder, deleteFolder } from "../controllers/folders.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createFolder));
router.get("/", authenticate, asyncHandler(listFolders));
router.patch("/:id", authenticate, asyncHandler(renameFolder));
router.delete("/:id", authenticate, asyncHandler(deleteFolder));

export default router;

