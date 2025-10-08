'use client';

import { formatDateToBackend } from '@/lib/formatters';

export function useNavigationManager(selectedDate, setSelectedDate, setCurrentDate) {
  
  const getWeekDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const fullDate = formatDateToBackend(date);

      return {
        day,
        date: date.getDate(),
        month: date.getMonth(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        fullDate,
        dateObj: date
      };
    });
  };

  const navigatePrevious = (currentView) => {
    const newDate = new Date(selectedDate);

    switch (currentView) {
      case 'day':
        newDate.setDate(selectedDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(selectedDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(selectedDate.getMonth() - 1);
        if (newDate.getDate() !== selectedDate.getDate()) {
          newDate.setDate(0);
        }
        break;
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const navigateNext = (currentView) => {
    const newDate = new Date(selectedDate);

    switch (currentView) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(selectedDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + 1);
        if (newDate.getDate() !== selectedDate.getDate()) {
          newDate.setDate(0);
        }
        break;
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() + 1);
        break;
      default:
        break;
    }

    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  return {
    getWeekDates,
    navigatePrevious,
    navigateNext,
    goToToday
  };
}