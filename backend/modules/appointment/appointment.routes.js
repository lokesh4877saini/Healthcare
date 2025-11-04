const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('core/middleware/auth');
const appointmentController = require('appointment/appointment.controller');

// --- Appointment Routes ---

// Book a new appointment (Patient only)
router.post(
    '/book',
    isAuthenticatedUser,
    authorizeRoles('patient'),
    appointmentController.bookAppointment
);

// Doctor’s own appointments
router.get(
    '/doctor',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    appointmentController.getDoctorAppointments
);

// Patient’s own appointments
router.get(
    '/my',
    isAuthenticatedUser,
    authorizeRoles('patient'),
    appointmentController.getPatientAppointments
);

// Delete a specific booking (Doctor or Patient)
router.delete(
    '/delete/:id',
    isAuthenticatedUser,
    authorizeRoles('patient', 'doctor'),
    appointmentController.deleteBooking
);

// Reschedule appointment
router.put(
    '/reschedule/:id',
    isAuthenticatedUser,
    authorizeRoles('patient', 'doctor'),
    appointmentController.rescheduleBooking
);

// Doctor updates a note for an appointment
router.put(
    '/update-note/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    appointmentController.updateNoteBooking
);

// Cancel appointment (both doctor or patient)
router.put(
    '/cancel/:id',
    isAuthenticatedUser,
    appointmentController.cancelBooking
);

// View appointment details (Doctor only)
router.get(
    '/details/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    appointmentController.viewBookingDetails
);

// Update appointment status (Doctor only)
router.put(
    '/status/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    appointmentController.updateStatusAppointment
);

// Delete all bookings (Admin only — safer)
router.delete(
    '/delete-all',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    appointmentController.deleteAllBookings
);

module.exports = router;
