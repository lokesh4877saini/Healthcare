'use client';

import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className={styles.container}>
        <h1 className={styles.heading}>Profile</h1>
        <p className={styles.message}>You are not logged in.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>My Profile</h1>
      <div className={styles.card}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {user.role === 'doctor' && (
          <>
            <p><strong>Specialization:</strong> {user.specialization || 'N/A'}</p>
            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
          </>
        )}
      </div>
    </main>
  );
}
