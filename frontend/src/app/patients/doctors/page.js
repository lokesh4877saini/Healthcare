// src/app/doctors/page.js
import DoctorCard from '@/components/DoctorCard';
import styles from '@/styles/DoctorsPage.module.css';
import { serverFetcher } from '@/lib/serverFetcher';

export const revalidate = 60; 

export default async function DoctorsPage() {
  const { doctors = [] } = await serverFetcher('doctor/lists/all');
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
