const TOKEN_KEY = "biolearn-admin-token";

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    // SSR or storage error
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}
