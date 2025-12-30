"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DoctorAppointmentsBoard from "./view/board/DoctorAppointmentsBoard";
import styles1 from '@/styles/NewBookingPage.module.css';
import styles from '@/styles/DoctorAppointmentsPage.module.css';
import DoctorAppointmentTab from "./view/tab/DoctorAppointmentTab";
import { Grid3x3 } from "@mui/icons-material";
import { RiLayout2Line } from "react-icons/ri";
import { useAppointments } from "@/hooks/Appointments/useAppointments";

export default function ToggleAppointmentsPage() {
  const [viewMode, setViewMode] = useState("board");

  // Use the custom hook
  const {
    Appointments,
    loading,
    error,
    fetchAppointments,
    cancelBooking,
    updateNoteBooking ,
    updateAppointmentStatus,
  } = useAppointments('doctor');
  // Transform data to match your component's expected format
  const transformAppointmentsData = (appointments) => ({
    upcoming: {
      title: "Upcoming",
      appointments: appointments.upcoming || []
    },
    completed: {
      title: "Completed",
      appointments: appointments.completed || []
    },
    cancelled: {
      title: "Cancelled",
      appointments: appointments.cancelled || []
    }
  });

  // Handle actions from child components
  const handleBookingAction = async (action, bookingId, data) => {
    switch (action) {
      case 'cancel':
        const cancelResult = await cancelBooking(bookingId, data);
        if (cancelResult.success) {
        } else {
          console.error('Cancellation failed:', cancelResult.error);
        }
        break;

      case 'updateNote':
        const NoteResult = await updateNoteBooking(bookingId, data);
        if (NoteResult.success) {
        } else {
          console.error('Completion failed:', NoteResult.error);
        }
        break;

      case 'updateStatus':
        const updateStatusReuslt = await updateAppointmentStatus(bookingId, data);
        if (updateStatusReuslt.success) { }
        else {
          console.error('Completion failed:', updateStatusReuslt.error);
        }

      case 'refresh':
        await fetchAppointments();
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  // Legacy callback for backward compatibility
  const handleBookingUpdate = () => {
    fetchAppointments();
  };

  if (loading) return (
    <main className={styles1.LoadingDiv}>
      <p className={styles1.LoadingPara}>Loading Appointments...</p>
    </main>
  );

  if (error) return <p className={styles.error}>{error}</p>;

  const transformedAppointments = transformAppointmentsData(Appointments);

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
      <div className={styles.toggleButtonsContainer}>
        <h2 className={styles.appointmentsTitle}>Appointments</h2>
        <div className={styles.toggleButtonsContainer}>
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
              Appointments={transformedAppointments}
              onBookingUpdate={handleBookingUpdate}
              onBookingAction={handleBookingAction}
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
            {/* <DoctorAppointmentTab
              Appointments={transformedAppointments}
              onBookingUpdate={handleBookingUpdate}
              onBookingAction={handleBookingAction}
            /> */}
            {/* <DoctorAppointmentTab
              Appointments={transformedAppointments}
              onBookingUpdate={handleBookingUpdate}
              onBookingAction={handleBookingAction}
            /> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}