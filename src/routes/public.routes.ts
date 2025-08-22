import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { resolveShare } from "../controllers/shares.controller.js";

const router = express.Router();

router.get("/s/:token", asyncHandler(resolveShare));

export default router;

