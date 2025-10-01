"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api";
import { formatDate, formatTime24to12 } from "@/lib/formatters";
import styles from "@/styles/ViewBookings.module.css";
import { useRouter } from "next/navigation";
import UpdateBookingModal from "@/lib/BookingModal";
import { useAuth } from "@/context/AuthProvider";
import styles1 from '@/styles/NewBookingPage.module.css';
import LoggedOutNotice from "@/components/LoggedOutNotice";
import CancelAppointment from "@/components/upcomming/cancel/CancelAppointment";
import { appointmentService } from "@/services/appointmentService";

export default function ViewBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookingsByDoctor, setBookingsByDoctor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Modal states
  // const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // const [doctorData, setDoctorData] = useState(null);
  const [openCancel, setOpenCancel] = useState(false);
  const [contentReason, setContentReason] = useState('');
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // {startTime, endTime}
  const [bookingId,setBookingId] = useState(null);
  const [Payload, setDoctorPayload] = useState({
    id: null,
    role: null
  });

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

  if (authLoading) {
    return (
      <main className="LoadingDiv">
        <p className="LoadingPara">Loading...</p>
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
        const firstSlot = res.doctor.availableSlots[0]?.slots?.[0];
        setSelectedDate(firstSlot?.date);
        setSelectedSlot(firstSlot || null);
      } else {
        setError(res.message || "Failed to load doctor data.");
      }
    } catch (err) {
      console.error("Error fetching doctor:", err);
      setError("An error occurred while loading doctor data.");
    }
  };

  const handleCancel = (id) => {
    setOpenCancel(true);
    setBookingId(id);
  }

  const handleSubmitUpdate = async () => {
    if (!selectedBooking || !selectedSlot) return;

    try {
      const res = await fetcher(`booking/reschedule/${selectedBooking._id}`, {
        method: "PUT",
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
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
  const handleCancelSubmit = async () => {
    if (!contentReason.trim()) {
      console.warn("Please provide a reason for cancellation");
      return;
    }

    const { id, role } = Payload;
    const payload = {
      author: id,
      role: role,
      content: contentReason,
    };
    try {
      const result = await appointmentService.cancelAppointment(bookingId, payload);
      if (result?.success) {
        setOpenCancel(false);
        setContentReason('');
        setBookingId(null);
      } else if (result?.error) {
        console.error("Cancellation failed:", result.error);
      }
    } catch (error) {
      console.error("Cancellation error:", error);
    }
  };

  return (
    user ? (<>
      <main className={styles.container}>
        <main className={styles.page}>
          {!loading && Object.keys(bookingsByDoctor).length !== 0 && <h1 className={styles.heading}>Your Appointments</h1>}

          {loading && <main className={styles1.LoadingDiv}>
            <p className={styles1.LoadingPara}>Loading Appointments...</p>
          </main>}
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
                          <span>Time:</span> {`${formatTime24to12(booking.startTime)} - ${formatTime24to12(booking.endTime)}`}
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

          {/* {showModal && doctorData && (
            <UpdateBookingModal
              doctorData={doctorData}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateChange={(date) => {
                setSelectedDate(date);
                const slots = doctorData.availableSlots.find((s) => s.date === date)?.slots || [];
                setSelectedSlot(slots[0] || null);
              }}
              onSlotChange={setSelectedSlot}
              onSubmit={handleSubmitUpdate}
              onClose={() => setShowModal(false)}
            />

          )} */}
          <CancelAppointment
            open_canel={openCancel}
            onClose={() => setOpenCancel(false)}
            note={contentReason}
            onSubmit={handleCancelSubmit}
            setNote={setContentReason}
            error={error}
          />
        </main>
      </main>
    </>) : (<>
      <LoggedOutNotice />
    </>)
  );
}
