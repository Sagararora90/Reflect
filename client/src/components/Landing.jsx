import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, BookOpen, Monitor, CheckCircle, Clock, ArrowRight, Shield } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const Landing = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useAuth();
  const { state, dispatch } = useExam();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
      const targetId = examId || state.examId;
      
      if (!targetId) {
          setError('No Exam ID specified.');
          setLoading(false);
          return;
      }

      if (user && (user.role === 'admin' || user.role === 'teacher')) {
          navigate(`/admin/monitor/${targetId}`);
          return;
      }

      fetch(`${API_URL}/api/exam/${targetId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
      })
      .then(res => {
          if (res.status === 403) {
             return res.json().then(d => { throw new Error(d.msg + (d.startTime ? ` (Starts: ${new Date(d.startTime).toLocaleString()})` : '')) });
          }
          if (!res.ok) throw new Error('Exam not found');
          return res.json();
      })
      .then(data => {
          setExamData(data);
          dispatch({ type: 'SET_EXAM_ID', payload: { id: data._id, userId: user?.id || user?._id } });
          dispatch({ type: 'SET_EXAM_DATA', payload: data });
          setLoading(false);
      })
      .catch(err => {
          setError(err.message);
          setLoading(false);
      });
  }, [examId]);

  const handleStart = () => {
    navigate('/permission');
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-text-secondary font-medium">Loading session...</p>
        </div>
    );
  }

  if (error) {
    const isSubmitted = error.includes('already submitted');
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full">
                <div className={`card p-8 md:p-10 text-center ${isSubmitted ? 'border-status-success/50 ring-2 ring-status-success/20' : 'border-status-danger/50 ring-2 ring-status-danger/20'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isSubmitted ? 'bg-green-50 text-status-success border border-green-200' : 'bg-red-50 text-status-danger border border-red-200'}`}>
                        {isSubmitted ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <h2 className="heading-2 mb-2">{isSubmitted ? 'Already Submitted' : 'Access Denied'}</h2>
                    <p className="text-body mb-8">
                        {isSubmitted 
                            ? 'You have already submitted this exam. Only one attempt is allowed.' 
                            : error}
                    </p>
                    <button className="btn btn-secondary w-full py-3" onClick={() => navigate('/student/dashboard')}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-24 pb-12 px-6 sm:px-8">
      <div className="max-w-lg w-full">
        <div className="card overflow-hidden shadow-xl shadow-black/5 border-border/60">
            {/* Exam Info Header */}
            <div className="bg-surface p-6 md:p-8 border-b border-border">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm text-primary shrink-0">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Session Details</p>
                        <h1 className="heading-2 leading-tight">{examData.title}</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-sm font-semibold text-text-secondary border border-border">
                        <Clock size={16} className="text-primary" />
                        {examData.duration} minutes
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-sm font-semibold text-text-secondary border border-border">
                        <BookOpen size={16} className="text-primary" />
                        {examData.questions?.length} items
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Before you begin</h3>
                
                <div className="space-y-4">
                    <InstructionItem 
                        icon={<Monitor size={20} />} 
                        title="Camera & Screen Capture" 
                        desc="You'll be prompted to share your camera and screen for automated proctoring."
                    />
                    <InstructionItem 
                        icon={<AlertTriangle size={20} />} 
                        title="Strict Fullscreen Lock" 
                        desc="Navigating away from the active window will trigger a security warning."
                        warning
                    />
                    <InstructionItem 
                        icon={<AlertTriangle size={20} />} 
                        title={`Maximum ${state.maxWarnings} Warnings`}
                        desc="Exceeding the warning threshold will result in immediate termination."
                        warning
                    />
                </div>

                <div className="pt-4">
                    <button className="btn btn-primary w-full py-3.5 group" onClick={handleStart}>
                        Proceed to Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const InstructionItem = ({ icon, title, desc, warning }) => (
    <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${warning ? 'bg-red-50 text-status-danger border-red-200' : 'bg-primary/5 text-primary border-primary/20'}`}>
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">{title}</h4>
            <p className="text-sm text-text-secondary leading-snug">{desc}</p>
        </div>
    </div>
);

export default Landing;
