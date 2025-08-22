import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getMe } from "../controllers/me.controller.js";

const router = express.Router();

router.get("/", authenticate, asyncHandler(getMe));

export default router;

