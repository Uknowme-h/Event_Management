const TOKEN_KEY = "eventapp.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};
  if (options?.body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server");
  }

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; details?: { path: string; message: string }[] } } | null)?.error;

    // A 401 while we had a token means the session expired — auto-logout.
    // Login/signup never carry a token so this branch is never hit by them.
    if (res.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event("auth:logout"));
    }

    throw new ApiError(
      res.status,
      err?.code ?? "ERROR",
      err?.message ?? "Something went wrong",
      err?.details,
    );
  }

  return json as T;
}
