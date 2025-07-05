'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/LoginPage.module.css';
import { fetcher } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetcher('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      // Simulate success
      setMessage('Login successful!');
      if (res.success) {
        login(res.user);
        router.push("/");
      } else {
        setMessage(res.message || "failed to login");
      }
    } catch (err) {
      setMessage('Login failed. Please try again.');
    } finally {
      setFormData({
        email: "",
        password: ""
      })
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Email:</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className={styles.input}
        />

        <label className={styles.label}>Password:</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className={styles.input}
        />

        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
      <div className={styles.orDivider}>
        <span>OR</span>
      </div>
      <Link href="/users/register" className={styles.registerLink}>
        Create an account
      </Link>
      {message && <p className={styles.message}>{message}</p>}
    </main>
  );
}
