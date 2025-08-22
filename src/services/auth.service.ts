import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../db/supabase.js";
import { JWT_SECRET } from "../config/env.js";

export const registerUser = async (email: string, password: string, name?: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, name }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
  if (error || !user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user };
};
