import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  examId: { type: String, required: true },
  accessCode: { type: String, unique: true },
  startTime: { type: Date },
  endTime: { type: Date },
  status: { 
      type: String, 
      enum: ['pending', 'active', 'completed', 'terminated'], 
      default: 'pending' 
  },
  warnings: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ExamSession', sessionSchema);
