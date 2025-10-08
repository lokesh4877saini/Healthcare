'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import styles from '@/styles/DoctorSlotsPage.module.css';
import SideBar from '@/components/manageSlots/SideBar';
import SlotHeader from '@/components/manageSlots/SlotHeader';
import MainCalendar from '@/components/manageSlots/MainCalendar';
import { useNavigationManager } from '@/hooks/slot/useNavigationManager';
import { useSlotManager } from '@/hooks/slot/useSlotManager';

export default function DoctorSlotsPage() {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [currentView, setCurrentView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const { transformBackendData,
        handleAddSlot,
        handleEditSlot,
        handleDeleteSlot
    } = useSlotManager(setAvailableSlots, fetchSlots);

    const { getWeekDates,
        navigatePrevious,
        navigateNext,
        goToToday
    } = useNavigationManager(selectedDate, setSelectedDate, setCurrentDate);
    useEffect(() => {
        setIsMounted(true);
        fetchSlots();
    }, []);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                navigatePrevious();
            } else if (event.key === 'ArrowRight') {
                navigateNext();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [selectedDate, currentView]);
    async function fetchSlots() {
        try {
            const res = await fetcher('doctor/slots');
            if (res.success) {
                const transformedSlots = transformBackendData(res.availableSlots);
                setAvailableSlots(transformedSlots);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    }

    const handleMonthClick = (date) => {
        setSelectedDate(date);
        setCurrentDate(date);
        setCurrentView('month');
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setCurrentDate(date);
        setCurrentView('day');
    };

    const changeView = (view) => {
        setCurrentView(view);
    };

    const weekDays = getWeekDates();

    if (!isMounted) {
        return <div>Loading...</div>;
    }

    return (
        <main className={styles.container}>
            <div className={styles.layout}>
                {/* Sidebar */}
                <SideBar
                    changeView={changeView}
                    currentView={currentView}
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    goToToday={goToToday}
                />

                {/* Main Content */}
                <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentExpanded : ''}`}>
                    <SlotHeader
                        currentView={currentView}
                        selectedDate={selectedDate}
                        showInstructions={showInstructions}
                        setShowInstructions={setShowInstructions}
                        navigatePrevious={() => navigatePrevious(currentView)}
                        navigateNext={() => navigateNext(currentView)}
                    />

                    {/* Calendar Container */}
                    <div className={styles.calendarContainer}>
                        <MainCalendar
                            currentView={currentView}
                            selectedDate={selectedDate}
                            availableSlots={availableSlots}
                            weekDays={weekDays}
                            onAddSlot={handleAddSlot}
                            onEditSlot={handleEditSlot}
                            onDeleteSlot={handleDeleteSlot}
                            onDateClick={handleDateClick}
                            onMonthClick={handleMonthClick}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}