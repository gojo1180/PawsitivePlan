const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pawsitive-plan.vercel.app";

/**
 * Standard fetch wrapper that automatically injects the Supabase JWT token
 * from localStorage into the Authorization header for protected backend routes.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Gracefully handle SSR token checks
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
  }

  return response.json();
}
