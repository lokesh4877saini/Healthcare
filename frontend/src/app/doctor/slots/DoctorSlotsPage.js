'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import styles from '@/styles/DoctorSlotsPage.module.css';
import YearView from '@/components/manageSlots/YearView';
import MonthView from '@/components/manageSlots/MonthView';
import WeekView from '@/components/manageSlots/WeekView';
import DayView from '@/components/manageSlots/DayView';

export default function DoctorSlotsPage() {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [currentView, setCurrentView] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        setIsMounted(true);
        fetchSlots();
    }, []);

    async function fetchSlots() {
        const res = await fetcher('doctor/slots');
        if (res.success) {
            setAvailableSlots(res.availableSlots);
        }
    }

    const handleMonthClick = (date) => {
        setCurrentDate(date);
        setCurrentView('month');
    };

    const handleDateClick = (date) => {
        setCurrentDate(date);
        setCurrentView('day');
    };

    const handleAddSlot = (day, startTime, endTime, duration) => {
        const newSlot = {
            id: `slot-${Date.now()}`,
            day: day,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            title: `${duration}h`,
            type: 'appointment',
            description: '',
            location: ''
        };

        setAvailableSlots(prev => [...prev, newSlot]);
    };

    const handleEditSlot = (slot) => {
        const newTitle = prompt('Enter new title:', slot.title);
        if (newTitle) {
            setAvailableSlots(prev =>
                prev.map(s => s.id === slot.id ? { ...s, title: newTitle } : s)
            );
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (confirm('Are you sure you want to delete this slot?')) {
            const res = await fetcher(`doctor/slots/${slotId}`, { method: 'DELETE' });
            if (res.success) {
                setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
            }
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'day':
                return (
                    <DayView
                        currentDate={currentDate}
                        slots={availableSlots.filter(slot =>
                            slot.day === currentDate.toLocaleDateString('en-US', { weekday: 'short' })
                        )}
                        onAddSlot={handleAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={handleDeleteSlot}
                    />
                );
            case 'week':
                return (
                    <WeekView
                        weekDays={weekDays}
                        slots={availableSlots}
                        onAddSlot={handleAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={handleDeleteSlot}
                    />
                );
            case 'month':
                return (
                    <MonthView
                        currentDate={currentDate}
                        slots={availableSlots}
                        onAddSlot={handleAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={handleDeleteSlot}
                        onDateClick={handleDateClick}
                    />
                );
            case 'year':
                return (
                    <YearView
                        currentDate={currentDate}
                        slots={availableSlots}
                        onEditSlot={handleEditSlot}
                        onMonthClick={handleMonthClick}
                    />
                );
            default:
                return null;
        }
    };

    const changeView = (view) => {
        setCurrentView(view);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getWeekDates = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const currentDay = today.getDay();

        return days.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + (index - currentDay));
            return {
                day,
                date: date.getDate()
            };
        });
    };

    const weekDays = getWeekDates();

    if (!isMounted) {
        return <div>Loading...</div>;
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.heading}>Manage Available Slots</h1>
                <div className={styles.instructions}>
                    {currentView === 'day' || currentView === 'week'
                        ? "Click and drag on time columns to create slots (1h, 1.5h, or 2h duration)"
                        : currentView === 'month'
                            ? "Click on days to add slots"
                            : "Click on slots to edit"}
                </div>
                <div className={styles.viewControls}>
                    <button className={styles.todayBtn} onClick={goToToday}>
                        Today
                    </button>
                    <button
                        className={`${styles.viewBtn} ${currentView === 'day' ? styles.active : ''}`}
                        onClick={() => changeView('day')}
                    >
                        Day
                    </button>
                    <button
                        className={`${styles.viewBtn} ${currentView === 'week' ? styles.active : ''}`}
                        onClick={() => changeView('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`${styles.viewBtn} ${currentView === 'month' ? styles.active : ''}`}
                        onClick={() => changeView('month')}
                    >
                        Month
                    </button>
                    <button
                        className={`${styles.viewBtn} ${currentView === 'year' ? styles.active : ''}`}
                        onClick={() => changeView('year')}
                    >
                        Year
                    </button>
                </div>
            </div>

            <div className={styles.calendarContainer}>
                {renderView()}
            </div>
        </main>
    );
}