const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    }
  });
  if (!response.ok) {
    let message = "Request failed. Please try again.";
    try {
      const data = await response.json();
      message = data?.detail?.message ?? data?.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/plain")) {
    return (await response.text()) as T;
  }
  return response.json() as Promise<T>;
}

export function apiUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE}${path.replace(/^\/api/, "")}`;
}
