import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { supabase } from "../db/supabase.js";
import { getFileWithAccess, getFolderWithAccess } from "../utils/access.js";

const router = express.Router();

router.patch("/files/:id/move", authenticate, asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };
  const { new_folder_id } = req.body as { new_folder_id: string | null };

  const file = await getFileWithAccess(user.id, id, "write");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  if (new_folder_id) {
    const folder = await getFolderWithAccess(user.id, new_folder_id, "read");
    if (!folder) return res.status(404).json({ error: "Target folder not found or no access" });
  }

  const { data, error } = await supabase
    .from("files")
    .update({ folder_id: new_folder_id })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

router.patch("/folders/:id/move", authenticate, asyncHandler(async (req: import('express').Request, res: import('express').Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };
  const { new_parent_id } = req.body as { new_parent_id: string | null };

  const folder = await getFolderWithAccess(user.id, id, "write");
  if (!folder) return res.status(404).json({ error: "Folder not found or no access" });

  if (new_parent_id) {
    const parent = await getFolderWithAccess(user.id, new_parent_id, "write");
    if (!parent) return res.status(404).json({ error: "Target parent folder not found or no access" });
  }

  const { data, error } = await supabase
    .from("folders")
    .update({ parent_folder_id: new_parent_id })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

export default router;

