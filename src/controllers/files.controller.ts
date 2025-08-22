import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { File } from "../models/types.js";
import { getFileWithAccess, getFolderWithAccess } from "../utils/access.js";

export const uploadFile = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { name, folder_id, content_base64, mime_type } = req.body as {
    name: string;
    folder_id?: string | null;
    content_base64: string; 
    mime_type: string;
  };

  if (!name || !content_base64 || !mime_type) {
    return res.status(400).json({ error: "name, mime_type and content_base64 are required" });
  }

  const storagePath = `${user.id}/${folder_id || "root"}/${Date.now()}_${name}`;

  const { data: storageRes, error: storageErr } = await (supabase.storage as any)
    .from("files")
    .upload(storagePath, Buffer.from(content_base64, "base64"), {
      contentType: mime_type,
      upsert: false,
    });

  if (storageErr) return res.status(500).json({ error: storageErr.message });

  const { data, error } = await supabase
    .from("files")
    .insert([
      {
        name,
        folder_id: folder_id || null,
        owner_id: user.id,
        size: Math.ceil(Buffer.byteLength(content_base64, "base64")),
        mime_type,
        storage_path: storagePath,
        is_trashed: false,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data as File);
};

export const listFiles = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const folder = (req.query.folder as string) || null;

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10) || 20, 100) : 20;
  const offset = req.query.offset ? Math.max(parseInt(req.query.offset as string, 10) || 0, 0) : 0;
  const sort = (req.query.sort as string) || "created_at"; // name | size | created_at
  const order = ((req.query.order as string) || "desc").toLowerCase() === "asc";

  let query = supabase
    .from("files")
    .select("*")
    .eq("owner_id", user.id)
    .is("folder_id", folder)
    .eq("is_trashed", false)
    .order(sort, { ascending: order });

  if (offset) query = (query as any).range(offset, offset + limit - 1);
  else query = (query as any).limit(limit);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data as File[]);
};

export const getSignedUrl = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };
  const file = await getFileWithAccess(user.id, id, "read");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  const { data: signed, error: signErr } = await (supabase.storage as any)
    .from("files")
    .createSignedUrl(file.storage_path, 60 * 10); // 10 minutes
  if (signErr) return res.status(500).json({ error: signErr.message });
  res.json({ url: signed.signedUrl });
};

export const renameFile = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };
  const { name } = req.body as { name: string };
  if (!name) return res.status(400).json({ error: "New name is required" });

  const file = await getFileWithAccess(user.id, id, "write");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  const { data, error } = await supabase
    .from("files")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data as File);
};

export const trashFile = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };

  const file = await getFileWithAccess(user.id, id, "write");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  const { data, error } = await supabase
    .from("files")
    .update({ is_trashed: true })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data as File);
};

export const restoreFile = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };

  const file = await getFileWithAccess(user.id, id, "write");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  const { data, error } = await supabase
    .from("files")
    .update({ is_trashed: false })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data as File);
};

export const deleteFile = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params as { id: string };
  const file = await getFileWithAccess(user.id, id, "delete");
  if (!file) return res.status(404).json({ error: "File not found or no access" });

  const { error: removeErr } = await (supabase.storage as any).from("files").remove([file.storage_path]);
  if (removeErr) return res.status(500).json({ error: removeErr.message });

  const { error: dbErr } = await supabase.from("files").delete().eq("id", id);
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json({ ok: true });
};

