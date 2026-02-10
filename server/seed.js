import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';
import ExamSubmission from './models/ExamSubmission.js';
import Violation from './models/Violation.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-exam-platform');
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Exam.deleteMany({});
    await ExamSubmission.deleteMany({});
    await Violation.deleteMany({});
    console.log('Data cleared.');

    // Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const admin = await User.create({
      name: 'Dr. Jane Smith',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      department: 'Computer Science'
    });

    const student = await User.create({
      name: 'Alex Johnson',
      email: 'student@example.com',
      password: studentPassword,
      role: 'student',
      department: 'Computer Science'
    });
    console.log('Users created.');

    // Create a Sample Exam
    console.log('Creating sample exam...');
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1); // Started 1 hour ago
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // Ends in 2 hours

    const exam = await Exam.create({
      title: 'Full-Stack Security Assessment',
      createdBy: admin._id,
      duration: 60,
      startTime,
      endTime,
      questions: [
        {
          type: 'mcq',
          text: 'Which header is used to prevent Clickjacking?',
          options: ['X-Frame-Options', 'Content-Security-Policy', 'X-Content-Type-Options', 'Strict-Transport-Security'],
          correctAnswer: 'X-Frame-Options'
        },
        {
          type: 'mcq',
          text: 'What does JWT stand for?',
          options: ['JSON Web Token', 'Java Web Token', 'JSON Web Target', 'Joint Web Task'],
          correctAnswer: 'JSON Web Token'
        },
        {
          type: 'coding',
          text: 'Implement a function `solution(input)` that returns the reverse of the input string.',
          codeStub: 'function solution(input) {\n  // Your code here\n}',
          testCases: [
            { input: 'hello', output: 'olleh', isHidden: false },
            { input: 'world', output: 'dlrow', isHidden: false },
            { input: '12345', output: '54321', isHidden: true }
          ],
          allowedLanguages: ['javascript', 'python', 'java']
        }
      ],
      securityConfig: {
        webcamRequired: true,
        screenShareRequired: true,
        microphoneRequired: false,
        fullScreenRequired: true,
        disableCopyPaste: true,
        detectTabSwitching: true,
        detectDevTools: true,
        enablePlagiarismDetection: true,
        enableBehavioralAnalytics: true,
        maxWarnings: 5
      }
    });
    console.log('Exam created.');

    // Create a Mock Submission
    console.log('Creating mock submission...');
    const submission = await ExamSubmission.create({
      examId: exam._id,
      studentId: student._id,
      answers: [],
      score: 1,
      maxScore: 3,
      timeTaken: 1200,
      warnings: 2,
      verdict: 'suspicious',
      adminRemarks: 'Candidate switched tabs multiple times.',
      isDisqualified: false,
      submittedAt: new Date()
    });
    console.log('Submission created.');

    // Create Mock Violations
    console.log('Creating mock violations...');
    const sessionId = `${exam._id}_${student._id}`;
    await Violation.create([
      {
        sessionId,
        type: 'Tab Switch',
        evidence: { reason: 'User exited the browser tab' },
        timestamp: new Date(Date.now() - 1000 * 60 * 10)
      },
      {
        sessionId,
        type: 'Full Screen Exit',
        evidence: { reason: 'User exited full screen mode' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5)
      }
    ]);
    console.log('Violations created.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
