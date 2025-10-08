'use client';
import { toast } from 'react-toastify'
import { convertTo24Hour, formatDateToBackend, formatTime24to12 } from '@/lib/formatters';
import { manageSlotService } from '@/services/manageSlotService';
import { showToast } from '@/lib/utils/toast';

export function useSlotManager(setAvailableSlots, fetchSlots) {

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return (durationMinutes / 60).toFixed(1);
  };

  const transformBackendData = (backendSlots) => {
    if (!backendSlots || !Array.isArray(backendSlots)) {
      return [];
    }

    const transformed = backendSlots.flatMap(dateSlot => {
      if (!dateSlot || !dateSlot.slots) {
        return [];
      }

      const slotsForDate = dateSlot.slots.map(slot => {
        if (!slot || !slot.startTime || !slot.endTime) {
          return null;
        }

        try {
          return {
            id: slot._id,
            date: dateSlot.date,
            day: new Date(dateSlot.date).toLocaleDateString('en-US', { weekday: 'short' }),
            startTime: formatTime24to12(slot.startTime),
            endTime: formatTime24to12(slot.endTime),
            duration: calculateDuration(slot.startTime, slot.endTime),
            title: `${calculateDuration(slot.startTime, slot.endTime)}h`,
            type: 'appointment',
            description: '',
            location: ''
          };
        } catch (error) {
          console.error('Error transforming slot:', slot, error);
          return null;
        }

      }).filter(slot => slot !== null);

      return slotsForDate;
    });
    return transformed;
  };

  const handleAddSlot = async (date, startTime, endTime, duration) => {
    const backendDate = formatDateToBackend(date);
    const backendStartTime = convertTo24Hour(startTime);
    const backendEndTime = convertTo24Hour(endTime);

    const payload = {
      date: backendDate,
      startTime: backendStartTime,
      endTime: backendEndTime
    };

    try {
      const res = await manageSlotService.addTimeslot(payload);
      if (res.success) {
        showToast.success(`${res.message}`);
        await fetchSlots();
      } else {
        showToast.error(res.message);
      }
    } catch (error) {
      showToast.error(`Failed to add slot. Please try again. ${error}`);
    }
  };

  const handleEditSlot = (setAvailableSlots) => (slot) => {
    const newTitle = prompt('Enter new title:', slot.title);
    if (newTitle) {
      setAvailableSlots(prev =>
        prev.map(s => s.id === slot.id ? { ...s, title: newTitle } : s)
      );
    }
  };

  const handleDeleteSlot = async (slot) => {
    const payload = {
      date: slot.date,
      startTime: convertTo24Hour(slot.startTime),
      endTime: convertTo24Hour(slot.endTime)
    };
    try {
      const res = await manageSlotService.deleteTimeslot(payload);
      if (res.success) {
        showToast.info(`${res.message}`);
        await fetchSlots();
      } else {
        showToast.error(res.message);
      }
    } catch (error) {
      showToast.error('Failed to delete slot:', error);
    }
  };

  return {
    transformBackendData,
    handleAddSlot,
    handleEditSlot: handleEditSlot(setAvailableSlots),
    handleDeleteSlot
  };
}