'use client';

import { useState } from 'react';
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from '@/styles/SignupPage.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    phone: '',
  });
  const [message, setMessage] = useState('');

  const isDoctor = formData.role === 'doctor';

  async function handleSubmit(e) {
    e.preventDefault();
    let payload = { ...formData };
    if (formData.role !== 'doctor') {
      // Remove doctor-specific fields for patients
      delete payload.specialization;
      delete payload.phone;
    }
    try {
      const res = await fetcher('register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setMessage('Registration successful! Please log in.');
        router.push('/users/login'); // correct path!
      } else {
        // Show error message from backend if available
        setMessage(res.message || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormData(
        {
          name: '',
          email: '',
          password: '',
          role: 'patient',
          specialization: '',
          phone: '',
        }
        
        )
        setTimeout(()=>{
          setMessage('');
        },3000)
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Sign Up</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>Name:</label>
        <input
          className={styles.input}
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <label className={styles.label}>Email:</label>
        <input
          className={styles.input}
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <label className={styles.label}>Password:</label>
        <input
          className={styles.input}
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <label className={styles.label}>Role:</label>
        <select
          className={styles.select}
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        {isDoctor && (
          <>
            <label className={styles.label}>Specialization:</label>
            <input
              className={styles.input}
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
            />

            <label className={styles.label}>Phone:</label>
            <input
              className={styles.input}
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </>
        )}

        <button type="submit" className={styles.submitButton}>
          Register
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </main>

  );
}
