import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";

export const search = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const q = (req.query.q as string) || "";
  if (!q) return res.json({ files: [], folders: [] });

  const [files, folders] = await Promise.all([
    supabase
      .from("files")
      .select("*")
      .eq("owner_id", user.id)
      .eq("is_trashed", false)
      .ilike("name", `%${q}%`),
    supabase
      .from("folders")
      .select("*")
      .eq("owner_id", user.id)
      .ilike("name", `%${q}%`),
  ]);

  const filesErr = (files as any).error;
  const foldersErr = (folders as any).error;
  if (filesErr) return res.status(500).json({ error: filesErr.message });
  if (foldersErr) return res.status(500).json({ error: foldersErr.message });

  res.json({ files: (files as any).data || [], folders: (folders as any).data || [] });
};

