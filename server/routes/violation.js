import express from 'express';
import Violation from '../models/Violation.js';

const router = express.Router();

/**
 * POST /api/violation
 * Record a proctoring violation with optional evidence
 * No auth required — called from the exam client during proctoring
 */
router.post('/', async (req, res) => {
  try {
    const { type, evidence, timestamp, sessionId, severity } = req.body;
    
    if (!sessionId || !type) {
      return res.status(400).json({ msg: 'sessionId and type are required' });
    }

    const newViolation = new Violation({
      sessionId,
      type,
      evidence: evidence || {},
      timestamp: timestamp || Date.now(),
      severity: severity || 'medium'
    });

    await newViolation.save();
    res.json(newViolation);
  } catch (err) {
    console.error('Violation save error:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

/**
 * GET /api/violation/report?sessionId=xxx
 * Get all violations for a session
 */
router.get('/report', async (req, res) => {
    try {
        const sessionId = req.query.sessionId;
        if (!sessionId) {
            return res.status(400).json({ msg: 'sessionId query param required' });
        }
        const violations = await Violation.find({ sessionId }).sort({ timestamp: 1 });
        res.json(violations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
