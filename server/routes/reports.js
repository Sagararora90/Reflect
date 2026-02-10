import express from 'express';
import ExamSubmission from '../models/ExamSubmission.js';
import Exam from '../models/Exam.js';
import Violation from '../models/Violation.js';
import auth, { checkRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all submissions for an exam (Admin only)
 */
router.get('/exam/:examId/submissions', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
  try {
    const { examId } = req.params;
    
    const submissions = await ExamSubmission.find({ examId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
  }
});

/**
 * Get detailed report for a specific submission
 */
router.get('/submission/:submissionId', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await ExamSubmission.findById(submissionId)
      .populate('studentId', 'name email')
      .populate('examId', 'title duration questions');
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Get violations from the separate Violation collection
    const collectionViolations = await Violation.find({ 
      sessionId: `${submission.examId._id.toString()}_${submission.studentId._id.toString()}`
    }).sort({ timestamp: 1 });
    
    // Merge with embedded violations from the submission itself
    const embeddedViolations = (submission.violations || []).map(v => ({
      type: v.type,
      timestamp: v.timestamp,
      evidence: v.evidence || {},
      severity: 'medium',
      _source: 'submission'
    }));
    
    const externalViolations = collectionViolations.map(v => ({
      type: v.type,
      timestamp: v.timestamp,
      evidence: v.evidence || {},
      severity: v.severity || 'medium',
      _source: 'collection'
    }));
    
    // Combine and sort by timestamp, deduplicating by timestamp+type
    const allViolations = [...embeddedViolations, ...externalViolations];
    const seen = new Set();
    const violations = allViolations
      .filter(v => {
        const key = `${v.type}_${new Date(v.timestamp).getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      submission,
      violations,
      warningCount: submission.warnings || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
  }
});

/**
 * Update submission verdict and remarks (Admin only)
 */
router.patch('/submission/:submissionId', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { verdict, adminRemarks, isDisqualified, isLocked } = req.body;
    
    const submission = await ExamSubmission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    if (verdict) submission.verdict = verdict;
    if (adminRemarks !== undefined) submission.adminRemarks = adminRemarks;
    if (isDisqualified !== undefined) submission.isDisqualified = isDisqualified;
    if (isLocked !== undefined) submission.isLocked = isLocked;
    
    await submission.save();
    
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
  }
});

/**
 * Export report as CSV
 */
router.get('/exam/:examId/export/csv', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
  try {
    const { examId } = req.params;
    
    const submissions = await ExamSubmission.find({ examId })
      .populate('studentId', 'name email');
    
    // Generate CSV
    const headers = ['Student Name', 'Email', 'Score', 'Max Score', 'Time Taken', 'Warnings', 'Verdict', 'Submitted At'];
    const rows = submissions.map(s => [
      s.studentId.name,
      s.studentId.email,
      s.score,
      s.maxScore,
      s.timeTaken,
      s.warnings,
      s.verdict,
      s.submittedAt.toISOString()
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=exam-${examId}-report.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
  }
});

export default router;
