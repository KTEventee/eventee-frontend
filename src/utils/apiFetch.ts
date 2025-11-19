export async function apiFetch(url: string, options: any = {}) {
    const token = localStorage.getItem("accessToken");
  
    const headers: any = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  
    if (options.body && !(options.body instanceof FormData)) {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }
  
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  }
  