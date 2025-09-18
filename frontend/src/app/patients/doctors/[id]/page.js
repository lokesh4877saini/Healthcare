// src/app/patients/doctors/[id]/page.js
import { fetcher } from '@/lib/api';
import DoctorProfile from './DoctorProfile';
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
    <DoctorProfile doctor={doctor} />
  );
}
