// services/appointmentService.js
import { fetcher } from '@/lib/api';

export const manageSlotService = {
  getDoctorSlots: () => fetcher('doctor/slots'),

  addTimeslot: (payload) =>
    fetcher(`doctor/slots`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  deleteTimeslot: (payload) =>
    fetcher(`doctor/delete-time-slot`, {
      method: 'DELETE',
      body: JSON.stringify(payload)
    }),

  deleteDateSlot: (payload) =>
    fetcher(`doctor/delete-date-slot`, {
      method: 'DELETE',
      body: JSON.stringify(payload)
    }),
};