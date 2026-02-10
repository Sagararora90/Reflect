import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for dev, restrict in prod
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Routes Imports
import examRoutes from './routes/exam.js';
import violationRoutes from './routes/violation.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import executeRoutes from './routes/execute.js';
import reportsRoutes from './routes/reports.js';
import auditRoutes from './routes/audit.js';

app.use('/api/exam', examRoutes);
app.use('/api/violation', violationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-exam-platform';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Secure Exam Platform API is Running');
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  socket.on('join-exam', (examId, userId) => {
      socket.join(examId); // Room for general exam announcements
      if (userId) {
          socket.join(`student-${userId}`); // Room for direct commands to this student
      }
      console.log(`Socket ${socket.id} joined exam ${examId} as ${userId}`);
  });

  socket.on('join-monitor', (examId) => {
      socket.join(`monitor-${examId}`);
      console.log(`Admin ${socket.id} joined monitor room: monitor-${examId}`);
  });

  socket.on('student-pulse', (data) => {
      // data: { examId, studentId, name, webcam, screen, violations }
      // console.log(`Pulse from ${data.studentId}`); // verbose
      // Relay to the monitor room
      io.to(`monitor-${data.examId}`).emit('monitor-update', data);
  });

  socket.on('admin-action', ({ studentId, action, payload }) => {
      console.log(`Admin action ${action} on ${studentId}`);
      io.to(`student-${studentId}`).emit('remote-command', { action, payload });
  });

  socket.on('violation', (data) => {
      console.log('⚠️ Violation Reported:', data);
      io.to(`monitor-${data.examId}`).emit('monitor-alert', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client Disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
