'use client'; 

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DoctorCard from '@/components/DoctorCard';
import styles from '@/styles/DoctorsPage.module.css';
import { useRouter } from 'next/navigation';

const Alldoctors = ({ doctors }) => {
  const router = useRouter();
  const { user } = useAuth();
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
    <section className={styles.page}>
      <h1 className={styles.title}>Our Doctors</h1>
      <div className={styles.grid}>
        {doctors.map((doctor) => (
          <div className={styles.card} key={doctor._id}>
            <DoctorCard doctor={doctor} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Alldoctors;
