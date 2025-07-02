// src/app/profile/me/page.js
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ProfileContent from "@/components/ProfileContent";
import LoggedOutNotice from "@/components/LoggedOutNotice";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return <LoggedOutNotice />;
  }

  return (
    <section>
      <Suspense fallback={<h1>Loading your profile...</h1>}>
        <ProfileContent user={user} />
      </Suspense>
     </section>
  );
}
