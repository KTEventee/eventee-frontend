export async function apiFetch(url: string, options: any = {}) {
    const token = localStorage.getItem("accessToken");
  
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",  
    });
  }
  