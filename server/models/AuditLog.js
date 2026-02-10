import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login_attempt',
      'login_success',
      'login_failed',
      'permission_granted',
      'permission_denied',
      'violation_detected',
      'test_started',
      'test_submitted',
      'test_terminated',
      'admin_action',
      'api_access',
      'network_disconnect',
      'permission_revoked'
    ]
  },
  resource: {
    type: String, // 'exam', 'user', 'violation', etc.
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
