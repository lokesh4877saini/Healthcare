const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/Auth');
const { bookAppointment, getDoctorAppointments, getPatientAppointments, cancelBooking,rescheduleBooking, completeBooking, deleteBooking, viewBookingDetails } = require('../controllers/bookingController');

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
    '/delete/:id',
    isAuthenticatedUser,
    authorizeRoles('patient','doctor'),
    deleteBooking
);
router.put(
    '/reschedule/:id',
    isAuthenticatedUser,
    authorizeRoles('patient','doctor'),
    rescheduleBooking
);
router.put(
    '/complete/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    completeBooking
)
router.put(
    '/cancel/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    cancelBooking
)
router.get(
    '/viewDetails/:id',
    isAuthenticatedUser,
    authorizeRoles('doctor'),
    viewBookingDetails
)
module.exports = router;
