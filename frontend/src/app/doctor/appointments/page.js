'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/DoctorBookingsPage.module.css';
import { fetcher } from '@/lib/api';
import { formatDate, formatTime24to12 } from '@/lib/formatters';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from "next/navigation";
import UpdateBookingModal from '@/lib/BookingModal';

export default function DoctorBookingsPage() {
const router = useRouter();

  const { user } = useAuth();
  const doctorId = user?._id;
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {

      async function fetchBookings() {
        try {
          const res = await fetcher(`booking/doctor`);
          if (res.success) {
            setBookings(res.bookings);
          } else {
            setError(res.message || "Failed to load bookings.");
          }
        } catch (err) {
          console.error("Error fetching bookings:", err);
          setError("An error occurred while loading bookings.");
        } finally {
          setLoading(false);
        }
      }
      fetchBookings();
  }, []);

  const handleUpdate = async (bookingId, id) => {
    const res = await fetcher(`doctor/${id}`);
    if (res.success) {
      setDoctorData(res.doctor || res);
      setSelectedBooking(bookingId);

      // Pre-select first available date & time
      const firstSlot = res.doctor.availableSlots[0];
      setSelectedDate(firstSlot.date);
      setSelectedTime(firstSlot.time[0]);
      setShowModal(true);
    };
  }
  const handleCancel = async (bookingId) => {
    console.log('Cancel booking:', bookingId);
    try {
      const res = await fetcher(`booking/cancel/${bookingId}`, {
        method: 'DELETE',
      })
      console.log(res);
      if (res.success) {
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSubmitUpdate = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetcher(`booking/reschedule/${selectedBooking}`, {
        method: "PUT",
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.success) {
        setShowModal(false);
        console.log(res);
        router.refresh();
      } else {
        setError(res.message || "Failed to update booking.");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("An error occurred while updating booking.");
    }
  };
  return (
    <main className={styles.container}>
      <h2 className={styles.heading}>Patient Appointments</h2>
      {bookings.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.patient.name}</td>
                  <td>{booking.patient.email}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>{formatTime24to12(booking.time)}</td>
                  <td>
                    <div className={styles.buttonGroup}>
                      <button onClick={() => handleUpdate(booking._id, doctorId)} className={styles.updateButton}>
                        Update
                      </button>
                      <button onClick={() => handleCancel(booking._id)} className={styles.cancelButton}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.noBookings}>You have no appointments scheduled yet.</p>
      )}
      {showModal && doctorData && (
        <UpdateBookingModal
          doctorData={doctorData}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={(date) => {
            setSelectedDate(date);
            const times = doctorData.availableSlots.find((s) => s.date === date)?.time;
            setSelectedTime(times?.[0] || "");
          }}
          onTimeChange={setSelectedTime}
          onSubmit={handleSubmitUpdate}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
