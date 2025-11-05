const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./modules/core/middleware/error');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.68:3000',
  'https://healthcare-dp.vercel.app',
  'https://healthcare-git-feature-viewbooking-lokesh-sainis-projects.vercel.app',
  'https://healthcare-git-master-lokesh-sainis-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const vercelPreviewRegex = /^https:\/\/healthcare-[a-zA-Z0-9-]+-lokesh-sainis-projects\.vercel\.app\/?$/;
    if (vercelPreviewRegex.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const { routes: userRoutes } = require('user');
const { routes: appointmentRoutes } = require('./modules/appointment');
const { routes: chatRoutes } = require('./modules/chat');

app.use('/api/v1', userRoutes);
app.use('/api/v1/doctor', userRoutes);
app.use('/api/v1/appointment', appointmentRoutes);
app.use('/api/v1/ai/chat', chatRoutes);


app.use(errorMiddleware);

module.exports = app;
