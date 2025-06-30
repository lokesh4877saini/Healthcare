"use client";

import styles from "@/styles/UpdateBookingModal.module.css";
import { formatDate, formatTime24to12 } from "@/lib/formatters";

export default function UpdateBookingModal({
    doctorData,
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange,
    onSubmit,
    onClose,
}) {
    const getTimesForSelectedDate = () => {
        const slot = doctorData?.availableSlots.find((s) => s.date === selectedDate);
        return slot?.time || [];
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Update Appointment</h2>
                <p>
                    <strong>Doctor:</strong> Dr. {doctorData?.name}
                </p>
                <p>
                    <strong>Specialization:</strong> {doctorData?.specialization}
                </p>

                <div className={styles.formGroup}>
                    <label>
                        Select Date:
                        <select
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                        >
                            {doctorData?.availableSlots.map((slot) => (
                                <option key={slot._id} value={slot.date}>
                                    {formatDate(slot.date)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                {getTimesForSelectedDate().length > 0 ? (<>
                    <div className={styles.formGroup}>
                        <label>
                            Select Time:
                            <select
                                value={selectedTime}
                                onChange={(e) => onTimeChange(e.target.value)}
                            >
                                {getTimesForSelectedDate().map((time) => (
                                    <option key={time} value={time}>
                                        {formatTime24to12(time)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </>) : (<>
                    no timing available
                </>)

                }
                <div className={styles.buttonGroup}>
                    <button className={styles.saveBtn} onClick={onSubmit}>
                        Save
                    </button>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
