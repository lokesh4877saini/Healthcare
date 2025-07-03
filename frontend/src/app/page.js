'use client';

import styles from '@/styles/HomePage.module.css';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const DOCTORS = [
  { "_id": "1", "name": "Dr. John Deo", "specialization": "Cardiologist", "phone": "+1-555-123-4567", "email": "john.doe@example.com" },
  { "_id": "2", "name": "Dr. Alice Smith", "specialization": "Dermatologist", "phone": "+1-555-987-6543", "email": "alice.smith@example.com" },
  { "_id": "3", "name": "Dr. Raj Patel", "specialization": "Neurologist", "phone": "+1-555-222-3333", "email": "raj.patel@example.com" }
];

const PATIENTS = [
  { "_id": "1", "name": "Jane Doe", "email": "jane.doe@example.com" },
  { "_id": "2", "name": "Bob Johnson", "email": "bob.johnson@example.com" },
  { "_id": "3", "name": "Sara Lee", "email": "sara.lee@example.com" }
];

export default function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Welcome to the Healthcare App</h1>
          <p className={styles.subtitle}>Book appointments with trusted doctors, anytime.</p>
          <Link href="#banner" className={styles.cta}>Book Appointment</Link>
        </div>
      </section>

      <section className={styles.featuredSection}>
        <h2 id="banner" className={styles.sectionTitle}>Meet Our Trusted Doctors</h2>
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          className={styles.swiper}
          breakpoints={{
            768: { slidesPerView: 1 },
            1024: { slidesPerView: 3 }
          }}
        >
          {DOCTORS.map((doctor) => (
            <SwiperSlide key={doctor._id}>
              <div className={styles.card}>
                <h3>{doctor.name}</h3>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Contact:</strong> {doctor.phone}</p>
                <p><strong>Email:</strong> {doctor.email}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <h2 className={styles.sectionTitle}>Our Happy Patients</h2>
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          className={styles.swiper}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {PATIENTS.map((patient) => (
            <SwiperSlide key={patient._id}>
              <div className={styles.card}>
                <h3>{patient.name}</h3>
                <p><strong>Email:</strong> {patient.email}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </main>
  );
}
