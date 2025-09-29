// src/app/patients/doctors/[id]/page.js
import { fetcher } from '@/lib/api';
import styles from '@/styles/DoctorDetailPage.module.css';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { redirect } from 'next/navigation';
import { formatTime24to12 } from '@/lib/formatters';
export default async function DoctorDetailPage({ params }) {
  const { id } = await params;
  let doctor = null;
  try {
    const data = await fetcher(`doctor/${id}`);
    doctor = data?.doctor || null;
  } catch (err) {
    console.error(err);
    doctor = null;
  }

  if (!doctor) return <p>Doctor not found.</p>;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{doctor.name}</h1>
        <p><strong>Specialization:</strong> {doctor.specialization}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
        {doctor.availableSlots?.length > 0 ? (
          <ul className={styles.slotList}>
            {doctor.availableSlots.map((slot) => (
              <li key={slot._id} className={styles.slotItem}>
                <span className={styles.slotDate}>{slot.date}</span>
                {slot.slots?.map((timeSlot, index) =>
                  <p className={styles.slotTime} key={index}>
                    {`${formatTime24to12(timeSlot.startTime)} - ${formatTime24to12(timeSlot.endTime)}`}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : <p>No available slots.</p>}
      </div>
    </main>
  );
}
