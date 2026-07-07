/**
 * Tiny fetch helper that talks to the Express backend.
 *
 * - Prepends NEXT_PUBLIC_API_BASE (e.g. http://localhost:5040)
 * - Always sends the session cookie via credentials: 'include'
 * - Throws on non-2xx with a parsed error message
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5040"
).replace(/\/$/, "");

type Json = Record<string, unknown> | unknown[];

type ApiInit = Omit<RequestInit, "body"> & {
  body?: Json | FormData | string;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /** Field-level messages returned by express-validator / Sequelize. */
  get fields(): { path: string; message: string }[] {
    const d = this.details as { errors?: unknown[]; fields?: unknown[] } | undefined;
    if (!d) return [];
    const arr = (Array.isArray(d.errors) ? d.errors : d.fields) ?? [];
    return arr
      .map((e): { path: string; message: string } | null => {
        if (!e || typeof e !== "object") return null;
        const obj = e as Record<string, unknown>;
        const path = typeof obj.path === "string" ? obj.path : "";
        const message =
          typeof obj.message === "string"
            ? obj.message
            : typeof obj.msg === "string"
              ? obj.msg
              : "";
        if (!path && !message) return null;
        return { path, message: message || "Invalid value" };
      })
      .filter((x): x is { path: string; message: string } => !!x);
  }
}

export async function api<T = unknown>(
  path: string,
  init: ApiInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers = new Headers(init.headers);
  let body: BodyInit | undefined;

  if (init.body instanceof FormData || typeof init.body === "string") {
    body = init.body;
  } else if (init.body !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(init.body);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
    credentials: "include",
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : null) ??
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const API_BASE_URL = API_BASE;
