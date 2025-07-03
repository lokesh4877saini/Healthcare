'use client';

import DatePicker from 'react-datepicker';
import { MdDeleteForever } from "react-icons/md";
import { useAuth } from '@/hooks/useAuth';
import LoggedOutNotice from '@/components/LoggedOutNotice';
import { formatDate, formatTime24to12 } from '@/lib/formatters';
import { MdAdd } from "react-icons/md";
import { fetcher } from '@/lib/api';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/styles/DoctorSlotsPage.module.css';
import { useRouter } from 'next/navigation';

export default function DoctorSlotsPage() {
    const {user} = useAuth();
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState(['']);
    const [message, setMessage] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    useEffect(() => {
        fetchSlots();
    }, []);
    async function fetchSlots() {
        const res = await fetcher('doctor/slots')
        if (res.success) {
            setAvailableSlots(res.availableSlots);
        }
    }
    if(!user) return <LoggedOutNotice/>
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
                await fetchSlots();
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
            if (res.success) {
                await fetchSlots();
            }
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
            if (res.success) {
                await fetchSlots();
            }
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
                                            className="date-cell"
                                            onClick={() => handleDeleteDate(slot.date)}
                                        >
                                            <span className="date-content">{formatDate(slot.date)}</span>
                                            <div className="overlay">
                                                <RiDeleteBinLine className="icon" />
                                                <span className="overlay-text">Delete entire date slot</span>
                                            </div>
                                        </td>

                                        <td>
                                            {slot.time.map((time, idx) => (
                                                <span
                                                    key={idx}
                                                    className="time-span"
                                                    onClick={() => handleDeleteTime(slot.date, time)}
                                                >
                                                    {formatTime24to12(time)}
                                                    <div className="overlay">
                                                        <RiDeleteBinLine className="icon" />
                                                    </div>
                                                </span>
                                            ))}
                                        </td>

                                        <style jsx>{`.date-cell {
                                                        position: relative;
                                                        cursor: pointer;
                                                        padding: 8px;
                                                    }

                                                    .date-content {
                                                        position: relative;
                                                        z-index: 1;
                                                    }

                                                    .time-span {
                                                        position: relative;
                                                        margin-right: 8px;
                                                        cursor: pointer;
                                                        display: inline-block;
                                                    }

                                                    .overlay {
                                                        position: absolute;
                                                        top: 50%;
                                                        left: 50%;
                                                        transform: translate(-50%, -50%);
                                                        background: rgba(0, 0, 0, 0.7);
                                                        color: #fff;
                                                        padding:2px 4px;
                                                        justify-content:center;
                                                        border-radius: 4px;
                                                        display: flex;
                                                        width:80%;
                                                        align-items: center;
                                                        gap: 6px;
                                                        opacity: 0;
                                                        pointer-events: none;
                                                        transition: opacity 0.1s ease;
                                                        z-index: 2;
                                                        font-size: 12px;
                                                    }

                                                    .icon {
                                                        font-size: 16px;
                                                    }

                                                    .overlay-text {
                                                        font-size: 9px;
                                                    }

                                                    .date-cell:hover .overlay {
                                                        opacity: 1;
                                                        pointer-events: auto;
                                                    }

                                                    .time-span:hover .overlay {
                                                        opacity: 1;
                                                        pointer-events: auto;
                                                    }
                                                    `}</style>

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