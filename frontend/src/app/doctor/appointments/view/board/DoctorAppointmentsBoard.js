"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "@/styles/DoctorAppointmentsBoard.module.css";
import { DragIndicator } from "@mui/icons-material";
import { motion } from "framer-motion";
import styles1 from "@/styles/NewBookingPage.module.css";
import { AppointmentContent } from "./AppointmentContent";
import { RenderActions } from "./RenderActions";
import { getStatusColor } from "../../getStatusColor";
export default function DoctorAppointmentsBoard({ bookings,onBookingUpdate }) {
    const transformColumn = (column) => ({title: column.title,
        appointments: column.appointments.map((appt) => ({
            id: appt._id,
            patient: appt.patient.name,
            email: appt.patient.email,
            date: appt.date,
            time: appt.time,
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
    const Content = ({ appt, colId,id}) => {
        return (
            <>
                {/* Content */}
                <AppointmentContent
                    patient={appt.patient}
                    email={appt.email}
                    date={appt.date}
                    time={appt.time}
                />

                {/* Action icons */}
                <div style={{ display: "flex", gap: "8px" }}>
                    {<RenderActions columnId={colId} id={id} onBookingUpdate={onBookingUpdate}/>}
                </div>
            </>
        )
    }
    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId) return;

        const sourceAppointments = Array.from(columns[source.droppableId].appointments);
        const destAppointments = Array.from(columns[destination.droppableId].appointments);

        const [moved] = sourceAppointments.splice(source.index, 1);
        destAppointments.splice(destination.index, 0, moved);
        if (source.droppableId !== destAppointments.draggableId) {
            setMessage("Appoitment Updated Successfully")
        }

        setColumns({
            ...columns,
            [source.droppableId]: { ...columns[source.droppableId], appointments: sourceAppointments },
            [destination.droppableId]: { ...columns[destination.droppableId], appointments: destAppointments },
        });
        setTimeout(() => {
            setMessage('');
        }, 3000)
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
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            borderLeft: `5px solid ${getStatusColor(colId)}`,
                                                            padding: "8px",
                                                            marginBottom: "8px",
                                                            background: snapshot.isDragging ? "#0f8" : "#fff",
                                                            ...provided.draggableProps.style,
                                                        }}

                                                    >
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                width: "20px",
                                                                height: "100%",
                                                                borderRadius: "2rem",
                                                                cursor: "grab",
                                                                marginRight: "10px",
                                                                backgroundColor: "#dddd",
                                                            }}
                                                        >
                                                            <DragIndicator style={{
                                                                width: "100%",
                                                                height: "100%"
                                                            }}
                                                                className={styles.grabhandle}
                                                            />
                                                        </div>
                                                        {isMobile ? (
                                                            <div className={styles.contentGraph}>
                                                                <Content appt={appt} colId={colId} id={appt.id} />
                                                            </div>
                                                        ) : (
                                                            <Content appt={appt} colId={colId} id={appt.id} />
                                                        )}
                                                    </div>
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
