const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/error');

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Middleware 
app.use(cors({
    origin: [
      'http://localhost:3000',             // local dev
      'https://healthcare-dp.vercel.app',  // production
      'https://healthcare-git-master-lokesh-sainis-projects.vercel.app', // previews,
      'https://healthcare-git-feature-viewbooking-lokesh-sainis-projects.vercel.app/',
      'https://healthcare-pmpc8vf7h-lokesh-sainis-projects.vercel.app/'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // if you use cookies or auth headers
  }));
app.use(express.json()); //  Handles JSON body parsing
app.use(express.urlencoded({ extended: true })); //  Handles form submissions
app.use(cookieParser());

//  Route imports
const userRoutes = require('./routes/userRoute');
const doctorRoutes = require('./routes/doctorRoute');
const bookingRoutes = require('./routes/bookingRoute');
const chatRoutes = require('./routes/ChatRoute');

//  Use routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use("/api/v1/ai/chat", chatRoutes);

//  Error handler
app.use(errorMiddleware);

module.exports = app;
