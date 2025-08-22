import dotenv from "dotenv";

dotenv.config();

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_ANON_KEY",
  "JWT_SECRET"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "";
export const JWT_SECRET = process.env.JWT_SECRET!;