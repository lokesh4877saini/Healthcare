const express = require('express');
const router = express.Router();
const { authorizeRoles:authorizeRole} = require('../core/access-control');
const { isAuthenticatedUser } = require('../core/middleware/Auth');
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

router.post('/book', isAuthenticatedUser, authorizeRole('patient'), bookAppointment);
router.get('/doctor', isAuthenticatedUser, authorizeRole('doctor'), getDoctorAppointments);
router.get('/my', isAuthenticatedUser, authorizeRole('patient'), getPatientAppointments);
router.get('/viewDetails/:id', isAuthenticatedUser, authorizeRole('doctor', 'patient'), viewAppointmentDetails);
router.put('/reschedule/:id', isAuthenticatedUser, authorizeRole('patient', 'doctor'), rescheduleAppointment);
router.put('/cancel/:id', isAuthenticatedUser, authorizeRole('patient', 'doctor'), cancelAppointment);
router.put('/updateNote/:id', isAuthenticatedUser, authorizeRole('doctor'), updateAppointmentNote);
router.put('/updatestatus/:id', isAuthenticatedUser, authorizeRole('doctor'), updateAppointmentStatus);
router.delete('/delete/:id', isAuthenticatedUser, authorizeRole('doctor', 'patient'), deleteAppointment);
router.delete('/allbookingdelete', isAuthenticatedUser, authorizeRole('admin'), deleteAllAppointments);

module.exports = router;
