"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api";
import { useRouter } from "next/navigation";
import styles from '@/styles/NewBookingPage.module.css';
import { formatDate, formatTime24to12 } from "@/lib/formatters";

export default function NewBookingPage() {
    const router = useRouter();
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [message, setMessage] = useState('');

    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSpecializations() {
            try {
                const { success, doctors } = await fetcher("doctor/lists/all");
                if (success && doctors) {
                    const uniqueSpecs = [...new Set(doctors.map(doc => doc.specialization))]
                        .filter(Boolean)
                        .sort();
                    setSpecializations(uniqueSpecs);
                }
            } catch (err) {
                setError("Failed to load specializations");
                console.error(err);
            }
        }
        fetchSpecializations();
    }, []);

    useEffect(() => {
        if (selectedSpecialization) {
            setLoadingDoctors(true);
            setError("");
            async function fetchDoctors() {
                try {
                    const res = await fetcher(`doctor?specialization=${encodeURIComponent(selectedSpecialization)}`);
                    if (res.success) {
                        setDoctors(res.doctors || []);
                    } else {
                        setError(res.message || "Failed to load doctors");
                    }
                } catch (err) {
                    setError("Failed to load doctors");
                    console.error(err);
                } finally {
                    setLoadingDoctors(false);
                }
            }
            fetchDoctors();
        } else {
            setDoctors([]);
        }
        setSelectedDoctor("");
        setSelectedDate("");
        setSelectedTime("");
        setAvailableDates([]);
        setAvailableTimes([]);
    }, [selectedSpecialization]);

    useEffect(() => {
        if (selectedDoctor) {
            const doctor = doctors.find(doc => doc._id === selectedDoctor);
            if (doctor?.availableSlots?.length > 0) {
                const dates = [...new Set(doctor.availableSlots.map(slot => slot.date))].sort(
                    (a, b) => new Date(a) - new Date(b)
                );
                setAvailableDates(dates);
            } else {
                setAvailableDates([]);
            }
        } else {
            setAvailableDates([]);
        }
        setSelectedDate("");
        setSelectedTime("");
        setAvailableTimes([]);
    }, [selectedDoctor, doctors]);

    useEffect(() => {
        if (selectedDate && selectedDoctor) {
            const doctor = doctors.find(doc => doc._id === selectedDoctor);
            if (doctor?.availableSlots) {
                const dateSlots = doctor.availableSlots.filter(slot => slot.date === selectedDate);
                const allTimes = dateSlots.flatMap(slot => slot.time || []);
                const uniqueSortedTimes = [...new Set(allTimes)].sort((a, b) => {
                    const formatTime = t => (t.includes(":") ? t : `${t.slice(0, 2)}:${t.slice(2)}`);
                    return new Date(`1970-01-01T${formatTime(a)}`).getTime() - new Date(`1970-01-01T${formatTime(b)}`).getTime();
                });
                setAvailableTimes(uniqueSortedTimes);
            } else {
                setAvailableTimes([]);
            }
        } else {
            setAvailableTimes([]);
        }
        setSelectedTime("");
    }, [selectedDate, selectedDoctor, doctors]);

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const payload = {
                doctorId: selectedDoctor,
                date: selectedDate,
                time: selectedTime.includes(":") ? selectedTime : `${selectedTime.slice(0, 2)}:${selectedTime.slice(2)}`,
            };
            const res = await fetcher("booking/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log(payload)
            if (res.success) {
                setMessage("Booking successful!")
                router.push("/patients/view-bookings");
            } else {
                setError(res.message || "Booking failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.heading}>Book a New Appointment</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Specialization</label>
                        <select
                            value={selectedSpecialization}
                            onChange={e => setSelectedSpecialization(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="">Select a specialization</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>
                                    {spec}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSpecialization && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Doctor</label>
                            {loadingDoctors ? (
                                <div className={styles.loadingText}>Loading doctors...</div>
                            ) : doctors.length > 0 ? (
                                <select
                                    value={selectedDoctor}
                                    onChange={e => setSelectedDoctor(e.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            Dr. {doc.name} ({doc.specialization})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className={styles.message}>No doctors available for this specialization</p>
                            )}
                        </div>
                    )}

                    {selectedDoctor && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            {availableDates.length > 0 ? (
                                <select
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Select a date</option>
                                    {availableDates.map(date => (
                                        <option key={date} value={date}>
                                            {formatDate(date)}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className={styles.message}>No available dates</p>
                            )}
                        </div>
                    )}

                    {selectedDate && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Time</label>
                            {availableTimes.length > 0 ? (
                                <select
                                    value={selectedTime}
                                    onChange={e => setSelectedTime(e.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Select a time</option>
                                    {availableTimes.map(time => (
                                        <option key={time} value={time}>
                                            {formatTime24to12(time)}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className={styles.message}>  No available appointment times for this date. Please select another date or doctor.</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`${styles.submitButton} ${!selectedDoctor || !selectedDate || !selectedTime ? styles.disabled : ""}`}
                        disabled={!selectedDoctor || !selectedDate || !selectedTime || submitting}
                    >
                        {submitting ? "Processing..." : "Book Appointment"}
                    </button>
                </form>
            </div>
            {message && <p className={styles.message}>{message}</p>}
        </main>
    );
}
