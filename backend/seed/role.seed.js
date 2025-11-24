module.exports = [
    {
      name: "patient",
      permissions: [
        "user.update_own_profile",
        "user.view_doctor_list",
  
        "doctor.view_public_profile",
  
        "appointment.view_doctors",
        "appointment.view_slots",
        "appointment.create",
        "appointment.update_own",
        "appointment.cancel_own",
        "appointment.reschedule_own",
        "appointment.view_own"
      ]
    },
  
    {
      name: "doctor",
      permissions: [
        // doctor account
        "doctor.update_profile",
        "doctor.add_slots",
        "doctor.edit_slots",
        "doctor.delete_slots",
  
        // doctor views patient
        "user.view_patient_basic",
  
        // appointment management
        "appointment.view_assigned",
        "appointment.view_upcoming",
        "appointment.view_completed",
        "appointment.view_cancelled",
        "appointment.mark_complete",
        "appointment.add_notes",
        "appointment.edit_notes",
        "appointment.cancel_patient_appointment",
        "appointment.view_patient_info",
        "appointment.view_cancellation_reason"
      ]
    },
  
    {
      name: "admin",
      permissions: "ALL"   // special flag to assign everything
    }
  ];
  