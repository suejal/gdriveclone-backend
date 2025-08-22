import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createShare, listShares, revokeShare } from "../controllers/shares.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createShare));
router.get("/", authenticate, asyncHandler(listShares));
router.delete(":id", authenticate, asyncHandler(revokeShare));

export default router;

