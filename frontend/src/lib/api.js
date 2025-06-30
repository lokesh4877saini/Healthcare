// src/lib/api.js
export async function fetcher(endpoint, options = {}) {
  console.log(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      credentials: 'include', 
      ...options,
    });
    return res.json();
  }
  