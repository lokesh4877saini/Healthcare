// services/appointmentService.js
import { fetcher } from '@/lib/api';

export const appointmentService = {
  // Doctor appointments
  getDoctorAppointments: () => fetcher('booking/doctor'),
  
  getDoctorSlots: () => fetcher('doctor/slots'),

  getAppointmentsById:(bookingId) => fetcher(`booking/viewDetails/${bookingId}`),
  
  cancelAppointment: (bookingId, payload) => 
    fetcher(`booking/cancel/${bookingId}`, { 
      method: 'PUT', 
      body: JSON.stringify(payload) 
    }),
  
  rescheduleAppointment: (bookingId, data) =>
    fetcher(`booking/reschedule/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  completeAppointment: (bookingId,payload) =>
  fetcher(`booking/complete/${bookingId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
    }),
    
  // Patient appointments
  getPatientAppointments: () => fetcher('booking/patient'),
  createAppointment: (data) => 
    fetcher('booking', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    })
};