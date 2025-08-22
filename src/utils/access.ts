import { supabase } from "../db/supabase.js";

type Action = "read" | "write" | "delete";

type Role = "owner" | "editor" | "viewer";

const can = (role: Role, action: Action) => {
  if (role === "owner") return true;
  if (role === "editor") return action === "read" || action === "write";
  if (role === "viewer") return action === "read";
  return false;
};

export const getFileWithAccess = async (userId: string, fileId: string, action: Action) => {

  const { data: owned } = await supabase.from("files").select("*").eq("id", fileId).eq("owner_id", userId).maybeSingle();
  if (owned) return owned;

  const { data: perm, error } = await supabase
    .from("permissions")
    .select("role")
    .eq("user_id", userId)
    .eq("file_id", fileId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!perm) return null;
  return can(perm.role as Role, action)
    ? (await supabase.from("files").select("*").eq("id", fileId).single()).data
    : null;
};

export const getFolderWithAccess = async (userId: string, folderId: string, action: Action) => {
  const { data: owned } = await supabase.from("folders").select("*").eq("id", folderId).eq("owner_id", userId).maybeSingle();
  if (owned) return owned;
  const { data: perm, error } = await supabase
    .from("permissions")
    .select("role")
    .eq("user_id", userId)
    .eq("folder_id", folderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!perm) return null;
  return can(perm.role as Role, action)
    ? (await supabase.from("folders").select("*").eq("id", folderId).single()).data
    : null;
};

