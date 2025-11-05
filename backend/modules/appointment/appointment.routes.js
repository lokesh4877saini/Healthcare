const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('core/middleware/Auth');
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

/* ------------------- Appointment Routes ------------------- */

router.post('/book', isAuthenticatedUser, authorizeRoles('patient'), bookAppointment);
router.get('/doctor', isAuthenticatedUser, authorizeRoles('doctor'), getDoctorAppointments);
router.get('/my', isAuthenticatedUser, authorizeRoles('patient'), getPatientAppointments);
router.get('/viewDetails/:id', isAuthenticatedUser, authorizeRoles('doctor', 'patient'), viewAppointmentDetails);
router.put('/reschedule/:id', isAuthenticatedUser, authorizeRoles('patient', 'doctor'), rescheduleAppointment);
router.put('/cancel/:id', isAuthenticatedUser, authorizeRoles('patient', 'doctor'), cancelAppointment);
router.put('/updateNote/:id', isAuthenticatedUser, authorizeRoles('doctor'), updateAppointmentNote);
router.put('/updatestatus/:id', isAuthenticatedUser, authorizeRoles('doctor'), updateAppointmentStatus);
router.delete('/delete/:id', isAuthenticatedUser, authorizeRoles('doctor', 'patient'), deleteAppointment);
router.delete('/allbookingdelete', isAuthenticatedUser, authorizeRoles('admin'), deleteAllAppointments);

module.exports = router;
