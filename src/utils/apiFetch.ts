export async function apiFetch(url: string, options: any = {}) {
    const token = localStorage.getItem("accessToken");
  
    const defaultHeaders = {
      "Content-Type": "application/json",
    };
  
    const headers = {
      ...defaultHeaders,
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  }
  