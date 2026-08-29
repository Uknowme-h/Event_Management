import { api } from "@/api/client";
import type { User } from "@/types";

type AuthData = { user: User; token: string };

export async function loginApi(email: string, password: string): Promise<AuthData> {
  const res = await api<{ status: string; data: AuthData }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function signupApi(
  name: string,
  email: string,
  password: string,
): Promise<AuthData> {
  const res = await api<{ status: string; data: AuthData }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return res.data;
}

export async function meApi(): Promise<User> {
  const res = await api<{ user: User }>("/api/auth/me");
  return res.user;
}
