import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Can store MCQ answers or code solutions
    default: {}
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  warnings: {
    type: Number,
    default: 0
  },
  violations: [{
    type: {
      type: String,
      required: true
    },
    timestamp: Date,
    evidence: {
      webcam: String,
      screen: String
    }
  }],
  behavioralScore: {
    typingPattern: Number, // 0-100
    timingAnalysis: Number, // 0-100
    pauseAnalysis: Number, // 0-100
    overallRisk: Number // 0-100
  },
  plagiarismScore: {
    percentage: Number, // 0-100
    integrityScore: Number, // 0-100
    matches: [{
      source: String, // 'github', 'cross-candidate', 'ai-generated'
      similarity: Number,
      details: String
    }]
  },
  behavioralLogs: {
    type: Object,
    default: {}
  },
  recordings: {
    webcam: String, // URL or path to recording
    screen: String // URL or path to recording
  },
  verdict: {
    type: String,
    enum: ['clean', 'suspicious', 'cheating'],
    default: 'clean'
  },
  adminRemarks: String,
  isDisqualified: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('ExamSubmission', examSubmissionSchema);
