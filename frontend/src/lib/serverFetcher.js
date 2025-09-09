// src/lib/serverFetcher.js
export async function serverFetcher(endpoint, options = {}) {
    const res = await fetch(`${process.env.API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store", // avoid stale data
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }