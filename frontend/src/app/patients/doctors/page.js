// src/app/doctors/page.js
import { serverFetcher } from '@/lib/serverFetcher';
import Alldoctors from './Alldoctors';
export const revalidate = 60; 

export default async function DoctorsPage() {
  const data = await serverFetcher('doctor/lists/all');
  const doctors = data?.doctors;
    return <Alldoctors doctors={doctors} />
}
