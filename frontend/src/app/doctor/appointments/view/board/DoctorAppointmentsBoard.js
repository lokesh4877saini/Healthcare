"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "@/styles/DoctorAppointmentsBoard.module.css";
import { motion } from "framer-motion";
import styles1 from "@/styles/NewBookingPage.module.css";
import { AppointmentCard } from "./AppointmentCard.js";
export default function DoctorAppointmentsBoard({ bookings, onBookingUpdate, onBookingAction }) {
    const transformColumn = (column) => ({

        title: column.title,
        appointments: column.appointments.map((appt) => ({
            id: appt._id,
            patient: appt.patient.name,
            email: appt.patient.email,
            date: appt.date,
            time: appt.time,
            status: appt.status,
        })),
    });
    const transformColumns = (bookings) => ({
        upcoming: transformColumn(bookings.upcoming),
        completed: transformColumn(bookings.completed),
        cancelled: transformColumn(bookings.cancelled),
    });
    const [columns, setColumns] = useState(transformColumns(bookings));
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreen(); // run on mount
        window.addEventListener("resize", checkScreen);
        return () => {
            window.removeEventListener("resize", checkScreen);
        };
    }, []);
    const allowedMoves = {
        upcoming: ["completed", "cancelled"],  // from upcoming you can go to these
        completed: [],                         // nothing allowed
        cancelled: ["upcoming"],               // can reactivate
    };
    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId) return;

        const from = source.droppableId;
        const to = destination.droppableId;

        if (!allowedMoves[from]?.includes(to)) {
            setError(`You cannot move an appointment from ${from} to ${to}`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        // Move locally for instant UI feedback
        const sourceAppointments = Array.from(columns[from].appointments);
        const destAppointments = Array.from(columns[to].appointments);
        const [moved] = sourceAppointments.splice(source.index, 1);
        moved.status = to;
        destAppointments.splice(destination.index, 0, moved);

        setColumns({
            ...columns,
            [from]: { ...columns[from], appointments: sourceAppointments },
            [to]: { ...columns[to], appointments: destAppointments },
        });

        // Call backend generic status update
        try {
            const payload = { status: to }; // "completed" or "cancelled"
            const result = await onBookingAction('updateStatus', moved.id, payload);
            console.log(result)
            if (result?.success) {
                setMessage("Appointment updated successfully");
            } else {
                setError(result?.error || "Failed to update appointment");
                // Optionally, revert the local UI move here
            }
        } catch (err) {
            console.error("Update status error:", err);
            setError("Failed to update appointment");
        } finally {
            setTimeout(() => {
                setMessage("");
                setError("");
            }, 3000);
        }
    };


    return (
        <>
            <div className={styles.container}>
                <motion.div
                    className={styles1.messageWrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: error || message ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {error && <div className={styles1.error}>{error}</div>}
                    {message && <p className={styles1.success}>{message}</p>}
                </motion.div>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className={styles.board}>
                    {Object.entries(columns).map(([colId, col]) => (
                        <Droppable key={colId} droppableId={colId}>
                            {(provided) => (
                                <div
                                    className={styles.column}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{col.title}</h2>
                                    {col.appointments.map((appt, index) => (
                                        <Draggable key={appt.id} draggableId={appt.id} index={index}>
                                            {(provided, snapshot) => {
                                                return (
                                                    <AppointmentCard
                                                        appt={appt}
                                                        colId={colId}
                                                        provided={provided}
                                                        snapshot={snapshot}
                                                        isMobile={isMobile}
                                                        status={appt.status}
                                                        onBookingUpdate={onBookingUpdate}
                                                    />
                                                )
                                            }}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </>
    );
}
