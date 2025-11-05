// src/lib/serverFetcher.js
export async function serverFetcher(endpoint, options = {}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      cache: "no-store", 
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.message || `API error: ${res.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
