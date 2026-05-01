const TOKEN_KEY = "northline_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  return typeof env === "string" && env.length > 0 ? env.replace(/\/$/, "") : "";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const t = getStoredToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, credentials: "include" });
  } catch {
    throw new ApiError(0, "Network error. Please check your connection and try again.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      if (!res.ok) {
        throw new ApiError(res.status, `Request failed (${res.status})`);
      }
      return undefined as T;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}
