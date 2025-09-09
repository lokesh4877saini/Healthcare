const express = require('express');
const router = express.Router();

const { addDoctorSlots, updateDoctorSlotsAfterBooking, getDoctorSlots,getDoctorsBySpecialization,getAllDoctors, getDoctorById,getSpecializations,deleteSingleTimeSlot, deleteAllSlotsForDate } = require('../controllers/doctorController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/Auth');

router.route('/slots').post(isAuthenticatedUser,authorizeRoles('doctor'),addDoctorSlots)
                    .get(isAuthenticatedUser,authorizeRoles('doctor'),getDoctorSlots);

router.route('/update-slot').patch(isAuthenticatedUser,authorizeRoles('doctor', 'admin'),updateDoctorSlotsAfterBooking);
router.route('/delete-time-slot').delete(isAuthenticatedUser,authorizeRoles('doctor'),deleteSingleTimeSlot);
router.route('/delete-date-slot').delete(isAuthenticatedUser,authorizeRoles('doctor'),deleteAllSlotsForDate);

router.route('/').get(getDoctorsBySpecialization);

router.route('/:id').get(getDoctorById);

router.route('/lists/all').get(getAllDoctors);
// for dropdown
router.route('/specializations/all').get(getSpecializations); // GET specializations/all

module.exports = router;
