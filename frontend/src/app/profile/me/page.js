import { getCurrentUser } from "@/lib/getCurrentUser";
import ProfileContent from "@/components/ProfileContent";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <section>
      <ProfileContent  /> 
    </section>
  );
}
