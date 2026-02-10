import express from 'express';
import Exam from '../models/Exam.js';
import ExamSession from '../models/ExamSession.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Violation from '../models/Violation.js';
import auth, { checkRole } from '../middleware/auth.js';
import { logAuditEvent } from './audit.js';
import BehavioralService from '../utils/BehavioralService.js';
import PlagiarismService from '../utils/PlagiarismService.js';

const router = express.Router();

// @route   POST api/exam
// @desc    Create a new exam
// @access  Private (Admin/Teacher only)
router.post('/', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
    try {
        const { title, duration, startTime, endTime, webcamRequired, screenShareRequired, questions } = req.body;
        
        if (!title || !title.trim()) return res.status(400).json({ msg: 'Exam title is required.' });
        if (!questions || questions.length === 0) return res.status(400).json({ msg: 'Please add at least one question.' });

        const newExam = new Exam({
            title: title.trim(),
            duration: duration || 60,
            questions,
            startTime: startTime || new Date(),
            endTime: endTime || new Date(Date.now() + (duration || 60) * 60000),
            createdBy: req.user.id,
            securityConfig: {
                webcamRequired: webcamRequired !== false,
                screenShareRequired: screenShareRequired !== false
            }
        });

        const exam = await newExam.save();
        res.json(exam);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/exam/:id
// @desc    Get exam by ID (for Student Landing)
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ msg: 'Invalid Exam ID' });
        }
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ msg: 'Exam not found' });
        
        // Check if student already submitted this exam
        if (req.user.role === 'student') {
            const submission = await ExamSubmission.findOne({ 
                examId: req.params.id, 
                studentId: req.user.id 
            });
            if (submission) {
                return res.status(403).json({ msg: 'Exam already submitted' });
            }
        }

        // Check if exam is Scheduled
        const now = new Date();
        if (exam.startTime && new Date(exam.startTime) > now) {
            return res.status(403).json({ msg: 'Exam has not started yet', startTime: exam.startTime });
        }
        if (exam.endTime && new Date(exam.endTime) < now) {
             return res.status(403).json({ msg: 'Exam has expired' });
        }

        res.json(exam);
    } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// @route   GET api/exam
// @desc    Get all exams (Admin View or Student Assigned View - simplified for now)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // If admin, return all created by them. If student, return all (demo) or assigned.
        let exams;
        if (req.user.role === 'student') {
             const examsFound = await Exam.find({
                 $or: [
                     { assignedTo: { $in: [req.user.id] } },
                     { assignedTo: { $size: 0 } }
                 ]
             }).sort({ createdAt: -1 }).lean();

             // Check submissions for each exam
             exams = await Promise.all(examsFound.map(async (exam) => {
                 const submission = await ExamSubmission.findOne({ 
                     examId: exam._id, 
                     studentId: req.user.id 
                 });
                 return { ...exam, hasSubmitted: !!submission };
             }));
        } else {
             exams = await Exam.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(exams);
    } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error');
    }
});

// @route   POST api/exam/:id/submit
// @desc    Submit exam answers
// @access  Private (Student only)
router.post('/:id/submit', [auth, checkRole(['student'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, timeTaken, violations, warnings, behavioralData } = req.body;
        
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ msg: 'Exam not found' });
        }
        
        // Calculate basic MCQ score
        let score = 0;
        let maxScore = exam.questions.length;
        
        for (const [questionIndex, answer] of Object.entries(answers)) {
            const question = exam.questions[questionIndex];
            if (!question) continue;
            
            if (question.type === 'mcq') {
                if (answer === question.correctAnswer) {
                    score += 1;
                }
            }
        }
        
        // Behavioral Analysis
        let behavioralScore = { overallRisk: 0 };
        try {
            behavioralScore = BehavioralService.process(behavioralData || {}, timeTaken, exam.questions.length || 1);
        } catch (err) {
            console.error('Behavioral analysis failed:', err);
        }

        // Plagiarism Detection
        let plagiarismScore = { percentage: 0 };
        try {
            const tempSubmission = { studentId: req.user.id, answers };
            plagiarismScore = await PlagiarismService.checkSubmissions(tempSubmission, id);
        } catch (err) {
            console.error('Plagiarism check failed:', err);
        }

        // Determine Verdict
        let verdict = 'clean';
        if (plagiarismScore.percentage > 70 || behavioralScore.overallRisk > 70 || (warnings || 0) > 5) {
            verdict = 'cheating';
        } else if (plagiarismScore.percentage > 40 || behavioralScore.overallRisk > 40 || (warnings || 0) > 2) {
            verdict = 'suspicious';
        }

        // Create submission
        const submission = new ExamSubmission({
            examId: id,
            studentId: req.user.id,
            answers,
            score,
            maxScore,
            timeTaken,
            warnings: warnings || 0,
            violations: violations || [],
            behavioralScore,
            plagiarismScore,
            behavioralLogs: behavioralData,
            verdict
        });
        
        await submission.save();
        
        logAuditEvent(req, 'test_submitted', 'exam', id, { submissionId: submission._id });
        
        res.json({ submission, score, maxScore });
    } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// @route   GET api/exam/:id/stats
// @desc    Get exam statistics (Admin only)
// @access  Private (Admin/Teacher only)
router.get('/:id/stats', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
    try {
        const { id } = req.params;
        
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ msg: 'Exam not found' });
        }
        
        // Check ownership
        if (exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        
        const submissions = await ExamSubmission.find({ examId: id });
        const violations = await Violation.find({ sessionId: { $regex: id } });
        
        const stats = {
            totalSubmissions: submissions.length,
            averageScore: submissions.length > 0 
                ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length 
                : 0,
            flaggedSubmissions: submissions.filter(s => s.verdict !== 'clean').length,
            totalViolations: violations.length,
            suspiciousAttempts: submissions.filter(s => 
                s.behavioralScore?.overallRisk < 50 || 
                s.plagiarismScore?.percentage > 70
            ).length
        };
        
        res.json(stats);
    } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// @route   DELETE api/exam/:id
// @desc    Delete an exam
// @access  Private (Admin/Teacher only)
router.delete('/:id', [auth, checkRole(['admin', 'teacher'])], async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ msg: 'Exam not found' });
        }

        // Check ownership
        if (exam.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await Exam.findByIdAndDelete(req.params.id);
        
        // Also delete related submissions/sessions if necessary (optional but good practice)
        await ExamSubmission.deleteMany({ examId: req.params.id });
        
        logAuditEvent(req, 'test_deleted', 'exam', req.params.id);
        
        res.json({ msg: 'Exam removed' });
    } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

export default router;

