'use client';

import DatePicker from 'react-datepicker';
import { MdDeleteForever } from "react-icons/md";
// import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatTime24to12 } from '@/lib/formatters';
import { MdAdd } from "react-icons/md";
import { fetcher } from '@/lib/api';
import { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/styles/DoctorSlotsPage.module.css';
import { useRouter } from 'next/navigation';

export default function DoctorSlotsPage() {
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState(['']);
    const [message, setMessage] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        async function fetchSlots() {
            const res = await fetcher('doctor/slots')
            if (res.success) {
                setAvailableSlots(res.availableSlots);
            }
        }
        fetchSlots();
    }, []);
    const handleTimeChange = (index, value) => {
        const newSlots = [...timeSlots];
        newSlots[index] = value;
        setTimeSlots(newSlots);
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, '']);
    };

    const removeTimeSlot = (index) => {
        const newSlots = timeSlots.filter((_, i) => i !== index);
        setTimeSlots(newSlots);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            date: date.toISOString().split('T')[0],
            timeSlots: timeSlots.filter(Boolean),
        };
        try {
            const res = await fetcher('doctor/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            // Simulate success
            if (res.success) {
                setMessage('Slots updated successful!');
                router.refresh();
            } else {
                setMessage(res.message || "failed Slots updated");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setMessage('');
            }, 3000)
        }
    };
    // DELETE whole date slot
    const handleDeleteDate = async (date) => {
        try {
            const res = await fetcher('doctor/delete-date-slot', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date }),
            });
            console.log(res.message);
            if(res.success){
                router.refresh();
            }
            // Optional: Refetch slots or remove from state
        } catch (error) {
            console.error(error);
        }
    };

    // DELETE single time slot
    const handleDeleteTime = async (date, time) => {
        try {
            const res = await fetcher('doctor/delete-time-slot', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, time }),
            });
            console.log(res.message);
            if(res.success){
                router.refresh();
            }
            // Optional: Refetch slots or remove from state
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <main className={styles.container}>
                <h1 className={styles.heading}>Manage Available Slots</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>Select Date:</label>
                    <DatePicker
                        selected={date}
                        onChange={(date) => setDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className={styles.datepicker}
                    />

                    <label className={styles.label}>Time Slots:</label>
                    <div className={styles.timeSlots}>
                        {timeSlots.map((slot, index) => (
                            <div key={index} className={styles.timeSlotItem}>
                                <input
                                    type="time"
                                    value={slot}
                                    onChange={(e) => handleTimeChange(index, e.target.value)}
                                    className={styles.timeInput}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTimeSlot(index)}
                                    className={styles.removeButton}
                                    aria-label="Remove"
                                >
                                    <MdDeleteForever />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addTimeSlot}
                        className={styles.addButton}
                    >
                        <MdAdd /> Add Time Slot
                    </button>

                    <button type="submit" className={styles.submitButton}>
                        Save Slots
                    </button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
            </main>
            <main className={styles.container2}>

                <h2 className={styles.heading}>Your Available Slots</h2>
                {availableSlots.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.slotsTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time Slots</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableSlots.map((slot, index) => (
                                    <tr key={index}>
                                        <td
                                            style={{ cursor: 'pointer', color: '#0070f3' }}
                                            onClick={() => handleDeleteDate(slot.date)}
                                        >{formatDate(slot.date)}</td>
                                        <td>
                                            {slot.time.map((time, idx) => (
                                                <span key={idx}
                                                    style={{ marginRight: '8px', cursor: 'pointer', color: '#ff3b30' }}
                                                    onClick={() => handleDeleteTime(slot.date, time)}>
                                                    {formatTime24to12(time)}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No slots available.</p>
                )}
            </main>
        </>
    );
}