// src/components/DoctorCard.js

import Link from 'next/link';
import styles from '../styles/DoctorCard.module.css';

export default function DoctorCard({ doctor }) {
  const joinDate = new Date(doctor.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.card}>
      <h3>{doctor.name}</h3>
      <div><strong>Specialization:</strong> <span>{doctor.specialization}</span></div>
      <div><strong>Email:</strong> <span>{doctor.email}</span></div>
      <div><strong>Phone:</strong> <span>{doctor.phone}</span> </div>
      <div><strong>Join Date:</strong> <span>{joinDate}</span> </div>
      <Link href={`/doctor/${doctor._id}`} className={styles.link}>
        View Details
      </Link>
    </div>
  );
}
