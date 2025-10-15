'use client'
import { formatDateToBackend } from '@/lib/formatters';
import React, { useState } from 'react'
import SlotEditModal from './SlotEditModal';
import DayView from './view/DayView';
import MonthView from './view/MonthView';
import WeekView from './view/WeekView';
import YearView from './view/YearView';

const MainCalendar = ({
    currentView,
    selectedDate,
    availableSlots,
    weekDays,
    onAddSlot,
    onEditSlot,
    onDeleteSlot,
    onDateClick,
    onMonthClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    // Open the modal and set the selected slot
    const handleEditSlot = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSlot(null);
    };

    // Save the edited slot
    const handleSaveEdit = (editedSlot) => {
        onEditSlot(editedSlot); // Call the passed in `onEditSlot` function to update the slot
        closeModal();
    };


    const renderView = () => {
        switch (currentView) {
            case 'day':
                const dayDateString = formatDateToBackend(selectedDate);
                return (
                    <DayView
                        currentDate={selectedDate}
                        slots={availableSlots.filter(slot => slot.date === dayDateString)}
                        onAddSlot={onAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={onDeleteSlot}
                    />
                );
            case 'week':
                const weekDateStrings = weekDays.map(day => day.fullDate);
                return (
                    <WeekView
                        weekDays={weekDays}
                        slots={availableSlots.filter(slot => weekDateStrings.includes(slot.date))}
                        onAddSlot={onAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={onDeleteSlot}
                    />
                );
            case 'month':
                const month = selectedDate.getMonth();
                const year = selectedDate.getFullYear();
                return (
                    <MonthView
                        currentDate={selectedDate}
                        slots={availableSlots.filter(slot => {
                            const slotDate = new Date(slot.date);
                            return slotDate.getMonth() === month && slotDate.getFullYear() === year;
                        })}
                        onAddSlot={onAddSlot}
                        onEditSlot={handleEditSlot}
                        onDeleteSlot={onDeleteSlot}
                        onDateClick={onDateClick}
                    />
                );
            case 'year':
                return (
                    <YearView
                        currentDate={selectedDate}
                        slots={availableSlots}
                        onEditSlot={handleEditSlot}
                        onMonthClick={onMonthClick}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
          <div>
            {renderView()}
            
            {/* Conditionally render the modal when it's open */}
            {isModalOpen && (
                <SlotEditModal
                    slot={selectedSlot}
                    onClose={closeModal}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
        </>
    )
}

export default MainCalendar;