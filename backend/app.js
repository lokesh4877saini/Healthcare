const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/error');

// Load env variables
dotenv.config({ path: "./config/config.env" });

const allowedOrigins = [
  'http://localhost:3000',             // local dev
  'https://healthcare-dp.vercel.app',  // production
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Allow if origin is in allowedOrigins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Regex for all Vercel preview deployments
    const vercelPreviewRegex = /^https:\/\/healthcare-[a-zA-Z0-9-]+-lokesh-sainis-projects\.vercel\.app\/?$/;

    if (vercelPreviewRegex.test(origin)) return callback(null, true);

    // Deny all others
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};
app.use(cors(corsOptions))
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
