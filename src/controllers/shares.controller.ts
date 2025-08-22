import type { Request, Response } from "express";
import crypto from "node:crypto";
import { supabase } from "../db/supabase.js";

export const createShare = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { file_id, folder_id, role = "viewer", expires_in } = req.body as {
    file_id?: string | null;
    folder_id?: string | null;
    role?: "viewer" | "editor";
    expires_in?: number; 
  };

  if (!file_id && !folder_id) {
    return res.status(400).json({ error: "Provide file_id or folder_id" });
  }
  if (file_id && folder_id) {
    return res.status(400).json({ error: "Provide only one of file_id or folder_id" });
  }

  const token = crypto.randomBytes(24).toString("base64url");
  const expires_at = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null;

  const { data, error } = await supabase
    .from("shares")
    .insert([{ token, file_id: file_id || null, folder_id: folder_id || null, role, expires_at, created_by: user.id }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ share: data, url: `/s/${token}` });
};

export const listShares = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { file_id, folder_id } = req.query as { file_id?: string; folder_id?: string };
  let query = supabase.from("shares").select("*").eq("created_by", user.id);
  if (file_id) query = query.eq("file_id", file_id);
  if (folder_id) query = query.eq("folder_id", folder_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ shares: data });
};

export const revokeShare = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { error } = await supabase.from("shares").delete().eq("id", id).eq("created_by", user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

export const resolveShare = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { data: share, error } = await supabase.from("shares").select("*").eq("token", token).single();
  if (error) return res.status(404).json({ error: "Invalid link" });
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return res.status(410).json({ error: "Link expired" });
  }
  if (share.file_id) {
    const { data: file, error: ferr } = await supabase.from("files").select("*").eq("id", share.file_id).single();
    if (ferr || !file) return res.status(404).json({ error: "File not found" });
    const { data: signed, error: signErr } = await (supabase.storage as any)
      .from("files")
      .createSignedUrl(file.storage_path, 60 * 10);
    if (signErr) return res.status(500).json({ error: signErr.message });
    return res.json({ type: "file", role: share.role, url: signed.signedUrl, name: file.name, mime_type: file.mime_type, size: file.size });
  }
  if (share.folder_id) {
    const [folders, files] = await Promise.all([
      supabase.from("folders").select("*").eq("parent_folder_id", share.folder_id),
      supabase.from("files").select("*").eq("folder_id", share.folder_id).eq("is_trashed", false),
    ]);
    const err1 = (folders as any).error;
    const err2 = (files as any).error;
    if (err1) return res.status(500).json({ error: err1.message });
    if (err2) return res.status(500).json({ error: err2.message });
    return res.json({ type: "folder", role: share.role, folders: (folders as any).data, files: (files as any).data });
  }
  res.status(400).json({ error: "Malformed share" });
};

