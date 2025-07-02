// src/components/ProfileContent.js
"use client";

import styles from "@/styles/ProfilePage.module.css";

export default function ProfileContent({ user }) {
  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Not Logged In</h1>
        <p className={styles.message}>Please log in to view your profile.</p>
      </div>
    );
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
      <div className={styles.row}>
        <span className={styles.label}>Role:</span>
        <span className={styles.value}>{user.role}</span>
      </div>
      {user.role === 'doctor' && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Specialization:</span>
            <span className={styles.value}>{user.specialization || 'N/A'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>{user.phone || 'N/A'}</span>
          </div>
        </>
      )}
    </div>
  </div>
  
  );
}
