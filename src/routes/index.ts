import express from "express";
import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ msg: "Cloud Drive API Running 🚀" });
});

router.get(
  "/ping-supabase",
  asyncHandler(async (_req: Request, res: Response) => {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true, data });
  })
);

export default router;