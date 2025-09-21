import { ChangeCircleOutlined, InfoRounded, CancelOutlined, ChangeCircleRounded, InfoOutline, Help, HelpOutline, Cancel } from "@mui/icons-material";
import { useEffect, useState } from "react";
import useCreateReschedule from "@/hooks/useCreateReschedule";
import { HoverIconButton } from "./HoverIconButton";
import { fetcher } from "@/lib/api";
import RescheduleDialog from "@/components/Reschedule/RescheduleDialog";
import RescheduleConfirmPopup from "@/components/Reschedule/RescheduleConfirmPopup";
export const RenderActions = ({ columnId, id }) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState(['']);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [ismount, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
        fetchSlots();
    }, []);
    useEffect(() => {
        setDate(new Date());
    }, []);
    async function fetchSlots() {
        const res = await fetcher('doctor/slots');
        if (res.success) setAvailableSlots(res.availableSlots);
    }
    const {
        loading,
        error,
        result,
        submitReschedule,
        clearError
    } = useCreateReschedule();
    console.log(result);
    const handleRescheduleSubmit = async () => {
        clearError();
        const res = await submitReschedule({
          bookingId: id,
          date,
          time: timeSlots[0],
          forceCreateSlot: false,
        });
      
        if (res?.conflict) {
          setShowConfirmPopup(true);
        } else if (res?.success) {
          setOpen(false);
        }
      };
      
      const handleForceCreate = async () => {
        clearError();
        const res = await submitReschedule({
          bookingId: id,
          date,
          time: timeSlots[0],
          forceCreateSlot: true,
        });
      
        if (res?.success) {
          setShowConfirmPopup(false);
          setOpen(false);
        }
      };
      
    const handleCancel = () => {
        alert("Cancel", columnId)
    }
    const handleViewDetails = () => {
        alert("View Details", columnId);
    }
    const handleCanclled = () => {
        alert("Canclled", columnId);
    }
    const handleReshedule = () => {
        setOpen(true)
    }
    const handleTimeChange = (index, value) => {
        const newSlots = [...timeSlots];
        newSlots[index] = value;
        setTimeSlots(newSlots);
    };
    const bookedDates = availableSlots.map(item => item?.date)
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
                        onClick={() => handleViewDetails()}
                    />
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
                        onClick={() => handleCanclled()}
                    />
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
                    </div>

                    <RescheduleDialog
                        open={open}
                        onClose={() => {setOpen(false);clearError();}}
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
                </div>
            );
    }
};