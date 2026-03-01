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
  AlertTriangle,
  Zap
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Exam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, dispatch } = useExam();
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const [startTime] = useState(Date.now());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hasStarted, setHasStarted] = useState(state.isExamActive || false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [behavioralLogs, setBehavioralLogs] = useState({
      keystrokes: [],
      pastes: [],
      focusChanges: []
  });
  const examContainerRef = useRef(null);

  useGSAP(() => {
    if (hasStarted) {
      gsap.from(".exam-fade-in", {
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        clearProps: "all"
      });

      // Magnetic options
      const options = document.querySelectorAll(".magnetic-option");
      options.forEach(opt => {
        opt.addEventListener("mousemove", (e) => {
            const rect = opt.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(opt, { x: x * 0.1, y: y * 0.1, duration: 0.5, ease: "power2.out" });
        });
        opt.addEventListener("mouseleave", () => {
            gsap.to(opt, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
        });
      });
    }
  }, { dependencies: [hasStarted], scope: examContainerRef });

  const duration = state.examData?.duration || 60;
  const questions = state.examData?.questions || [];

  const lastGoodSnap = useRef({ webcam: null, screen: null });
  const captureSnapshot = useCallback(() => {
      const snap = { webcam: null, screen: null };
      try {
          if (videoRef.current && videoRef.current.readyState >= 2) {
              const canvas = document.createElement('canvas');
              canvas.width = 640; canvas.height = 480;
              canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              snap.webcam = canvas.toDataURL('image/jpeg', 0.85);
              lastGoodSnap.current.webcam = snap.webcam;
          } else {
              snap.webcam = lastGoodSnap.current.webcam;
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

  useEffect(() => {
    if (!state.isExamActive && state.examData && state.examId) {
        dispatch({ type: 'RESUME_EXAM' });
        setHasStarted(true);
    }
  }, [state.examData, state.examId, state.isExamActive]);

  useEffect(() => {
      if (!hasStarted) return;
      setTimeLeft(duration * 60);
      const timer = setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  confirmSubmit('timeout');
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

  useEffect(() => {
      const userId = user?._id || user?.id;
      if (state.isExamActive && userId && state.examId) {
          socket.emit('join-exam', state.examId, userId);
          
          socket.on('remote-command', ({ action, payload }) => {
              if (action === 'terminate') {
                  dispatch({ type: 'SET_PROCTOR_MESSAGE', payload: "Your exam has been ENDED by the proctor." });
                  const snap = captureSnapshot();
                  dispatch({ 
                      type: 'ADD_WARNING', 
                      payload: { 
                          reason: 'Exam Terminated by Proctor', 
                          time: new Date().toLocaleTimeString(), 
                          timestamp: new Date(), 
                          evidence: snap.webcam 
                      } 
                  });
                  setTimeout(() => confirmSubmit('proctor_terminated'), 2000); 
              }
              if (action === 'warn') {
                  const msg = 'Proctor Warning: ' + payload;
                  dispatch({ type: 'SET_PROCTOR_MESSAGE', payload: msg });
                  dispatch({ 
                      type: 'ADD_WARNING', 
                      payload: { 
                          reason: msg, 
                          time: new Date().toLocaleTimeString(), 
                          timestamp: new Date() 
                      } 
                  });
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
            const snap = captureSnapshot();
            if (socket.connected) {
                socket.emit('student-pulse', {
                    examId: state.examId,
                    studentId: userId,
                    name: user.name || 'Student',
                    webcam: snap.webcam,
                    screen: snap.screen,
                    violations: state.warnings
                }); 
            }
        }, 3000);
      }
      return () => { if (logInterval) clearInterval(logInterval); };
  }, [state.isExamActive, state.examId, state.warnings, user]);

  const startAssessment = async () => {
      try {
          await document.documentElement.requestFullscreen();
          dispatch({ type: 'SET_FULLSCREEN', payload: true });
          dispatch({ type: 'START_EXAM' });
          setHasStarted(true);
      } catch (err) {
          console.error("Fullscreen failed:", err);
          alert("Fullscreen mode is required to start the exam.");
      }
  };

  useAudioAnalysis(state.streams.webcam, captureSnapshot);
  useDevTools();

  useProctoring({
      captureSnapshot,
      onViolation: (reason, evidence) => {
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
      if (state.warnings >= state.maxWarnings) confirmSubmit('max_warnings');
  }, [state.warnings]);

  useEffect(() => {
     if (!state.examData) navigate('/student/dashboard');
  }, [state.examData]);

  const handleOptionSelect = (option) => setAnswers({ ...answers, [currentQuestion]: option });
  const handleNext = () => currentQuestion < questions.length - 1 && setCurrentQuestion(currentQuestion + 1);
  const handlePrev = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);

  const confirmSubmit = async (reason = 'manual') => {
      if (typeof reason !== 'string') reason = 'manual';

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
                  behavioralData: behavioralLogs,
                  submissionReason: reason
              })
          });
          
          let data;
          try {
              data = await res.json();
          } catch (e) {
              data = { msg: 'Server error' };
          }

          if (!res.ok) throw new Error(data.msg || 'Submission failed');
          
          dispatch({ type: 'SUBMIT_EXAM', payload: reason });
          navigate('/terminate');
      } catch (err) { 
          console.error(err);
          alert(err.message || 'Failed to submit exam. Please try again.'); 
      }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div ref={examContainerRef} className="bg-[#f5f5f7] min-h-screen flex flex-col overflow-hidden h-screen text-text-primary">
        
        {/* Ready Overlay */}
        {!hasStarted && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="card max-w-sm w-full text-center p-8 md:p-10 shadow-2xl">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border shadow-sm text-primary">
                        <Shield size={32} />
                    </div>
                    <h2 className="heading-2 mb-2">Ready to Begin</h2>
                    <p className="text-body mb-6">
                        All permissions are verified. Your camera and screen will be monitored throughout the exam.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-8 py-4 border-y border-border bg-surface">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-status-success"/> {questions.length} items</span>
                        <span className="text-text-tertiary">|</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary"/> {duration} mins</span>
                    </div>
                    <button className="btn btn-primary w-full py-3.5 shadow-md flex justify-center items-center gap-2" onClick={startAssessment}>
                        Start Assessment <Maximize2 size={16} />
                    </button>
                </div>
            </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="card max-w-sm w-full text-center p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                        <Send size={28} />
                    </div>
                    <h3 className="heading-2 mb-2">Confirm Submission</h3>
                    <p className="text-body mb-6">
                        You have completed <span className="font-bold text-text-primary">{answeredCount}</span> of <span className="font-bold text-text-primary">{questions.length}</span> questions. 
                        This action is irreversible.
                    </p>
                    {answeredCount < questions.length && (
                        <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-status-warning font-semibold shadow-sm">
                            <AlertTriangle size={16} /> {questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} unanswered
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 btn btn-secondary py-3" onClick={() => setShowSubmitModal(false)}>Return to Exam</button>
                        <button className="flex-1 btn btn-primary py-3" onClick={confirmSubmit}>Final Submit</button>
                    </div>
                </div>
            </div>
        )}

        <WarningSystem />

        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-border/50 flex items-center justify-between px-6 lg:px-10 z-[50] shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Shield size={22} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-base font-bold text-text-primary tracking-tight truncate max-w-[200px] sm:max-w-[300px] leading-tight mb-0.5">{state.examData?.title}</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-none">Secured Environment</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Progress indicator */}
                <div className="hidden lg:flex items-center gap-4 px-5 py-2 bg-white rounded-[2rem] border border-border/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                    <span className="text-[11px] text-text-secondary font-bold tracking-tighter">{progress}% COMPLETE</span>
                    <div className="w-32 h-1.5 bg-panel rounded-full overflow-hidden border border-border/20">
                        <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-2.5 px-5 py-2 rounded-[2rem] border-2 font-bold tracking-tight transition-all duration-300 ${timeIsLow ? 'bg-red-50 border-red-200 text-status-danger shadow-sm scale-105' : 'bg-white border-border/60 text-text-primary'}`}>
                    <Clock size={18} className={timeIsLow ? 'animate-pulse' : 'text-text-tertiary'} />
                    <span className="font-mono text-lg leading-none">{formatTime(timeLeft)}</span>
                </div>

                {/* Submit button */}
                <button className="btn btn-primary h-11 px-6 rounded-[2rem] shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all text-sm font-bold flex items-center gap-2" onClick={() => setShowSubmitModal(true)}>
                    <span>Finish Session</span>
                    <Send size={14} className="opacity-70" />
                </button>
            </div>
        </header>

        {/* ═══ Body: Main + Sidebar ═══ */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* ── Question Area ── */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                <div className="bg-white rounded-[2.5rem] h-full min-h-[500px] flex flex-col p-10 shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-border/40 exam-fade-in transition-all duration-500">
                    {/* Question Header */}
                    <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Question {currentQuestion + 1} <span className="text-text-tertiary font-medium">/ {questions.length}</span>
                            </h2>
                            {answers[currentQuestion] && (
                                <span className="flex items-center gap-1.5 text-xs text-status-success font-bold bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                                    <CheckCircle2 size={14} /> Recorded
                                </span>
                            )}
                        </div>
                        <h3 className="heading-2 leading-relaxed max-w-4xl text-text-primary">
                            {questions[currentQuestion]?.text}
                        </h3>
                    </div>

                    {/* Answer Area */}
                    <div className="flex-1 overflow-y-auto mb-10 pr-4 custom-scrollbar">
                        {questions[currentQuestion]?.type === 'coding' ? (
                            <div className="h-full min-h-[400px] rounded-3xl overflow-hidden border border-border/60">
                                <CodeEditor 
                                    question={questions[currentQuestion]} 
                                    onCodeChange={(code) => handleOptionSelect(code)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 max-w-4xl">
                                {questions[currentQuestion]?.options?.map((option, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`magnetic-option flex items-center gap-5 p-6 rounded-2xl transition-all duration-300 cursor-pointer border-2 ${
                                            answers[currentQuestion] === option 
                                            ? 'bg-primary shadow-[0_10px_25px_rgba(37,99,235,0.1)] border-primary transform scale-[1.01]' 
                                            : 'bg-white border-border/80 hover:bg-surface hover:border-text-tertiary shadow-sm'
                                        }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                                            answers[currentQuestion] === option 
                                            ? 'border-white/40 bg-white/20' 
                                            : 'border-border bg-background'
                                        }`}>
                                            <span className={`text-xs font-bold ${answers[currentQuestion] === option ? 'text-white' : 'text-text-tertiary'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                        </div>
                                        <span className={`text-lg transition-colors duration-300 ${
                                            answers[currentQuestion] === option ? 'text-white font-bold' : 'text-text-secondary font-medium'
                                        }`}>{option}</span>
                                        {answers[currentQuestion] === option && (
                                            <Zap size={14} className="ml-auto text-white/60 animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-auto">
                        <button className="btn btn-secondary h-12 px-6 rounded-2xl flex items-center gap-2 hover:bg-white hover:border-text-tertiary transition-all disabled:opacity-30 disabled:pointer-events-none" onClick={handlePrev} disabled={currentQuestion === 0}>
                            <ChevronLeft size={20} /> <span className="font-bold text-sm">Previous</span>
                        </button>
                        
                        {/* Pagination Dots */}
                        <div className="hidden sm:flex items-center gap-2 px-6 py-2 bg-surface rounded-[2rem] border border-border/40">
                            {questions.map((_, idx) => {
                                if (questions.length > 10 && Math.abs(idx - currentQuestion) > 2 && idx !== 0 && idx !== questions.length - 1) {
                                    if (idx === 1 || idx === questions.length - 2) return <span key={idx} className="text-text-tertiary text-[8px] leading-none">••</span>;
                                    return null;
                                }
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-500 ease-spring ${
                                            idx === currentQuestion ? 'bg-primary w-8' : answers[idx] ? 'bg-status-success scale-75' : 'bg-border/60 hover:bg-text-tertiary scale-75'
                                        }`} 
                                    />
                                );
                            })}
                        </div>
                        
                        <button 
                            className={`btn h-12 px-10 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95 ${currentQuestion === questions.length - 1 ? 'btn-primary shadow-primary/20' : 'btn-secondary bg-white border-border hover:border-text-tertiary'}`} 
                            onClick={currentQuestion === questions.length - 1 ? () => setShowSubmitModal(true) : handleNext}
                        >
                            <span className="font-bold text-sm">{currentQuestion === questions.length - 1 ? 'Complete Session' : 'Next Question'}</span> <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </main>

            {/* ── Sidebar ── */}
            <aside className="w-[80px] lg:w-[320px] bg-white border-l border-border/50 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 relative">
                
                {/* Camera Feed */}
                <div className="hidden lg:block login-stagger">
                    <div className="aspect-video bg-black rounded-3xl border border-black relative overflow-hidden shadow-2xl group">
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                        <video ref={screenRef} autoPlay muted style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/20">
                            <div className="w-2 h-2 rounded-full bg-status-danger animate-[pulse_1s_infinite] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Live Proctor</span>
                        </div>
                    </div>
                </div>

                {/* Monitoring Status */}
                <div className="hidden lg:block card p-3.5 shadow-sm bg-surface border-border">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">System Monitoring</p>
                    <div className="space-y-2.5">
                        <StatusLine icon={<Video size={14}/>} label="Webcam" active={modelsLoaded} />
                        <StatusLine icon={<MonitorIcon size={14}/>} label="Screen" active={state.streams.screen !== null} />
                        <StatusLine icon={<Eye size={14}/>} label="Focus Sync" active={true} />
                    </div>
                </div>
                
                {/* Responsive Monitoring Icons (Mobile) */}
                <div className="lg:hidden flex flex-col items-center gap-4 mt-2 mb-4">
                    <div className={`p-2 rounded-full border ${modelsLoaded ? 'bg-green-50 text-status-success border-green-200' : 'bg-red-50 text-status-danger border-red-200'}`}><Video size={16}/></div>
                    <div className={`p-2 rounded-full border ${state.streams.screen ? 'bg-green-50 text-status-success border-green-200' : 'bg-red-50 text-status-danger border-red-200'}`}><MonitorIcon size={16}/></div>
                </div>

                {/* Warnings */}
                {state.warnings > 0 && (
                    <div className="card p-3 border-status-danger/40 bg-red-50 ring-2 ring-status-danger/10 mb-2">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle size={14} className="text-status-danger shrink-0" />
                                <span className="hidden lg:inline text-xs font-bold text-status-danger uppercase tracking-wider">Alerts</span>
                            </div>
                            <span className="text-lg text-center lg:text-left font-bold text-status-danger leading-none">{state.warnings}<span className="text-xs text-status-danger/50 font-medium">/{state.maxWarnings}</span></span>
                        </div>
                    </div>
                )}

                {/* Question Navigator */}
                <div className="flex-1 flex flex-col min-h-0">
                    <p className="hidden lg:block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">Index</p>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 bg-surface lg:bg-transparent rounded-xl p-2 lg:p-0 border border-border lg:border-none shadow-inner lg:shadow-none">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                            {questions.map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`w-full aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all border shadow-sm ${
                                        i === currentQuestion 
                                        ? 'bg-primary border-primary text-white ring-2 ring-primary/20' 
                                        : answers[i]
                                        ? 'bg-green-50 text-status-success border-green-200 hover:bg-green-100 hover:border-status-success'
                                        : 'bg-white text-text-secondary border-border hover:border-text-tertiary hover:bg-surface'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="hidden lg:flex items-center justify-between mt-4 p-3 bg-surface border border-border rounded-lg shadow-sm">
                        <span className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider"><div className="w-2.5 h-2.5 bg-status-success border border-status-success rounded" /> Done</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider"><div className="w-2.5 h-2.5 bg-white border border-border rounded" /> Empty</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>
  );
};

/* Status indicator */
const StatusLine = ({ icon, label, active }) => (
    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-border/80 shadow-sm transition-all hover:border-primary/30 group">
        <div className="flex items-center gap-3 text-xs font-semibold">
            <span className={`transition-colors duration-300 ${active ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`}>{icon}</span>
            <span className="text-text-primary tracking-tight">{label}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest border transition-all duration-300 ${active ? 'bg-green-50 text-status-success border-green-200 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-red-50 text-status-danger border-red-200'}`}>
            {active ? 'ACTIVE' : 'IDLE'}
        </div>
    </div>
);

export default Exam;
