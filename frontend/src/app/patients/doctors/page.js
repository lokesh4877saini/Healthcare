// src/app/doctors/page.js
import { fetcher } from '@/lib/api';
import DoctorCard from '@/components/DoctorCard';
import styles from '@/styles/DoctorsPage.module.css';
import { getCurrentUser } from '@/lib/getCurrentUser';
import LoggedOutNotice from '@/components/LoggedOutNotice';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function DoctorsPage() {
  const user = await getCurrentUser();
  if(!user) return <LoggedOutNotice/>
  const { doctors } = await fetcher('doctor/lists/all');
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
