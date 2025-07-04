"use client";

import { useEffect, useState } from 'react';
import styles from '@/styles/DoctorBookingsPage.module.css';
import { fetcher } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoggedOutNotice from '@/components/LoggedOutNotice';
import { formatDate, formatTime24to12 } from '@/lib/formatters';
import { useRouter } from "next/navigation";
import UpdateBookingModal from '@/lib/BookingModal';

export default function DoctorBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const doctorId = user?._id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
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
    };
    fetchBookings();
  }, []);
  if (!user) return <LoggedOutNotice />;
  const handleUpdate = async (bookingId) => {
    try {
      const res = await fetcher(`doctor/${doctorId}`);
      if (!res.success) {
        setError(res.message || "Failed to fetch doctor data.");
        return;
      }

      if (!res.doctor.availableSlots?.length) {
        alert("No available slots to reschedule.");
        return;
      }

      setDoctorData(res.doctor);
      setSelectedBooking(bookingId);
      setSelectedDate(res.doctor.availableSlots[0].date);
      setSelectedTime(res.doctor.availableSlots[0].time[0]);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching doctor data:", err);
      setError("An error occurred while fetching doctor data.");
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const res = await fetcher(`booking/cancel/${bookingId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        // Refresh bookings after cancel
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        setError(res.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while cancelling booking.");
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
        router.refresh();
      } else {
        setError(res.message || "Failed to update booking.");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("An error occurred while updating booking.");
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

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
                      <button
                        onClick={() => handleUpdate(booking._id)}
                        className={styles.updateButton}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className={styles.cancelButton}
                      >
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
