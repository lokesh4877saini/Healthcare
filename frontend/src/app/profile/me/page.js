import { getCurrentUser } from "@/lib/getCurrentUser";
import ProfileContent from "@/components/ProfileContent";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <p>Not logged in</p>; // server renders fallback

  return (
    <section>
      <ProfileContent user={user} /> {/* client component */}
    </section>
  );
}
