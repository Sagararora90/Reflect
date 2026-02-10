import express from 'express';
import AuditLog from '../models/AuditLog.js';
import auth, { checkRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Log an audit event
 */
export function logAuditEvent(req, action, resource = null, resourceId = null, details = {}) {
  const log = new AuditLog({
    userId: req.user?.id || null,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });
  
  log.save().catch(err => {
    console.error('Failed to save audit log:', err);
  });
}

/**
 * Get audit logs (Admin only)
 */
router.get('/', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate, limit = 100 } = req.query;
    
    const query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
