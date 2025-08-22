import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", authenticate, asyncHandler(search));

export default router;

