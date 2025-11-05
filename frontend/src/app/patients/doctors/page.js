// src/app/doctors/page.js
import { serverFetcher } from '@/lib/serverFetcher';
import Alldoctors from './Alldoctors';
export const revalidate = 60; 

export default async function DoctorsPage() {
  try {
    const data = await serverFetcher('doctor/lists/all');
    const doctors = data?.doctors || [];
    
    return <Alldoctors doctors={doctors} />;
  } catch (error) {
    // console.error("Failed to fetch doctors:", error.message);
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <p>{error.message}</p>
      </div>
    );
  }
}
