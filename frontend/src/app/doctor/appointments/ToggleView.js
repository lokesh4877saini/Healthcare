"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DoctorAppointmentsBoard from "./view/board/DoctorAppointmentsBoard";
import styles1 from '@/styles/NewBookingPage.module.css';
import styles from '@/styles/DoctorBookingsPage.module.css';
import DoctorAppointmentTab from "./view/tab/DoctorAppointmentTab";
import { Grid3x3 } from "@mui/icons-material";
import { RiLayout2Line } from "react-icons/ri";
import { fetcher } from "@/lib/api";
import { useEffect } from "react";

export default function ToggleAppointmentsPage() {

  const [viewMode, setViewMode] = useState("board");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState({
    upcoming: { title: "Upcoming", appointments: [] },
    completed: { title: "Completed", appointments: [] },
    cancelled: { title: "Cancelled", appointments: [] }
  });
  // memoized fuction for fetch
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetcher('booking/doctor');
      if (res.success) {
        const data = transformData(res.bookings);
        setBookings(prev => ({ ...prev, ...data }));
      } else {
        setError(res.message || "Failed to loead Appoitments");
      }
    } catch (error) {
      console.error("Error fetch appoitments", error);
      setError("An Error occured while loading bookings");
    } finally {
      setLoading(false);
    }
  },[])

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  // callback function to be passed to children
  const handleBookingUpdate = useCallback(()=>{
    fetchBookings(); // re-fetch fresh data
  },[fetchBookings]);
  function transformData(bookings) {
    return bookings.reduce(
      (acc, item) => {
        if (item.status === "scheduled") acc.upcoming.appointments.push(item);
        else if (item.status === "completed") acc.completed.appointments.push(item);
        else if (item.status === "cancel" || item.status === "cancelled") acc.cancelled.appointments.push(item);
        return acc;
      },
      {
        upcoming: { title: "Upcoming", appointments: [] },
        completed: { title: "Completed", appointments: [] },
        cancelled: { title: "Cancelled", appointments: [] },
      }
    );
  }
  if (loading) return <main className={styles1.LoadingDiv}>
    <p className={styles1.LoadingPara}>Loading Appointments...</p>
  </main>
  if (error) return <p className={styles.error}>{error}</p>;
  const buttonStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: active ? "2px solid #4caf50" : "2px solid #ccc",
    backgroundColor: active ? "#e8f5e9" : "#fff",
    cursor: active ? "default" : "pointer",
    fontWeight: active ? "600" : "500",
    transition: "all 0.2s ease-in-out",
  });

  return (
    <div className={styles.appointmentsContainer}>
      {/* Heading */}
      <div className={styles.toggleButtonsContainer}>
        <h2 className={styles.appointmentsTitle}>Appointments</h2>
        <div className={styles.toggleButtonsContainer}>


          {/* Toggle Buttons (absolute position at the bottom-right) */}
          <motion.button
            style={buttonStyle(viewMode === "board")}
            whileHover={{ scale: viewMode === "board" ? 1 : 1.05 }}
            onClick={() => setViewMode("board")}
            disabled={viewMode === "board"}
          >
            <Grid3x3 size={18} />
            Board View
          </motion.button>

          <motion.button
            style={buttonStyle(viewMode === "tabs")}
            whileHover={{ scale: viewMode === "tabs" ? 1 : 1.05 }}
            onClick={() => setViewMode("tabs")}
            disabled={viewMode === "tabs"}
          >
            <RiLayout2Line size={18} />
            Tab View
          </motion.button>
        </div>
      </div>

      {/* Animated View */}
      <AnimatePresence mode="wait">
        {viewMode === "board" ? (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="appointments-view"
          >
            <DoctorAppointmentsBoard
             bookings={bookings}
             onBookingUpdate={handleBookingUpdate}
             />
          </motion.div>
        ) : (
          <motion.div
            key="tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="appointments-view"
          >
            <DoctorAppointmentTab
             bookings={bookings}
             onBookingUpdate={handleBookingUpdate}
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
