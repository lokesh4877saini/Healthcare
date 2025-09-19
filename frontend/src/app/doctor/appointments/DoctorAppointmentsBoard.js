"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "@/styles/DoctorAppointmentsBoard.module.css";
import { Delete, DragIndicator, Info, InfoSharp } from "@mui/icons-material";
import { motion } from "framer-motion";
import styles1 from "@/styles/NewBookingPage.module.css";
export default function DoctorAppointmentsBoard({ bookings }) {
    const transformColumn = (column) => ({
        title: column.title,
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
            setIsMobile(window.innerWidth <= 768); // treat <=768px as mobile
        };

        checkScreen(); // run on mount
        window.addEventListener("resize", checkScreen);

        return () => {
            window.removeEventListener("resize", checkScreen);
        };
    }, []);
    const Content = ({appt})=>{
        return(
            <>
        {/* Content */}
        <div style={{ flex: 1 }}>
            <p><strong>{appt.patient}</strong></p>
            <p>{appt.email}</p>
            <p>{appt.date} @ {appt.time}</p>
        </div>

        {/* Action icons */}
        <div style={{ display: "flex", gap: "8px" }}>
            <button
                onClick={() => alert("Edit " + appt.patient)}
                className={styles.info}
            >
                <InfoSharp />
            </button>
            {/* <button onClick={() => alert("Delete " + appt.patient)}><Delete/></button> */}
        </div>
    </>
        )
    }
    const handleDragEnd = (result) => {
        console.log(message);
        const { source, destination } = result;
        console.log(source, destination);
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
    const getStatusColor = (columnId) => {
        switch (columnId) {
            case "upcoming":
                return "#4caf50";
            case "completed":
                return "#2196f3";
            case "cancelled":
                return "#f44336";
            default:
                return "#ccc";
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
                                            {(provided, snapshot) => (
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
                                                        {...provided.dragHandleProps}      // Only drag handle gets dragHandleProps
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
                                                           <Content appt={appt}/>
                                                        </div>
                                                    ) : (
                                                        <Content appt={appt}/>
                                                    )}
                                                </div>
                                            )}
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
