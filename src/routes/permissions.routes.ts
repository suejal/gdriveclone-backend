import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { grantPermission, listPermissions, revokePermission } from "../controllers/permissions.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(grantPermission));
router.get("/", authenticate, asyncHandler(listPermissions));
router.delete("/:id", authenticate, asyncHandler(revokePermission));

export default router;

