"use client";
import { useAuth } from "@/context/AuthProvider";
import styles1 from '@/styles/NewBookingPage.module.css';
import LoggedOutNotice from "./LoggedOutNotice";
import styles from "@/styles/ProfilePage.module.css";

export default function ProfileContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className={styles1.LoadingDiv}>
    <p className={styles1.LoadingPara}>Loading...</p>
</main>
  }

  if (!user) {
    return <LoggedOutNotice />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Profile</h1>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Name:</span>
          <span className={styles.value}>{user.name}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        {user.role === "doctor" && (
          <>
            <div className={styles.row}>
              <span className={styles.label}>Specialization:</span>
              <span className={styles.value}>{user.specialization || "N/A"}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{user.phone || "N/A"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
