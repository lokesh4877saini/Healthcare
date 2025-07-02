// app/(auth)/logged-out/page.tsx
import Link from 'next/link';
import styles from '@/styles/LoggedOutNotice.module.css';
import { FaHome, FaLock } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";
import { RiShieldKeyholeLine } from "react-icons/ri";

export default function LoggedOutNotice() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <RiShieldKeyholeLine />
        </div>
        
        <h1 className={styles.heading}>Session Ended</h1>
        <p className={styles.message}>
          You have been securely logged out. Would you like to return home or sign in again?
        </p>

        <div className={styles.actions}>
          <Link href="/" className={`${styles.button} ${styles.homeButton}`}>
            <FaHome /> <span>Return Home</span>
          </Link>
          <Link href="/users/login" className={`${styles.button} ${styles.loginButton}`}>
            <IoLogIn /> <span>Sign In</span>
          </Link>
        </div>

        <div className={styles.securityTip}>
          <FaLock className={styles.tipIcon} />
          <p className={styles.tipText}>
          Tip: For your security, always remember to log out when using a public device.
          </p>
        </div>
      </div>
    </main>
  );
}