"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api";
import { formatDate, formatTime24to12 } from "@/lib/formatters";
import styles from "@/styles/ViewBookings.module.css";
import { useRouter } from "next/navigation";
import UpdateBookingModal from "@/lib/BookingModal";
import { useAuth } from "@/context/AuthProvider";
import LoggedOutNotice from "@/components/LoggedOutNotice";

export default function ViewBookingsPage() {
  const { user,loading:authLoading } = useAuth();
  const router = useRouter();
  const [bookingsByDoctor, setBookingsByDoctor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);
  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await fetcher("booking/my");
      if (res.success) {
        const grouped = {};
        res.bookings.forEach((booking) => {
          const docId = booking.doctor._id;
          if (!grouped[docId]) {
            grouped[docId] = {
              doctor: booking.doctor,
              bookings: [],
            };
          }
          grouped[docId].bookings.push(booking);
        });
        setBookingsByDoctor(grouped);
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

  if(authLoading){
    return (
      <main>
        <p>Loading...</p>
      </main>
    )
  }

  const handleUpdate = async (booking, doctorId) => {
    try {
      const res = await fetcher(`doctor/${doctorId}`);
      if (res.success) {
        setDoctorData(res.doctor || res);
        setSelectedBooking(booking);

        // Pre-select first available date & time
        const firstSlot = res.doctor.availableSlots[0];
        setSelectedDate(firstSlot.date);
        setSelectedTime(firstSlot.time[0]);
        setShowModal(true);
      } else {
        setError(res.message || "Failed to load doctor data.");
      }
    } catch (err) {
      console.error("Error fetching doctor:", err);
      setError("An error occurred while loading doctor data.");
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const res = await fetcher(`booking/cancel/${bookingId}`, {
        method: "DELETE",
      });
      if (res.success) {
        await fetchBookings();
      } else {
        setError(res.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("An error occurred while cancelling booking.");
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetcher(`booking/reschedule/${selectedBooking._id}`, {
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
        await fetchBookings();
      } else {
        setError(res.message || "Failed to update booking.");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("An error occurred while updating booking.");
    }
  };
  return (
    user ? (<>
      <main className={styles.container}>
        <main className={styles.page}>
        {!loading && Object.keys(bookingsByDoctor).length !== 0 && <h1 className={styles.heading}>Your Appointments</h1>}

          {loading && <p className={styles.loading}>Loading bookings...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {!loading && Object.keys(bookingsByDoctor).length === 0 && (
            <main className={styles.page}>
              <div className={styles.emptyState}>
                <h2>No Appointments Yet</h2>
                <p>Looks like you have not booked any appointments.</p>
                <p>Ready to find a doctor and book your first slot?</p>
                <button
                  className={styles.ctaButton}
                  onClick={() => router.push('new-booking')}
                >
                  Book an Appointment
                </button>
              </div>
            </main>

          )}

          <div className={styles.doctorGrid}>
            {Object.entries(bookingsByDoctor).map(([doctorId, group]) => (
              <div key={doctorId} className={styles.doctorCard}>
                <h2 className={styles.doctorName}>Dr. {group.doctor.name}</h2>
                <p className={styles.specialization}>
                  {group.doctor.specialization}
                </p>

                <div className={styles.bookingGrid}>
                  {group.bookings.map((booking) => (
                    <div key={booking._id} className={styles.bookingCard}>
                      <div className={styles.details}>
                        <p>
                          <span>Date:</span> {formatDate(booking.date)}
                        </p>
                        <p>
                          <span>Time:</span> {formatTime24to12(booking.time)}
                        </p>
                        <p className={styles.timestamp}>
                          {booking.updatedAt && booking.updatedAt !== booking.createdAt ? "Updated:" : "Created:"}{" "}
                          {new Date(
                            booking.updatedAt && booking.updatedAt !== booking.createdAt
                              ? booking.updatedAt
                              : booking.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className={styles.buttonGroup}>
                        <button
                          className={styles.buttonPrimary}
                          onClick={() => handleUpdate(booking, group.doctor._id)}
                        >
                          Update
                        </button>
                        <button
                          className={styles.buttonDanger}
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

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
      </main>
    </>) : (<>
      <LoggedOutNotice />
    </>)
  );
}
