import type { Request, Response } from "express";
import { supabase } from "../db/supabase.js";

export const getMe = async (req: Request, res: Response) => {
  const userJwt = (req as any).user as { id: string; email?: string } | undefined;
  if (!userJwt?.id) return res.status(401).json({ error: "Unauthorized" });

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userJwt.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user });
};

