import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Permission } from "../models/types.js";

export const grantPermission = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { target_user_id, file_id, folder_id, role } = req.body as {
    target_user_id: string;
    file_id?: string | null;
    folder_id?: string | null;
    role: "viewer" | "editor" | "owner";
  };

  if (!target_user_id || (!file_id && !folder_id) || !role) {
    return res.status(400).json({ error: "target_user_id, role, and one of file_id/folder_id are required" });
  }

  const { data, error } = await supabase
    .from("permissions")
    .insert([{ user_id: target_user_id, file_id: file_id || null, folder_id: folder_id || null, role }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data as Permission);
};

export const listPermissions = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { file_id, folder_id } = req.query as { file_id?: string; folder_id?: string };

  const query = supabase.from("permissions").select("*");
  if (file_id) query.eq("file_id", file_id);
  if (folder_id) query.eq("folder_id", folder_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data as Permission[]);
};

export const revokePermission = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { error } = await supabase.from("permissions").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

