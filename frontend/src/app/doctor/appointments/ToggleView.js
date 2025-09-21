"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DoctorAppointmentsBoard from "./view/board/DoctorAppointmentsBoard";
import styles from '@/styles/DoctorBookingsPage.module.css';
import DoctorAppointmentTab from "./view/tab/DoctorAppointmentTab";
import { Grid3x3 } from "@mui/icons-material";
import { RiLayout2Line } from "react-icons/ri";

export default function ToggleAppointmentsPage({bookings}) {
  const [viewMode, setViewMode] = useState("board");
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
            <DoctorAppointmentsBoard bookings={bookings} />
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
            <DoctorAppointmentTab bookings={bookings} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
