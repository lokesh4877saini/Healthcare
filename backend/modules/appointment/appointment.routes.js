const express = require('express');
const router = express.Router();

//  Import controller functions from alias
const {
    bookAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    viewAppointmentDetails,
    rescheduleAppointment,
    cancelAppointment,
    updateAppointmentNote,
    updateAppointmentStatus,
    deleteAppointment,
    deleteAllAppointments,
} = require('appointment/appointment.controller');

const { isAuthenticatedUser, authorizeRoles } = require('core/middleware/Auth');

/* ------------------- Appointment Routes ------------------- */
router.post('/book', isAuthenticatedUser, authorizeRoles('patient'), bookAppointment);
router.get('/doctor', isAuthenticatedUser, authorizeRoles('doctor'), getDoctorAppointments);
router.get('/patient', isAuthenticatedUser, authorizeRoles('patient'), getPatientAppointments);
router.get('/:id', isAuthenticatedUser, viewAppointmentDetails);
router.put('/reschedule/:id', isAuthenticatedUser, rescheduleAppointment);
router.put('/cancel/:id', isAuthenticatedUser, cancelAppointment);
router.patch('/note/:id', isAuthenticatedUser, authorizeRoles('doctor'), updateAppointmentNote);
router.patch('/status/:id', isAuthenticatedUser, authorizeRoles('doctor'), updateAppointmentStatus);
router.delete('/:id', isAuthenticatedUser, deleteAppointment);
router.delete('/delete/all', isAuthenticatedUser, authorizeRoles('admin'), deleteAllAppointments);

module.exports = router;
