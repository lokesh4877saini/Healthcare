'use client';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import LoggedOutNotice from '@/components/LoggedOutNotice';
import { formatDate, formatTime24to12 } from '@/lib/formatters';
import { fetcher } from '@/lib/api';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import styles1 from '@/styles/NewBookingPage.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/styles/DoctorSlotsPage.module.css';

const DatePick = dynamic(() => import('@/components/DatePick'), {
    ssr: false,
    loading: () => (
        <div className={styles.loader}>
            <div className={styles.spinne}> loading Date ...</div>
        </div>
    )

});

const TimeSlotPicker = dynamic(() => import('@/components/TimeSlotPicker'), {
    ssr: false,
    loading: () => (
        <div className={styles.loader}>
            <div className={styles.spinne}>loading Time ...</div>
        </div>
    )

});


export default function DoctorSlotsPage() {
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [date, setDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState([{ startTime: '', endTime: '' }]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [message, setMessage] = useState('');

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

    if (!isMounted) return <main className={styles1.LoadingDiv}>
        <p className={styles1.LoadingPara}>Loading...</p>
    </main>;
    if (!user) return <LoggedOutNotice />;
    const handleTimeChange = (index, field, value) => {
        const newSlots = [...timeSlots];
        newSlots[index][field] = value; // field = 'startTime' or 'endTime'
        setTimeSlots(newSlots);
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
    };

    const removeTimeSlot = (index) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            date: date.toISOString().split('T')[0],
            slots: timeSlots
                .filter(slot => slot.startTime && slot.endTime)
                .map(slot => ({
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }))
        };
        try {
            const res = await fetcher('doctor/slots', {
                method: 'POST',
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
    const handleDeleteTime = async (date, slot) => {
        try {
            const res = await fetcher('doctor/delete-time-slot', {
                method: 'DELETE',
                body: JSON.stringify({ date, startTime: slot.startTime, endTime: slot.endTime }),
            });
            if (res.success) await fetchSlots();
        } catch (error) {
            console.error(error);
        }
    };
    // extracting bookedDates
    const bookedDates = availableSlots.map(item => item?.date)
    return (
        <>
            <main className={styles.container}>
                <h1 className={styles.heading}>Manage Available Slots</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.dateTime}>

                        <div
                            className={styles.DatePick}
                        >
                            <DatePick date={date} setDate={setDate} bookedDates={bookedDates} />
                        </div>
                        <div className={styles.TimeSlotPicker}>
                            <TimeSlotPicker
                                timeSlots={timeSlots}
                                handleTimeChange={handleTimeChange}
                                addTimeSlot={addTimeSlot}
                                removeTimeSlot={removeTimeSlot}
                            />
                        </div>
                    </div>

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
                                            {slot.slots.map((slotObj, idx) => (
                                                <span key={idx} className="time-span">
                                                    {formatTime24to12(slotObj.startTime)} - {formatTime24to12(slotObj.endTime)}
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
                                                        width:100%;
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
                                                        font-size:12px;
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