import { getCurrentUser } from "@/lib/getCurrentUser";
import ProfileContent from "@/components/ProfileContent";
import LoggedOutNotice from "@/components/LoggedOutNotice";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <LoggedOutNotice/>; // server renders fallback

  return (
    <section>
      <ProfileContent user={user} /> {/* client component */}
    </section>
  );
}
