module.exports = [
    // -----------------------------
    // USER MODULE
    // -----------------------------
    { module: "user", key: "user.update_own_profile", name: "Update Own Profile" },
    { module: "user", key: "user.view_doctor_list", name: "View Doctor List" },
    { module: "user", key: "user.view_patient_basic", name: "Doctor View Patient Info" },
    { module: "user", key: "user.manage_all", name: "Admin Manage All Users" },
  
    // -----------------------------
    // DOCTOR MODULE
    // -----------------------------
    { module: "doctor", key: "doctor.update_profile", name: "Update Doctor Profile" },
    { module: "doctor", key: "doctor.add_slots", name: "Add Available Slots" },
    { module: "doctor", key: "doctor.edit_slots", name: "Edit Available Slots" },
    { module: "doctor", key: "doctor.delete_slots", name: "Delete Available Slots" },
    { module: "doctor", key: "doctor.view_public_profile", name: "View Doctor Profile" },
    { module: "doctor", key: "doctor.manage_all", name: "Admin Manage Doctor Accounts" },
  
    // -----------------------------
    // APPOINTMENT MODULE
    // -----------------------------
    
    // PATIENT PERMISSIONS
    { module: "appointment", key: "appointment.view_doctors", name: "Patient View Doctors" },
    { module: "appointment", key: "appointment.view_slots", name: "Patient View Slots" },
    { module: "appointment", key: "appointment.create", name: "Create Appointment" },
    { module: "appointment", key: "appointment.update_own", name: "Update Own Appointment" },
    { module: "appointment", key: "appointment.cancel_own", name: "Cancel Own Appointment" },
    { module: "appointment", key: "appointment.reschedule_own", name: "Reschedule Own Appointment" },
    { module: "appointment", key: "appointment.view_own", name: "View Own Appointment" },
  
    // DOCTOR PERMISSIONS
    { module: "appointment", key: "appointment.view_assigned", name: "Doctor View Assigned Appointments" },
    { module: "appointment", key: "appointment.view_upcoming", name: "Doctor View Upcoming" },
    { module: "appointment", key: "appointment.view_completed", name: "Doctor View Completed" },
    { module: "appointment", key: "appointment.view_cancelled", name: "Doctor View Cancelled" },
    { module: "appointment", key: "appointment.mark_complete", name: "Mark Appointment Completed" },
    { module: "appointment", key: "appointment.add_notes", name: "Add Notes" },
    { module: "appointment", key: "appointment.edit_notes", name: "Edit Notes" },
    { module: "appointment", key: "appointment.cancel_patient_appointment", name: "Doctor Cancel Appointment" },
    { module: "appointment", key: "appointment.view_patient_info", name: "Doctor View Patient Info" },
    { module: "appointment", key: "appointment.view_cancellation_reason", name: "Doctor View Cancellation Reason" },
  
    // ADMIN PERMISSION
    { module: "appointment", key: "appointment.manage_all", name: "Admin Manage All Appointments" }
  ];
  