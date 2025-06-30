// src/app/doctors/[id]/page.js
import { fetcher } from '@/lib/api';
import styles from '@/styles/DoctorDetailPage.module.css';

export default async function DoctorDetailPage({ params }) {
  const { id } = params;
  let doctor;
  try {
    const data = await fetcher(`doctor/${id}`);
    doctor = data.doctor;
  } catch (error) {
    console.error(error);
    return <p>Failed to load doctor details.</p>;
  }

  if (!doctor) {
    return <p>No doctor found.</p>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{doctor.name}</h1>
        <p><strong>Specialization:</strong> {doctor.specialization}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
        {doctor.availableSlots?.length > 0 ? (
          <div>
            <h3>Available Slots:</h3>
            <ul className={styles.slotList}>
              {doctor.availableSlots.map((slot) =>
                Array.isArray(slot.time)
                  ? slot.time.map((timeValue, idx) => {
                    if (!timeValue || typeof timeValue !== 'string' || !timeValue.trim()) {
                      return null; // Skip empty times
                    }

                    // Make sure time has seconds
                    let timePart = timeValue;
                    if (/^\d{2}:\d{2}$/.test(timePart)) {
                      timePart += ':00';
                    }

                    const dateObj = new Date(`${slot.date}T${timePart}`);
                    if (isNaN(dateObj)) return null;

                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                    });

                    const formattedTime = dateObj.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <li key={`${slot._id}-${idx}`} className={styles.slotItem}>
                        <span className={styles.slotDate}>{formattedDate}</span>{' '}
                        <span className={styles.slotTime}>{formattedTime}</span>
                      </li>
                    );
                  })
                  : null
              )}
            </ul>
          </div>
        ) : (
          <div>
            <h3>No Slots Available</h3>
            <p>Please check back later for availability.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export const dynamicParams = true;
export const revalidate = 60; // ISR
