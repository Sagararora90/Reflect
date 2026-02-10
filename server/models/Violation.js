import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // Changed from ObjectId to String to support 'exam_101'
  type: {
      type: String,
      required: true
  },
  timestamp: { type: Date, default: Date.now },
  evidence: {
      webcam: String, // Base64
      screen: String  // Base64
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
});

export default mongoose.model('Violation', violationSchema);
