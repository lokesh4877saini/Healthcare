'use client'; 

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from '@/styles/DoctorDetailPage.module.css';
const DoctorProfile = ({doctor}) => {
  const router = useRouter();
  const { user } = useAuth();
  // const [doctor,setDoctor] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push('/users/login');
    }
  }, [isMounted, user, router]);

  if (!isMounted) {
    return <h1>Loading...</h1>;
  }
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{doctor.name}</h1>
        <p><strong>Specialization:</strong> {doctor.specialization}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
        {doctor.availableSlots?.length > 0 ? (
          <ul className={styles.slotList}>
            {doctor.availableSlots.map(slot =>
              slot.time?.map((time, idx) => (
                <li key={`${slot._id}-${idx}`} className={styles.slotItem}>
                  <span className={styles.slotDate}>{slot.date} </span>
                  <span className={styles.slotTime}>{time}</span>
                </li>
              ))
            )}
          </ul>
        ) : <p>No available slots.</p>}
      </div>
    </main>
  )
}

export default DoctorProfile;