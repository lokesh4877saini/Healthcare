# 🏥 Healthcare App

A modern, full-stack healthcare booking system where patients can securely book, reschedule, and manage appointments with trusted doctors — anytime, anywhere.

---

## ✨ Features

✅ Doctor & Patient Authentication (role-based)  
✅ Book, reschedule, or cancel appointments  
✅ Doctor availability & slots management  
✅ Secure API with JWT and context-based auth  
✅ Responsive design with modular CSS  
✅ Attractive homepage with random doctor & patient showcase slider

---

## 🧩 Tech Stack

- **Frontend:** Next.js 14+, React, Swiper.js, CSS Modules / Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Auth:** JWT, Context API
- **Deployment:** Vercel

---

## 📁 Project Structure
```bash
root
└───src
    ├───app
    │   ├───doctor
    │   │   ├───appointments
    │   │   │   └───view
    │   │   │       ├───board
    │   │   │       └───tab
    │   │   ├───slots
    │   │   └───[id]
    │   ├───patients
    │   │   ├───doctors
    │   │   │   └───[id]
    │   │   ├───new-booking
    │   │   └───view-bookings
    │   ├───profile
    │   │   └───me
    │   └───users
    │       ├───login
    │       └───register
    ├───components
    │   ├───cancelled
    │   ├───completed
    │   ├───manageSlots
    │   │   ├───columns
    │   │   └───view
    │   └───upcomming
    │       ├───AddNote
    │       ├───cancel
    │       └───Reschedule
    ├───context
    ├───hooks
    │   ├───Appointments
    │   └───slot
    ├───lib
    │   └───utils
    ├───services
    └───styles
```
Project in Development


