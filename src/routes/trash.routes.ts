import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { supabase } from "../db/supabase.js";

const router = express.Router();

router.get("/", authenticate, asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_trashed", true)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

export default router;

