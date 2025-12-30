const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    getUserDetails,
    deleteAllUsers, // note plural
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

const { authorizeRoles:authorizeRole,hasPermission } = require('../core/access-control');
const { isAuthenticatedUser } = require('../core/middleware/Auth');

/* USER ROUTES */
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout",logout)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/profile', isAuthenticatedUser, updateProfile);
router.get('/me', isAuthenticatedUser, getUserDetails);
router.delete('/delete/all', deleteAllUsers);

/* DOCTOR ROUTES */
router
    .route('/doctor/slots')
    .post(isAuthenticatedUser, authorizeRole('doctor'), addDoctorSlots)
    .get(isAuthenticatedUser, authorizeRole('doctor'), getDoctorSlots);

router
    .route('/doctor/update-slot')
    .patch(isAuthenticatedUser, authorizeRole('doctor', 'admin'), updateDoctorSlotsAfterBooking);

router
    .route('/doctor/delete-time-slot')
    .delete(isAuthenticatedUser, authorizeRole('doctor'),hasPermission("doctor.slot.delete"),deleteSingleTimeSlot);

router
    .route('/doctor/delete-date-slot')
    .delete(isAuthenticatedUser, authorizeRole('doctor'), deleteAllSlotsForDate);

router.get('/doctor', getDoctorsBySpecialization);
router.get('/doctor/lists/all', getAllDoctors);
router.get('/doctor/specializations/all', getSpecializations);
router.get('/doctor/:id', getDoctorById);

module.exports = router;
