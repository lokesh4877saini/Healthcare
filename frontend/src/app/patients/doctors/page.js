// src/app/doctors/page.js
import DoctorCard from '@/components/DoctorCard';
import styles from '@/styles/DoctorsPage.module.css';
import { serverFetcher } from '@/lib/serverFetcher';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { redirect } from 'next/navigation';

export const revalidate = 60; 

export default async function DoctorsPage() {
  const user = await getCurrentUser();
  if(!user){
    redirect('/users/login');
  }
  const data = await serverFetcher('doctor/lists/all');
  const doctors = data?.doctors ?? [];
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
}
