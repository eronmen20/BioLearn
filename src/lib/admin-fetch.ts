import { useAuthStore } from "./auth-store";

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().adminToken;
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}
