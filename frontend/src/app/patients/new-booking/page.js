"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Stepper, Step, StepLabel, Button, Box, FormControl, Select, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import styles from "@/styles/NewBookingPage.module.css";
import { useAuth } from "@/context/AuthProvider";
import LoggedOutNotice from "@/components/LoggedOutNotice";
import { formatDate, formatTime24to12 } from "@/lib/formatters";

export default function NewBookingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]); 
    const [message, setMessage] = useState("");

    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);  

    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isDisabled, setIsDiabled] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ["Select Specialization", "Choose Doctor", "Select Date", "Select Time"];

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Specializations
    useEffect(() => {
        async function fetchSpecializations() {
            try {
                const { success, specializations: doctors } = await fetcher("doctor/specializations/all");
                if (success && doctors) {
                    const uniqueSpecs = [...new Set(doctors)].filter(spec => spec && spec.trim() !== '').sort();
                    setSpecializations(uniqueSpecs);
                }
            } catch (err) {
                setError("Failed to load specializations");
                console.error(err);
            }
        }
        fetchSpecializations();
    }, []);

    // Fetch Doctors based on selected specialization
    useEffect(() => {
        if (selectedSpecialization) {
            setLoadingDoctors(true);
            setError("");
            async function fetchDoctors() {
                try {
                    const res = await fetcher(`doctor?specialization=${encodeURIComponent(selectedSpecialization)}`);
                    if (res.success) {
                        setDoctors(res.doctors || []);
                        if (res.doctors && res.doctors.length > 0) {
                            setSelectedDoctor(res.doctors[0]._id);
                        }
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
        setSelectedSlot("");
        setAvailableDates([]);
        setAvailableSlots([]);
    }, [selectedSpecialization]);

    // Fetch available dates based on selected doctor
    useEffect(() => {
        if (selectedDoctor) {
            const doctor = doctors.find(doc => doc._id === selectedDoctor);
            if (doctor?.availableSlots?.length > 0) {
                const dates = [...new Set(doctor.availableSlots.map(slot => slot.date))].sort(
                    (a, b) => new Date(a) - new Date(b)
                );
                setAvailableDates(dates);
                if (dates.length > 0) {
                    setSelectedDate(dates[0]);
                }
            } else {
                setAvailableDates([]);
                setError("No available dates for  selected doctor.");
            }
        } else {
            setAvailableDates([]);
        }
        setSelectedSlot("");
        setAvailableSlots([]);
    }, [selectedDoctor, doctors]);

    // Fetch available times based on selected date
    useEffect(() => {
        if (selectedDate && selectedDoctor) {
            const doctor = doctors.find(doc => doc._id === selectedDoctor);
            if (doctor?.availableSlots) {
                const dateSlots = doctor.availableSlots.filter(slot => slot.date === selectedDate);
                const allSlots = dateSlots.flatMap(slot => slot.slots || []);
                const sortedSlots = [...allSlots].sort((a, b) => {
                    const [aH, aM] = a.startTime.split(':').map(Number);
                    const [bH, bM] = b.startTime.split(':').map(Number);
                    return aH * 60 + aM - (bH * 60 + bM);
                });
                setAvailableSlots(sortedSlots);
                setSelectedSlot(sortedSlots[0] || null);
                setIsDiabled(sortedSlots.length === 0);
            } else {
                setAvailableSlots([]);
                setSelectedSlot(null);
                setIsDiabled(true);
            }
        }
    }, [selectedDate, selectedDoctor, doctors]);

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(""); 

        try {
            const payload = {
                doctorId: selectedDoctor,
                date: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
            };
            const res = await fetcher("booking/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.success) {
                setMessage("Booking successful!");
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

    const handleNext = () => {
        if (activeStep === 3) return;
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setIsDiabled(false);
        setActiveStep((prevStep) => prevStep - 1);
    };

    if (!mounted || authLoading) {
        return (
            <main className={styles.LoadingDiv}>
                <p className={styles.LoadingPara}>Loading...</p>
            </main>
        );
    }

    if (!user) {
        return <LoggedOutNotice />;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.heading}>Book a New Appointment</h1>
                <motion.div
                    className={styles.messageWrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: error || message ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {error && <div className={styles.error}>{error}</div>}
                    {message && <p className={styles.success}>{message}</p>}
                </motion.div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <motion.div
                        className={styles.innerContainer}
                    >
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label, index) => (
                                <Step key={index}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </motion.div>
                    <motion.div
                        className={styles.innerContainer}
                    >

                        {/* Step 1: Specialization */}
                        {activeStep === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <FormControl fullWidth>
                                    <Select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        displayEmpty
                                        required
                                    >
                                        <MenuItem value="">Select a specialization</MenuItem>
                                        {specializations.map((spec) => (
                                            <MenuItem key={spec} value={spec}>
                                                {spec}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        )}

                        {/* Step 2: Choose Doctor */}
                        {activeStep === 1 && selectedSpecialization && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                {loadingDoctors ? (
                                    <div className={styles.loadingText}>Loading doctors...</div>
                                ) : doctors.length > 0 ? (
                                    <FormControl fullWidth>
                                        <Select
                                            value={selectedDoctor}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            required
                                        >
                                            <MenuItem value="">Select a doctor</MenuItem>
                                            {doctors.map((doc) => (
                                                <MenuItem key={doc._id} value={doc._id}>
                                                    Dr. {doc.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <p>No doctors available for this specialization</p>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Choose Date */}
                        {activeStep === 2 && selectedDoctor && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <FormControl fullWidth>
                                    <Select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                    >
                                        <MenuItem value="">Select a date</MenuItem>
                                        {availableDates.map((date) => (
                                            <MenuItem key={date} value={date}>
                                                {formatDate(date)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        )}

                        {/* Step 4: Choose Time */}
                        {activeStep === 3 && selectedDate && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <FormControl fullWidth>
                                    <Select
                                        value={selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : ""}
                                        onChange={(e) => {
                                            const [startTime, endTime] = e.target.value.split("-");
                                            setSelectedSlot({ startTime, endTime });
                                        }}
                                        displayEmpty
                                        required
                                    >
                                        <MenuItem value="" disabled>
                                            Select a time slot
                                        </MenuItem>
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map((slot, idx) => (
                                                <MenuItem key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                                    {`${formatTime24to12(slot.startTime)} - ${formatTime24to12(slot.endTime)}`}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No slots available
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        )}


                        {/* Navigation Buttons */}
                        <Box sx={{ marginTop: "20px", display: "flex", gap: "5rem", justifyItems: "flex-end" }}>
                            <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>
                                Back
                            </Button>
                            {/* Show Next button only for steps 1, 2, and 3 */}
                            {activeStep >= 0 && activeStep !== 3 && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNext}
                                    disabled={
                                        !selectedSpecialization || !selectedDoctor || isDisabled
                                    }
                                >
                                    Next
                                </Button>
                            )}

                            {/* Show Submit button only for Step 4 */}
                            {activeStep === 3 && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={!selectedDoctor || !selectedDate || !selectedSlot || submitting}
                                >
                                    {submitting ? "Processing..." : "Book Appointment"}
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                </form>
            </div>
        </main>
    );
}
