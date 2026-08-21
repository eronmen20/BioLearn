let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let res = await fetch(url, {
    ...options,
    credentials: "same-origin",
  });

  if (res.status === 401 && url !== "/api/auth/refresh") {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      res = await fetch(url, {
        ...options,
        credentials: "same-origin",
      });
    }
  }

  return res;
}
