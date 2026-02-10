import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [
    {
      text: { type: String, required: true },
      options: [String], // For MCQ
      correctAnswer: String, // For MCQ
      type: { type: String, enum: ['mcq', 'coding'], default: 'mcq' },
      // Coding specific fields
      testCases: [
        {
          input: String,
          output: String,
          isHidden: { type: Boolean, default: false }
        }
      ],
      allowedLanguages: {
          type: [String],
          default: ['javascript', 'python', 'java'] 
      },
      codeStub: String // Initial code provided to student
    }
  ],
  duration: {
    type: Number, // in minutes
    required: true
  },
  startTime: Date,
  endTime: Date,
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  securityConfig: {
    webcamRequired: { type: Boolean, default: true },
    screenShareRequired: { type: Boolean, default: true },
    microphoneRequired: { type: Boolean, default: true },
    fullScreenRequired: { type: Boolean, default: true },
    disableCopyPaste: { type: Boolean, default: true },
    detectTabSwitching: { type: Boolean, default: true },
    detectDevTools: { type: Boolean, default: true },
    enablePlagiarismDetection: { type: Boolean, default: true },
    enableBehavioralAnalytics: { type: Boolean, default: true },
    maxWarnings: { type: Number, default: 5 }
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  testType: {
    type: String,
    enum: ['MCQ', 'Coding', 'Mixed'],
    default: 'Mixed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Exam', examSchema);
