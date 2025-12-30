// services/appointmentService.js
import { fetcher } from '@/lib/api';

export const appointmentService = {
  // Doctor appointments
  getDoctorAppointments: () => fetcher('appointment/doctor'),

  getDoctorSlots: () => fetcher('doctor/slots'),

  getAppointmentsById: (bookingId) => fetcher(`appointment/viewDetails/${bookingId}`),

  cancelAppointment: (bookingId, payload) =>
    fetcher(`appointment/cancel/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  rescheduleAppointment: (bookingId, data) =>
    fetcher(`appointment/reschedule/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

    updateNoteBooking: (bookingId, payload) =>
    fetcher(`appointment/updateNote/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
    
  updateAppointmentStatus: (bookingId, payload) =>
    fetcher(`appointment/updatestatus/${bookingId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  // Patient appointments
  getPatientAppointments: () => fetcher('appointment/patient'),
  createAppointment: (data) =>
    fetcher('appointment', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};