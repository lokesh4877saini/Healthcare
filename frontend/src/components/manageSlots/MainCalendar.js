import { formatDateToBackend } from '@/lib/formatters';
import React from 'react'
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
    const renderView = () => {
        switch (currentView) {
            case 'day':
                const dayDateString = formatDateToBackend(selectedDate);
                return (
                    <DayView
                        currentDate={selectedDate}
                        slots={availableSlots.filter(slot => slot.date === dayDateString)}
                        onAddSlot={onAddSlot}
                        onEditSlot={onEditSlot}
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
                        onEditSlot={onEditSlot}
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
                        onEditSlot={onEditSlot}
                        onDeleteSlot={onDeleteSlot}
                        onDateClick={onDateClick}
                    />
                );
            case 'year':
                return (
                    <YearView
                        currentDate={selectedDate}
                        slots={availableSlots}
                        onEditSlot={onEditSlot}
                        onMonthClick={onMonthClick}
                    />
                );
            default:
                return null;
        }
    };

    return renderView();
}

export default MainCalendar;