
const express = require('express');
const router = express.Router();

// Controllers
const {
    registerUser,
    loginUser,
    getUserDetails,
    logout,
    deleteAllUser,
} = require('user/user.controller');

const {
    addDoctorSlots,
    updateDoctorSlotsAfterBooking,
    getDoctorSlots,
    getDoctorsBySpecialization,
    getAllDoctors,
    getDoctorById,
    getSpecializations,
    deleteSingleTimeSlot,
    deleteAllSlotsForDate,
} = require('user/user.doctor.controller');

// Middleware
const { isAuthenticatedUser, authorizeRoles } = require('core/middleware/Auth');

/* ------------------- USER ROUTES ------------------- */
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', isAuthenticatedUser, authorizeRoles('patient', 'doctor'), getUserDetails);
router.delete('/delete/all', deleteAllUser);

/* ------------------- DOCTOR ROUTES ------------------- */
router
    .route('/doctor/slots')
    .post(isAuthenticatedUser, authorizeRoles('doctor'), addDoctorSlots)
    .get(isAuthenticatedUser, authorizeRoles('doctor'), getDoctorSlots);

router
    .route('/doctor/update-slot')
    .patch(isAuthenticatedUser, authorizeRoles('doctor', 'admin'), updateDoctorSlotsAfterBooking);

router
    .route('/doctor/delete-time-slot')
    .delete(isAuthenticatedUser, authorizeRoles('doctor'), deleteSingleTimeSlot);

router
    .route('/doctor/delete-date-slot')
    .delete(isAuthenticatedUser, authorizeRoles('doctor'), deleteAllSlotsForDate);

router.get('/doctor', getDoctorsBySpecialization);
router.get('/doctor/lists/all', getAllDoctors);
router.get('/doctor/specializations/all', getSpecializations);
router.get('/doctor/:id', getDoctorById);

module.exports = router;
