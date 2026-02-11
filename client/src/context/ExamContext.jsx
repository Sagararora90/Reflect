import React, { createContext, useContext, useReducer } from 'react';

const ExamContext = createContext();

const loadState = () => {
    try {
        const serialized = localStorage.getItem('examState');
        if (serialized) {
            return JSON.parse(serialized);
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
    return null;
};

const savedState = loadState();

const initialState = savedState ? { ...savedState, streams: { webcam: null, screen: null } } : {
  isExamActive: false,
  examStatus: 'idle', // 'idle', 'active', 'terminated', 'submitted'
  isFullScreen: false,
  warnings: 0,
  maxWarnings: 100,
  violations: [],
  logs: [], // Periodic logs
  streams: { webcam: null, screen: null }, // Store MediaStream objects
  studentName: "Candidate",
  examId: null,
  examData: null, // Store full exam object (questions, config)
  proctorMessage: null,
};

const examReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'START_EXAM':
      // Only reset if starting fresh (not resuming)
      if (state.examStatus === 'active') return state; 
      
      newState = { 
          ...state, 
          isExamActive: true, 
          examStatus: 'active',
          warnings: 0,
          violations: [],
          logs: []
      };
      break;
    case 'RESUME_EXAM':
      if (state.examStatus === 'active') return state;
      newState = {
          ...state,
          isExamActive: true,
          examStatus: 'active'
          // Do NOT reset warnings or logs
      };
      break;
    case 'END_EXAM':
      newState = { ...state, isExamActive: false, examStatus: 'terminated' };
      break;
    case 'SUBMIT_EXAM':
      // payload might be 'manual', 'timeout', 'max_warnings', 'proctor'
      newState = { 
          ...state, 
          isExamActive: false, 
          examStatus: 'submitted',
          submissionReason: action.payload || 'manual' 
      };
      break;
    case 'SET_STREAMS':
      return { ...state, streams: { ...state.streams, ...action.payload } }; // Don't save streams to localstorage
    case 'SET_FULLSCREEN':
      newState = { ...state, isFullScreen: action.payload };
      break;
    case 'SET_EXAM_ID':
      if (state.examId === action.payload) return state;
      newState = { 
          ...state, 
          examId: action.payload,
          warnings: 0,
          violations: [],
          logs: [],
          examStatus: 'idle',
          isExamActive: false
      };
      break;
    case 'SET_EXAM_DATA':
      newState = { ...state, examData: action.payload };
      break;
    case 'ADD_WARNING':
      newState = { 
        ...state, 
        warnings: state.warnings + 1,
        violations: [...state.violations, action.payload]
      };
      break;
    case 'ADD_LOG':
      newState = {
        ...state,
        logs: [...state.logs, action.payload]
      };
      break;
    case 'SET_PROCTOR_MESSAGE':
      newState = { ...state, proctorMessage: action.payload };
      break;
    case 'RESET':
      localStorage.removeItem('examState');
      return { ...initialState, streams: state.streams }; // Keep streams if resetting for new attempt? Or full reset? 
      // If full reset, we lose streams.
      // But RESET is rarely used now. 
      break;
    default:
      return state;
  }
  
  // Persist to LocalStorage (exclude streams and heavy evidence)
  if (newState && action.type !== 'SET_STREAMS') {
      const { streams, ...persistable } = newState;
      
      // Deep copy violations for localStorage — strip evidence to save space
      // Keep original newState violations intact with evidence for in-memory use
      const sanitized = { ...persistable };
      if (sanitized.violations) {
          sanitized.violations = sanitized.violations.map(v => ({
              reason: v.reason,
              type: v.type,
              time: v.time,
              timestamp: v.timestamp,
              evidence: null // Don't save base64 to localStorage
          }));
      }
      sanitized.logs = []; // Don't save logs to localStorage

      try {
        localStorage.setItem('examState', JSON.stringify(sanitized));
      } catch (e) {
        console.error("Storage Quota Exceeded", e);
      }
      return newState;
  }
  return state;
};

export const ExamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(examReducer, initialState);

  return (
    <ExamContext.Provider value={{ state, dispatch }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
