const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/Auth');
const { bookAppointment, getDoctorAppointments, getPatientAppointments, cancelBooking,rescheduleBooking } = require('../controllers/bookingController');

router.route('/book').post(
    isAuthenticatedUser,
    authorizeRoles('patient'),
    bookAppointment);

router.route('/doctor').get(
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    getDoctorAppointments
);

router.route('/my').get(
    isAuthenticatedUser,
    authorizeRoles('patient'),
    getPatientAppointments
);

router.delete(
    '/cancel/:id',
    isAuthenticatedUser,
    authorizeRoles('patient','doctor'),
    cancelBooking
);
router.put(
    '/reschedule/:id',
    isAuthenticatedUser,
    authorizeRoles('patient','doctor'),
    rescheduleBooking
);

module.exports = router;
