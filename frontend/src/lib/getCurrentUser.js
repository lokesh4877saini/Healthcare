import { cookies } from 'next/headers';
import { serverFetcher } from './serverFetcher';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const res = await serverFetcher(`me`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    return res.success ? res.user : null;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}
