"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "@/styles/DoctorAppointmentsBoard.module.css";
import { ChangeCircleOutlined, InfoRounded, DragIndicator, CancelOutlined, ChangeCircleRounded, InfoOutline, Help, HelpOutline, Cancel } from "@mui/icons-material";
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
    const Content = ({ appt, colId }) => {
        console.log(colId)
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
                    {renderActions(colId)}
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

    // Modular Appointment Content
    const AppointmentContent = ({ patient, email, date, time }) => {
        return (
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                }}
            >
                <p style={{ margin: 0, fontWeight: 600 }}>{patient}</p>
                <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>{email}</p>
                <p style={{ margin: 0, color: "#777", fontSize: "0.85rem" }}>
                    {date} @ {time}
                </p>
            </div>
        );
    };

    // HoverIconButton
    const HoverIconButton = ({ defaultIcon: DefaultIcon, hoverIcon: HoverIcon, color, hoverColor, onClick }) => {
        const [hover, setHover] = useState(false);

        return (
            <button
                style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={onClick}
            >
                {hover ? (
                    <HoverIcon style={{ fontSize: 28, color: hoverColor || color, transition: "color 0.2s ease" }} />
                ) : (
                    <DefaultIcon style={{ fontSize: 28, color, transition: "color 0.2s ease" }} />
                )}
            </button>
        );
    };

    // renderActions
    const renderActions = (columnId) => {
        switch (columnId) {
            case "completed":
                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <HoverIconButton
                            defaultIcon={InfoOutline}
                            hoverIcon={InfoRounded}
                            color="blue"
                            hoverColor="darkblue"
                            onClick={() => console.log("View details clicked")}
                        />
                    </div>
                );

            case "cancelled":
                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <HoverIconButton
                            defaultIcon={HelpOutline}
                            hoverIcon={Help}
                            color="red"
                            hoverColor="darkred"
                            onClick={() => console.log("Reason clicked")}
                        />
                    </div>
                );

            default:
                return (
                    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                        <HoverIconButton
                            defaultIcon={ChangeCircleOutlined}
                            hoverIcon={ChangeCircleRounded}
                            color="green"
                            hoverColor="darkgreen"
                            onClick={() => console.log("Reschedule clicked")}
                        />
                        <HoverIconButton
                            defaultIcon={CancelOutlined}
                            hoverIcon={Cancel}
                            color="red"
                            hoverColor="darkred"
                            onClick={() => console.log("Cancel clicked")}
                        />
                    </div>
                );
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
                                                                <Content appt={appt} colId={colId} />
                                                            </div>
                                                        ) : (
                                                            <Content appt={appt} colId={colId} />
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
