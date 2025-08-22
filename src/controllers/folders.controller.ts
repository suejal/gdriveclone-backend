import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Folder } from "../models/types.js";

export const createFolder = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { name, parent_folder_id }: { name: string; parent_folder_id?: string | null } = req.body;
  if (!name) return res.status(400).json({ error: "Folder name is required" });

  const { data, error } = await supabase
    .from("folders")
    .insert([{ name, owner_id: user.id, parent_folder_id: parent_folder_id || null }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data as Folder);
};

export const listFolders = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parent = (req.query.parent as string) || null;

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10) || 50, 100) : 50;
  const offset = req.query.offset ? Math.max(parseInt(req.query.offset as string, 10) || 0, 0) : 0;
  const sort = (req.query.sort as string) || "created_at";
  const order = ((req.query.order as string) || "desc").toLowerCase() === "asc";

  let query = supabase
    .from("folders")
    .select("*")
    .eq("owner_id", user.id)
    .is("parent_folder_id", parent)
    .order(sort, { ascending: order });

  if (offset) query = (query as any).range(offset, offset + limit - 1);
  else query = (query as any).limit(limit);

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data as Folder[]);
};

export const renameFolder = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { name } = req.body as { name: string };
  if (!name) return res.status(400).json({ error: "New name is required" });

  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Folder not found" });
  res.json(data as Folder);
};

export const deleteFolder = async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

