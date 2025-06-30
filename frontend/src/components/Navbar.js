"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { IoLogIn,IoLogOut } from "react-icons/io5";
import { useEffect, useState } from "react";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <nav className={styles.navbar}>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>Home</Link>

        {user ? (
          <>
            {user.role === "doctor" && (
              <>
                <Link href="/doctor/appointments" className={styles.link}>View Bookings</Link>
                <Link href="/doctor/slots" className={styles.link}>Manage Slots</Link>
              </>
            )}

            {user.role === "patient" && (
              <>
                <Link href="/patients/new-booking" className={styles.link}>Book Appointment</Link>
                <Link href="/patients/view-bookings" className={styles.link}>My Bookings</Link>
              </>
            )}

            <button title="logout" onClick={logout} className={styles.linkBtn}><IoLogOut/></button>
          </>
        ) : (
          <>
            {user && <Link href="/profile/me" className={styles.link}>Profile</Link>}
            <Link href="/users/login" title="login" className={styles.linkBtn}><IoLogIn/></Link>
            <Link href="/users/register" className={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
