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
          dispatch({ type: 'SET_EXAM_ID', payload: data._id });
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
        <div className="min-h-screen bg-rf-canvas flex flex-col items-center justify-center p-6 rf-animate-bloom">
            <div className="w-10 h-10 border-3 border-rf-accent/30 border-t-rf-accent rounded-full animate-spin mb-4" />
            <p className="text-rf-text-dim text-sm">Loading exam...</p>
        </div>
    );
  }

  if (error) {
    const isSubmitted = error === 'Exam already submitted';
    return (
        <div className="min-h-screen bg-rf-canvas flex items-center justify-center px-4 py-20 rf-animate-bloom">
            <div className="max-w-md w-full">
                <div className={`rf-card-glass p-8 text-center ${isSubmitted ? 'border-rf-success/30' : 'border-rf-danger/30'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 ${isSubmitted ? 'bg-rf-success/10 text-rf-success border border-rf-success/20' : 'bg-rf-danger/10 text-rf-danger border border-rf-danger/20'}`}>
                        {isSubmitted ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                    </div>
                    <h1 className="text-xl font-bold text-rf-text-pure mb-2">{isSubmitted ? 'Already Submitted' : 'Cannot Access Exam'}</h1>
                    <p className="text-sm text-rf-text-dim mb-6 leading-relaxed">
                        {isSubmitted 
                            ? 'You have already submitted this exam. Only one attempt is allowed.' 
                            : error}
                    </p>
                    <button className="rf-btn rf-btn-secondary w-full py-3 text-sm font-semibold" onClick={() => navigate('/student/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-rf-canvas flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 rf-animate-bloom">
      <div className="max-w-lg w-full">
        <div className="rf-card-glass overflow-hidden">
            {/* Exam Info Header */}
            <div className="bg-rf-panel/20 p-6 border-b border-rf-border-glass">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 rf-glass rounded-xl flex items-center justify-center border-rf-border-glass text-rf-accent shrink-0">
                        <Shield size={22} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-rf-text-muted uppercase tracking-wider mb-0.5">Exam Details</p>
                        <h1 className="text-xl font-bold text-rf-text-pure leading-tight">{examData.title}</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rf-glass rounded-lg text-xs font-semibold text-rf-text-pure border-rf-border-glass">
                        <Clock size={14} className="text-rf-accent" />
                        {examData.duration} minutes
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rf-glass rounded-lg text-xs font-semibold text-rf-text-pure border-rf-border-glass">
                        <BookOpen size={14} className="text-rf-accent" />
                        {examData.questions?.length} questions
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rf-text-muted">Before you begin</h3>
                
                <div className="space-y-3">
                    <InstructionItem 
                        icon={<Monitor size={18} />} 
                        title="Camera & Screen Required" 
                        desc="You'll need to share your camera and screen for proctoring."
                    />
                    <InstructionItem 
                        icon={<AlertTriangle size={18} />} 
                        title="Stay in Full Screen" 
                        desc="Switching tabs or leaving full screen will trigger a warning."
                        warning
                    />
                    <InstructionItem 
                        icon={<AlertTriangle size={18} />} 
                        title={`Max ${state.maxWarnings} Warnings`}
                        desc="Exceeding the warning limit will auto-submit your exam."
                        warning
                    />
                </div>

                <button className="rf-btn rf-btn-primary w-full py-3 !rounded-xl text-sm font-bold group" onClick={handleStart}>
                    Continue to Setup <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform ml-1" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};


const InstructionItem = ({ icon, title, desc, warning }) => (
    <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${warning ? 'bg-rf-warning/10 text-rf-warning border border-rf-warning/20' : 'bg-rf-accent/10 text-rf-accent border border-rf-accent/20'}`}>
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-rf-text-pure mb-0.5">{title}</h4>
            <p className="text-xs text-rf-text-dim leading-relaxed">{desc}</p>
        </div>
    </div>
);


export default Landing;
