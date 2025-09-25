'use client'
import { ChangeCircleOutlined, InfoRounded, CancelOutlined, ChangeCircleRounded, InfoOutline, Help, HelpOutline, Cancel, NoteAdd, NoteAddOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import useCreateReschedule from "@/hooks/Appointments/useCreateReschedule";
import { HoverIconButton } from "./HoverIconButton";
import { appointmentService } from "@/services/appointmentService";
import RescheduleDialog from "@/components/upcomming/Reschedule/RescheduleDialog";
import RescheduleConfirmPopup from "@/components/upcomming/Reschedule/RescheduleConfirmPopup";
import CancelAppointment from "@/components/upcomming/cancel/CancelAppointment";
import AddNoteAppointment from "@/components/upcomming/AddNote/AddNoteAppointment";
import CompleteCard from "@/components/completed/CompleteCard";
import CancelledCard from "@/components/cancelled/CompleteCard";

export const RenderActions = ({ columnId, id, onBookingUpdate, onBookingAction }) => {
    const appointmentId = id;
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState(['']);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [contentReason, setContentReason] = useState('');
    const [openCancel, setOpenCancel] = useState(false);
    const [viewCompleteAppointmentOpen, setViewCompleteAppointmentOpen] = useState(false);
    const [viewCancelledAppoitmentOpen, setviewCancelledAppoitmentOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openAddNote, setOpenAddNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [doctorPayload, setDoctorPayload] = useState({
        id: null,
        role: null
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setDoctorPayload({
                    id: parsedUser._id,
                    role: parsedUser.role,
                });
            }
        }
    }, []);
    useEffect(() => {
        let ignore = false;
        async function fetchSlots() {
            try {
                const res = await appointmentService.getDoctorSlots();
                if (!ignore && res.success) {
                    setAvailableSlots(res.availableSlots);
                }
            } catch (error) {
                console.error("Failed to fetch slots:", error);
            }
        }
        fetchSlots();
        return () => { ignore = true; }; // cleanup to prevent re-runs
    }, []);


    useEffect(() => {
        setDate(new Date());
    }, []);

    const { loading, error, submitReschedule, clearError } = useCreateReschedule();

    const handleRescheduleSubmit = async () => {
        clearError();
        const res = await submitReschedule({
            bookingId: appointmentId,
            date,
            time: timeSlots[0],
            forceCreateSlot: false,
        });

        if (res?.conflict) {
            setShowConfirmPopup(true);
        } else if (res?.success) {
            setOpen(false);
            // Refresh after successful reschedule
            if (onBookingAction) {
                await onBookingAction('refresh', appointmentId);
            } else if (onBookingUpdate) {
                onBookingUpdate();
            }
        }
    };

    const handleForceCreate = async () => {
        clearError();
        const res = await submitReschedule({
            bookingId: appointmentId,
            date,
            time: timeSlots[0],
            forceCreateSlot: true,
        });

        if (res?.success) {
            setShowConfirmPopup(false);
            setOpen(false);
            // Refresh after successful reschedule
            if (onBookingAction) {
                await onBookingAction('refresh', appointmentId);
            } else if (onBookingUpdate) {
                onBookingUpdate();
            }
        }
    };

    const handleCancel = () => {
        setOpenCancel(true);
    }

    const handleCancelSubmit = async () => {
        if (!contentReason.trim()) {
            console.warn("Please provide a reason for cancellation");
            return;
        }

        const { id, role } = doctorPayload;
        const payload = {
            author: id,
            role: role,
            content: contentReason,
        };
        try {
            if (onBookingAction) {
                const result = await onBookingAction('cancel', appointmentId, payload);
                if (result?.success) {
                    setOpenCancel(false);
                    setContentReason('');
                } else if (result?.error) {
                    console.error("Cancellation failed:", result.error);
                }
            } else if (onBookingUpdate) {
                // Fallback to legacy approach
                const res = await appointmentService.cancelAppointment(appointmentId, payload);
                if (res.success) {
                    setOpenCancel(false);
                    onBookingUpdate();
                    setContentReason('');
                }
            }
        } catch (error) {
            console.error("Cancellation error:", error);
        }
    };

    const handleAddNote = async () => {
        const res = await appointmentService.getAppointmentsById(appointmentId);
        const {success,booking} =res;
        if(success){
            const {notes} = booking;
            if(notes){
                setNoteContent(notes);
            }
        }
        setOpenAddNote(true);
    }

    const handleAddNoteSubmit = async () => {
        console.log("NoteContent => ",noteContent)
        // if (!noteContent.trim()) {
        //     console.warn("Please provide a note for completion");
        //     return;
        // }
        const { id, role } = doctorPayload;
        const payload = {
            author: id,
            role: role,
            content: noteContent[0].content || noteContent,
        };
        try {
            if (onBookingAction) {
                // const result = await onBookingAction('updateNote', appointmentId, payload);
                if (result?.success) {
                    setOpenAddNote(false);
                    setNoteContent('');
                } else if (result?.error) {
                    console.error("Completion failed:", result.error);
                }
            } else if (onBookingUpdate) {
                // Fallback to legacy approach
                const res = await appointmentService.updateNoteBooking(appointmentId, payload);
                if (res.success) {
                    setOpenAddNote(false);
                    onBookingUpdate();
                    setNoteContent('');
                }
            }
        } catch (error) {
            console.error("Completion error:", error);
        }
    };

    const handleCancelled = async () => {
        try {
            const res = await appointmentService.getAppointmentsById(appointmentId);

            if (res?.booking) {
                const booking = res.booking;

                const mappedAppointment = {
                    patient: booking.patient?.name || "Unknown Patient",
                    email: booking.patient?.email || "N/A",
                    phone: booking.patient?.phone || "",
                    date: new Date(booking.date).toLocaleDateString(),
                    time: booking.time,
                    status: booking.status,
                    cancelledBy: booking.cancelledBy || null,
                    cancelledAt: booking.cancelledAt || null,
                    notes: booking.notes?.map(n => ({
                        content: n.content,
                        author: n.author?.name || "",
                        role: n.role,
                    })) || []
                };

                setSelectedAppointment(mappedAppointment);
                setviewCancelledAppoitmentOpen(true);
            }
        } catch (error) {
            console.error("Error fetching appointment:", error);
        }
    };


    const handleReshedule = () => {
        setOpen(true);
    }

    const handleTimeChange = (index, value) => {
        const newSlots = [...timeSlots];
        newSlots[index] = value;
        setTimeSlots(newSlots);
    };

    const handleViewDetails = async () => {
        const res = await appointmentService.getAppointmentsById(appointmentId);
        if (res?.booking) {
            const booking = res.booking;

            const mappedAppointment = {
                patient: booking.patient?.name || "Unknown Patient",
                email: booking.patient?.email || "N/A",
                phone: booking.patient?.phone || "",
                date: new Date(booking.date).toLocaleDateString(),
                time: booking.time,
                status: booking.status,
                notes: booking.notes?.map(n => ({
                    content: n.content,
                    author: n.author?.name || "",
                    role: n.role
                })) || []
            };
            setSelectedAppointment(mappedAppointment);
            setViewCompleteAppointmentOpen(true);
        };
    }
    const bookedDates = availableSlots.map(item => item?.date);

    switch (columnId) {
        case "completed":
            return (
                <div style={{ display: "flex", gap: "8px" }}>
                    <HoverIconButton
                        defaultIcon={InfoOutline}
                        hoverIcon={InfoRounded}
                        title={"view detail"}
                        color="blue"
                        hoverColor="darkblue"
                        onClick={handleViewDetails}
                    />
                    {viewCompleteAppointmentOpen && selectedAppointment && (
                        <CompleteCard
                            appointment={selectedAppointment}
                            onClose={() => setViewCompleteAppointmentOpen(false)}
                        />
                    )}
                </div>
            );

        case "cancelled":
            return (
                <div style={{ display: "flex", gap: "8px" }}>
                    <HoverIconButton
                        defaultIcon={HelpOutline}
                        hoverIcon={Help}
                        title={"reason"}
                        color="red"
                        hoverColor="darkred"
                        onClick={handleCancelled}
                    />
                    {viewCancelledAppoitmentOpen && selectedAppointment && (
                        <CancelledCard
                            appointment={selectedAppointment}
                            onClose={() => setviewCancelledAppoitmentOpen(false)}
                        />
                    )}
                </div>
            );

        default:
            return (
                <div style={{ display: "flex" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <HoverIconButton
                            defaultIcon={ChangeCircleOutlined}
                            hoverIcon={ChangeCircleRounded}
                            color="green"
                            title={"Reschedule"}
                            hoverColor="darkgreen"
                            onClick={handleReshedule}
                        />
                        <HoverIconButton
                            defaultIcon={CancelOutlined}
                            hoverIcon={Cancel}
                            color="red"
                            title={"Cancel"}
                            hoverColor="darkred"
                            onClick={handleCancel}
                        />
                        <HoverIconButton
                            defaultIcon={NoteAdd}
                            hoverIcon={NoteAddOutlined}
                            color="green"
                            title={"edit notes"}
                            hoverColor="lightgreen"
                            onClick={handleAddNote}
                        />
                    </div>

                    <RescheduleDialog
                        open={open}
                        onClose={() => { setOpen(false); clearError(); }}
                        onSubmit={handleRescheduleSubmit}
                        date={date}
                        setDate={setDate}
                        timeSlots={timeSlots}
                        handleTimeChange={handleTimeChange}
                        addTimeSlot={null}
                        isHideButton={true}
                        confirmationPopup={showConfirmPopup && (
                            <RescheduleConfirmPopup
                                onCancel={() => setShowConfirmPopup(false)}
                                onConfirm={handleForceCreate}
                            />
                        )}
                        bookedDates={bookedDates}
                        error={error}
                    />
                    <CancelAppointment
                        open_canel={openCancel}
                        onClose={() => setOpenCancel(false)}
                        note={contentReason}
                        onSubmit={handleCancelSubmit}
                        setNote={setContentReason}
                        error={error}
                    />
                    <AddNoteAppointment
                        openAddNote={openAddNote}
                        onClose={() => setOpenAddNote(false)}
                        note={noteContent}
                        onSubmit={handleAddNoteSubmit}
                        setNote={setNoteContent}
                        error={error}
                    />
                </div>
            );
    }
};