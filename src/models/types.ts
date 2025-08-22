export type User = {
  id: string;
  email: string;
  name?: string | null;
  created_at: string;
};

export type Folder = {
  id: string;
  name: string;
  owner_id: string;
  parent_folder_id?: string | null;
  created_at: string;
};

export type File = {
  id: string;
  name: string;
  folder_id?: string | null;
  owner_id: string;
  size: number;
  mime_type: string;
  storage_path: string;
  is_trashed: boolean;
  created_at: string;
};

export type Permission = {
  id: string;
  user_id: string;
  file_id?: string | null;
  folder_id?: string | null;
  role: "owner" | "editor" | "viewer";
};