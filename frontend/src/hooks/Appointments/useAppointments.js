// hooks/Appointments/useAppointments.js
import { useState, useCallback, useEffect } from 'react';
import { appointmentService } from '@/services/appointmentService';

// Add this transform function
const transformData = (bookings) => {
  return bookings.reduce(
    (acc, item) => {
      if (item.status === "scheduled") acc.upcoming.push(item);
      else if (item.status === "completed") acc.completed.push(item);
      else if (item.status === "cancel" || item.status === "cancelled") acc.cancelled.push(item);
      return acc;
    },
    { upcoming: [], completed: [], cancelled: [] }
  );
};

export const useAppointments = (userRole = 'doctor') => {
  const [bookings, setBookings] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const service = userRole === 'doctor' 
        ? appointmentService.getDoctorAppointments 
        : appointmentService.getPatientAppointments;
      
      const res = await service();
      
      if (res.success) {
        const transformedData = transformData(res.bookings);
        setBookings(transformedData);
      } else {
        setError(res.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [userRole]);
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = useCallback(async (bookingId, reason) => {
    try {
      const result = await appointmentService.cancelAppointment(bookingId, reason);
      await fetchBookings(); // Refresh data
      return { 
        success: true, 
        message: result.message || 'Appointment cancelled successfully' 
      };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    }
  }, [fetchBookings]);

  const updateNoteBooking = useCallback(async (bookingId, note) => {
    try {
      const result = await appointmentService.completeAppointment(bookingId, note);
      await fetchBookings(); // Refresh data
      return { 
        success: true, 
        message: result.message || 'Appointment completed successfully' 
      };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    }
  }, [fetchBookings]);

  const updateAppointmentStatus = useCallback(async (bookingId, status) => {
    try {
      const result = await appointmentService.updateAppointmentStatus(bookingId, status);
      await fetchBookings(); // Refresh data
      return { 
        success: true, 
        message: result.message || 'Appointment completed successfully' 
      };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    }
  }, [fetchBookings]);

  return { 
    bookings, 
    loading, 
    error, 
    fetchBookings, 
    cancelBooking, 
    updateNoteBooking  ,
    updateAppointmentStatus,
  };
};