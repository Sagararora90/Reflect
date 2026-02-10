import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { useProctoring } from '../hooks/useProctoring';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import { useDevTools } from '../hooks/useDevTools';
import CodeEditor from './CodeEditor';
import WarningSystem from './WarningSystem';
import { socket } from '../socket';
import API_URL from '../apiConfig';
import { 
  Shield, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Video,
  Monitor as MonitorIcon,
  Eye,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';


const Exam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, dispatch } = useExam();
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const [startTime] = useState(Date.now());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  /* State from Context or Fresh Start */
  const [hasStarted, setHasStarted] = useState(state.isExamActive || false); // Sync with global state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [behavioralLogs, setBehavioralLogs] = useState({
      keystrokes: [],
      pastes: [],
      focusChanges: []
  });

  const duration = state.examData?.duration || 60;
  const questions = state.examData?.questions || [];

  /* ── Capture Snapshot Helper (Moved Up) ── */
  const lastGoodSnap = useRef({ webcam: null, screen: null });
  const captureSnapshot = useCallback(() => {
      const snap = { webcam: null, screen: null };
      try {
          // readyState >= 2 means HAVE_CURRENT_DATA - enough for a screenshot
          if (videoRef.current && videoRef.current.readyState >= 2) {
              const canvas = document.createElement('canvas');
              canvas.width = 640; canvas.height = 480;
              canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              snap.webcam = canvas.toDataURL('image/jpeg', 0.85);
              lastGoodSnap.current.webcam = snap.webcam;
          } else {
              snap.webcam = lastGoodSnap.current.webcam; // Use last known good
          }
      } catch (e) {
          console.warn('Webcam capture failed:', e);
          snap.webcam = lastGoodSnap.current.webcam;
      }
      try {
          if (screenRef.current && screenRef.current.readyState >= 2) {
              const canvas = document.createElement('canvas');
              canvas.width = 1280; canvas.height = 720;
              canvas.getContext('2d').drawImage(screenRef.current, 0, 0, canvas.width, canvas.height);
              snap.screen = canvas.toDataURL('image/jpeg', 0.85);
              lastGoodSnap.current.screen = snap.screen;
          } else {
              snap.screen = lastGoodSnap.current.screen;
          }
      } catch (e) {
          console.warn('Screen capture failed:', e);
          snap.screen = lastGoodSnap.current.screen;
      }
      return snap;
  }, []);

  /* ── Resume Logic ── */
  useEffect(() => {
    // If we have exam data but inactive state (refresh), resume.
    if (!state.isExamActive && state.examData && state.examId) {
        dispatch({ type: 'RESUME_EXAM' });
        setHasStarted(true);
    }
  }, [state.examData, state.examId, state.isExamActive]);

  /* ── Countdown Timer ── */
  useEffect(() => {
      if (!hasStarted) return;
      setTimeLeft(duration * 60);
      const timer = setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  confirmSubmit();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (seconds) => {
      if (seconds == null) return `${duration}:00`;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeIsLow = timeLeft !== null && timeLeft < 120;

  /* ── Socket & Proctoring ── */
  useEffect(() => {
    // Debug: Log connection attempt
    const userId = user?._id || user?.id;
    console.log("Exam.jsx: Checking join-exam conditions", { 
        isActive: state.isExamActive, 
        userId: userId,
        examId: state.examId,
        socketConnected: socket.connected
    });

      if (state.isExamActive && userId && state.examId) {
          console.log("Exam.jsx: Joining exam room AND monitor room...");
          socket.emit('join-exam', state.examId, userId);
          
          socket.on('remote-command', ({ action, payload }) => {
              if (action === 'terminate') {
                  alert("Your exam has been ended by the proctor.");
                  confirmSubmit();
              }
              if (action === 'warn') {
                  dispatch({ type: 'ADD_WARNING', payload: { reason: 'Proctor Warning: ' + payload, time: new Date().toLocaleTimeString() } });
              }
          });
      }
      return () => { socket.off('remote-command'); };
  }, [state.isExamActive, user, state.examId]);

  useEffect(() => {
      let logInterval;
      const userId = user?._id || user?.id;
      if (state.isExamActive && userId && state.examId) {
        logInterval = setInterval(() => {
            const snap = captureSnapshot(); // Use the robust capture function
            console.log("Sending student pulse for exam:", state.examId, { socketConnected: socket.connected });
            
            // Force reconnect if needed? No, socket auto-reconnects.
            if (socket.connected) {
                socket.emit('student-pulse', {
                    examId: state.examId,
                    studentId: userId,
                    name: user.name || 'Student',
                    webcam: snap.webcam,
                    screen: snap.screen,
                    violations: state.warnings
                }); 
            } else {
                console.warn("Socket disconnected! Cannot send pulse.");
            }
        }, 3000);
      }
      return () => { if (logInterval) clearInterval(logInterval); };
  }, [state.isExamActive, state.examId, state.warnings, user]);

  const startAssessment = async () => {
      try {
          await document.documentElement.requestFullscreen();
          dispatch({ type: 'SET_FULLSCREEN', payload: true }); // Optimistic update to prevent overlay flash
          dispatch({ type: 'START_EXAM' });
          setHasStarted(true);
      } catch (err) {
          console.error("Fullscreen failed:", err);
          alert("Fullscreen mode is required to start the exam.");
      }
  };
  useAudioAnalysis(state.streams.webcam, captureSnapshot);
  useDevTools();
  /* captureSnapshot moved up */

  // Pass captureSnapshot to proctoring hooks so they can grab evidence on violation
  useProctoring({
      captureSnapshot,
      onViolation: (reason, evidence) => {
          // If evidence wasn't passed (fallback), capture it now
          if (!evidence) evidence = captureSnapshot();
          dispatch({ 
            type: 'ADD_WARNING', 
            payload: { reason, time: new Date().toLocaleTimeString(), timestamp: new Date(), evidence } 
          });

          fetch(`${API_URL}/api/violation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: reason, evidence, timestamp: Date.now(), sessionId: `${state.examId}_${user?._id}`, severity: 'medium' })
          }).catch(err => console.warn('Violation POST failed:', err));

          const userId = user?._id || user?.id;
          if (userId) {
              socket.emit('violation', {
                  examId: state.examId,
                  studentId: userId,
                  name: user.name || 'Student',
                  type: reason,
                  evidence,
                  timestamp: Date.now(),
                  violations: state.warnings + 1
              });
          }
      }
  });
  
  const { modelsLoaded } = useFaceDetection(videoRef, captureSnapshot);

  useEffect(() => {
    // dispatch({ type: 'START_EXAM' }); // Moved to startAssessment
    const attachStreams = () => {
      if (state.streams.webcam && videoRef.current) {
          videoRef.current.srcObject = state.streams.webcam;
          videoRef.current.play().catch(() => {});
      }
      if (state.streams.screen && screenRef.current) {
          screenRef.current.srcObject = state.streams.screen;
          screenRef.current.play().catch(() => {});
      }
    };
    attachStreams();
  }, [state.streams]);

  useEffect(() => {
      if (state.warnings >= state.maxWarnings) confirmSubmit();
  }, [state.warnings]);

  useEffect(() => {
     if (!state.examData) navigate('/student/dashboard');
  }, [state.examData]);

  const handleOptionSelect = (option) => setAnswers({ ...answers, [currentQuestion]: option });
  const handleNext = () => currentQuestion < questions.length - 1 && setCurrentQuestion(currentQuestion + 1);
  const handlePrev = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);

  const confirmSubmit = async () => {
      if (state.streams.webcam) state.streams.webcam.getTracks().forEach(track => track.stop());
      if (state.streams.screen) state.streams.screen.getTracks().forEach(track => track.stop());
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      try {
          const res = await fetch(`${API_URL}/api/exam/${state.examId}/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') },
              body: JSON.stringify({
                  answers, timeTaken,
                  violations: state.violations.map(v => ({ type: v.reason || v.type, timestamp: v.timestamp || new Date(), evidence: v.evidence })),
                  warnings: state.warnings,
                  behavioralData: behavioralLogs
              })
          });
          
          let data;
          try {
              data = await res.json();
          } catch (e) {
              data = { msg: 'Server error' };
          }

          if (!res.ok) throw new Error(data.msg || 'Submission failed');
          
          dispatch({ type: 'SUBMIT_EXAM' });
          navigate('/terminate');
      } catch (err) { 
          console.error(err);
          alert(err.message || 'Failed to submit exam. Please try again.'); 
      }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="bg-rf-void min-h-screen flex flex-col overflow-hidden h-screen">
        
        {/* Ready Overlay */}
        {!hasStarted && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-rf-canvas/95 backdrop-blur-2xl rf-animate-bloom">
                <div className="rf-card-glass max-w-sm w-full text-center p-8">
                    <div className="w-14 h-14 rf-glass rounded-xl flex items-center justify-center mx-auto mb-5 border-rf-border-glass">
                        <Shield size={28} className="text-rf-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-rf-text-pure mb-2">Ready to Begin</h2>
                    <p className="text-sm text-rf-text-dim mb-2 leading-relaxed">
                        All permissions are set. Your camera and screen will be monitored throughout the exam.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-rf-text-muted mb-6 py-3 border-y border-rf-border-glass">
                        <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                        <span className="text-rf-text-muted/30">•</span>
                        <span>{duration} minutes</span>
                    </div>
                    <button className="rf-btn rf-btn-primary w-full py-3 text-sm font-bold" onClick={startAssessment}>
                        Start Exam <Maximize2 size={16} className="ml-1" />
                    </button>
                </div>
            </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-rf-canvas/90 backdrop-blur-xl">
                <div className="rf-card-glass max-w-sm w-full text-center p-8 rf-animate-bloom">
                    <div className="w-12 h-12 bg-rf-accent/10 border border-rf-accent/20 rounded-xl flex items-center justify-center mx-auto mb-5 text-rf-accent">
                        <Send size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-rf-text-pure mb-2">Submit Exam?</h3>
                    <p className="text-sm text-rf-text-dim mb-6 leading-relaxed">
                        You've answered <span className="text-rf-text-pure font-bold">{answeredCount}</span> of <span className="text-rf-text-pure font-bold">{questions.length}</span> questions. 
                        This cannot be undone.
                    </p>
                    {answeredCount < questions.length && (
                        <div className="flex items-center gap-2 bg-rf-warning/10 border border-rf-warning/20 rounded-lg p-3 mb-4 text-xs text-rf-warning font-semibold">
                            <AlertTriangle size={14} /> {questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} unanswered
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button className="flex-1 rf-btn rf-btn-secondary py-3 !rounded-lg text-sm font-semibold" onClick={() => setShowSubmitModal(false)}>Go Back</button>
                        <button className="flex-1 rf-btn rf-btn-primary py-3 !rounded-lg text-sm font-semibold" onClick={confirmSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        )}

        <WarningSystem />

        {/* ═══ Top Bar ═══ */}
        <header className="rf-exam-hud">
            <div className="flex items-center gap-3">
                <div className="rf-glass w-8 h-8 rounded-lg flex items-center justify-center border-rf-border-glass">
                    <Shield size={16} className="text-rf-accent" />
                </div>
                <div>
                    <p className="text-[9px] font-semibold text-rf-text-muted uppercase tracking-wider leading-none mb-0.5">Proctored Exam</p>
                    <p className="text-sm font-bold text-rf-text-pure truncate max-w-[250px] leading-tight">{state.examData?.title}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Progress indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rf-panel/30 border border-rf-border-glass rounded-lg">
                    <span className="text-[10px] text-rf-text-muted font-semibold">{answeredCount}/{questions.length}</span>
                    <div className="w-16 h-1.5 bg-rf-panel/60 rounded-full overflow-hidden">
                        <div className="h-full bg-rf-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-bold ${timeIsLow ? 'bg-rf-danger/10 border-rf-danger/30 text-rf-danger' : 'bg-rf-panel/40 border-rf-border-glass text-rf-text-pure'}`}>
                    <Clock size={14} className={timeIsLow ? 'text-rf-danger animate-pulse' : 'text-rf-accent'} />
                    {formatTime(timeLeft)}
                </div>

                {/* Submit button */}
                <button className="rf-btn rf-btn-primary py-1.5 px-4 text-xs font-bold gap-1" onClick={() => setShowSubmitModal(true)}>
                    Submit <Send size={12} />
                </button>
            </div>
        </header>

        {/* ═══ Body: Main + Sidebar ═══ */}
        <div className="rf-exam-body">
            
            {/* ── Question Area ── */}
            <main className="rf-exam-main p-4">
                <div className="rf-card-glass p-5 flex flex-col h-full overflow-hidden">
                    {/* Question Header */}
                    <div className="mb-4 pb-3 border-b border-rf-border-glass">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-rf-accent">
                                Question {currentQuestion + 1} <span className="text-rf-text-muted font-normal">of {questions.length}</span>
                            </p>
                            {answers[currentQuestion] && (
                                <span className="flex items-center gap-1 text-[10px] text-rf-success font-bold">
                                    <CheckCircle2 size={11} /> Answered
                                </span>
                            )}
                        </div>
                        <h2 className="text-base font-bold text-rf-text-pure leading-snug">
                            {questions[currentQuestion]?.text}
                        </h2>
                    </div>

                    {/* Answer Area */}
                    <div className="flex-1 overflow-y-auto mb-4 pr-1 custom-scrollbar">
                        {questions[currentQuestion]?.type === 'coding' ? (
                            <div className="h-[450px]">
                                <CodeEditor 
                                    question={questions[currentQuestion]} 
                                    onCodeChange={(code) => handleOptionSelect(code)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {questions[currentQuestion]?.options?.map((option, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                                            answers[currentQuestion] === option 
                                            ? 'bg-rf-accent/10 border-rf-accent/40' 
                                            : 'bg-rf-panel/20 border-rf-border-glass hover:bg-rf-panel/40 hover:border-rf-accent/20'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            answers[currentQuestion] === option 
                                            ? 'border-rf-accent bg-rf-accent' 
                                            : 'border-rf-text-muted'
                                        }`}>
                                            {answers[currentQuestion] === option && <CheckCircle2 size={10} className="text-white" />}
                                        </div>
                                        <span className={`text-sm ${
                                            answers[currentQuestion] === option ? 'text-rf-text-pure font-medium' : 'text-rf-text-dim'
                                        }`}>{option}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-3 border-t border-rf-border-glass mt-auto">
                        <button className="rf-btn rf-btn-secondary !px-4 !py-2 !rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-30" onClick={handlePrev} disabled={currentQuestion === 0}>
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <span className="text-[10px] text-rf-text-muted font-semibold">
                            {currentQuestion + 1} / {questions.length}
                        </span>
                        <button 
                            className={`rf-btn !px-4 !py-2 !rounded-lg text-xs font-semibold flex items-center gap-1 ${currentQuestion === questions.length - 1 ? 'rf-btn-primary' : 'rf-btn-secondary'}`} 
                            onClick={currentQuestion === questions.length - 1 ? () => setShowSubmitModal(true) : handleNext}
                        >
                            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </main>

            {/* ── Sidebar ── */}
            <aside className="rf-exam-sidebar bg-rf-surface/50 border-l border-rf-border-glass p-3 gap-3">
                {/* Camera Feed */}
                <div className="mb-3">
                    <div className="aspect-video rf-card-glass !p-0 !rounded-lg relative overflow-hidden">
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                        <video ref={screenRef} autoPlay muted style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-rf-canvas/80 backdrop-blur-md rounded-full border border-rf-border-glass">
                            <div className="w-1.5 h-1.5 rounded-full bg-rf-danger animate-pulse" />
                            <span className="text-[8px] font-bold text-rf-text-pure">LIVE</span>
                        </div>
                    </div>
                    <p className="text-[9px] text-center text-rf-text-muted mt-1">Camera Feed</p>
                </div>

                {/* Monitoring Status */}
                <div className="rf-card-glass !p-3 bg-rf-panel/20 mb-3">
                    <p className="text-[9px] font-bold text-rf-text-muted uppercase tracking-wider mb-2">Monitoring</p>
                    <div className="space-y-2">
                        <StatusLine icon={<Video size={12}/>} label="Camera" active={modelsLoaded} />
                        <StatusLine icon={<MonitorIcon size={12}/>} label="Screen" active={state.streams.screen !== null} />
                        <StatusLine icon={<Eye size={12}/>} label="Tab Tracking" active={true} />
                    </div>
                </div>

                {/* Warnings */}
                {state.warnings > 0 && (
                    <div className="rf-card-glass !p-3 bg-rf-danger/5 border-rf-danger/20 mb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-rf-danger" />
                                <span className="text-[10px] font-bold text-rf-danger">Warnings</span>
                            </div>
                            <span className="text-sm font-bold text-rf-danger">{state.warnings}<span className="text-[10px] text-rf-text-muted font-normal"> / {state.maxWarnings}</span></span>
                        </div>
                    </div>
                )}

                {/* Question Navigator */}
                <div>
                    <p className="text-[9px] font-bold text-rf-text-muted uppercase tracking-wider mb-2">Questions</p>
                    <div className="rf-index-grid bg-rf-panel/20 p-2 rounded-lg border border-rf-border-glass">
                        {questions.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                className={`w-full aspect-square flex items-center justify-center rounded-md text-[10px] font-bold transition-all relative ${
                                    i === currentQuestion 
                                    ? 'bg-rf-accent text-white shadow-sm' 
                                    : answers[i]
                                    ? 'bg-rf-success/10 text-rf-success border border-rf-success/30'
                                    : 'bg-rf-panel/40 text-rf-text-muted border border-rf-border-glass hover:text-rf-text-pure'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[9px] text-rf-text-muted px-0.5">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rf-success/20 border border-rf-success/40 rounded-sm" /> Answered</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rf-panel/40 border border-rf-border-glass rounded-sm" /> Pending</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>
  );
};

/* Status indicator */
const StatusLine = ({ icon, label, active }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-rf-text-silver font-medium">
            <span className={active ? 'text-rf-accent' : 'text-rf-text-dim'}>{icon}</span>
            {label}
        </div>
        <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-rf-success' : 'bg-rf-danger'}`} />
            <span className={`text-[8px] font-bold ${active ? 'text-rf-success' : 'text-rf-danger'}`}>{active ? 'ON' : 'OFF'}</span>
        </div>
    </div>
);

export default Exam;
