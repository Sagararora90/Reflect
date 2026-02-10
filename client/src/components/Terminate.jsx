import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { AlertOctagon, CheckCircle2, ShieldOff, ArrowLeft } from 'lucide-react';


const Terminate = () => {
  const { state } = useExam();
  const navigate = useNavigate();
  const isSubmission = state.examStatus === 'submitted';

    return (
        <div className="min-h-screen bg-rf-canvas flex items-center justify-center px-4 py-20 rf-animate-bloom">
            <div className="max-w-md w-full">
                <div className="rf-card-glass p-8 text-center">
                    {/* Status Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isSubmission ? 'bg-rf-success/10 text-rf-success border border-rf-success/20' : 'bg-rf-danger/10 text-rf-danger border border-rf-danger/20'}`}>
                        {isSubmission ? <CheckCircle2 size={32} /> : <ShieldOff size={32} />}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-rf-text-pure mb-1">
                        {isSubmission ? "Exam Submitted" : "Exam Ended"}
                    </h1>
                    <p className="text-sm text-rf-text-muted mb-6">
                        {isSubmission ? "Your answers have been saved successfully" : "Too many warnings — your exam was auto-submitted"}
                    </p>
                    
                    {/* Warning Details */}
                    {!isSubmission && (
                         <div className="bg-rf-danger/5 border border-rf-danger/20 rounded-xl p-5 mb-6 flex flex-col items-center gap-3">
                             <AlertOctagon size={24} className="text-rf-danger" />
                             <p className="text-sm text-rf-text-dim leading-relaxed">
                                 You reached the maximum warning limit ({state.warnings}/{state.maxWarnings}). Your exam has been automatically submitted for review.
                             </p>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className="bg-rf-panel/30 border border-rf-border-glass rounded-xl p-5 mb-6 text-left">
                        <p className="text-sm text-rf-text-dim leading-relaxed">
                            {isSubmission 
                                ? "Your responses and monitoring data have been submitted. Your teacher will review the results." 
                                : "Your session was flagged for multiple violations. All monitoring data including camera and screen recordings have been saved for review."
                            }
                        </p>
                    </div>

                    {/* Back Button */}
                    <button 
                        className="rf-btn rf-btn-primary w-full py-3 !rounded-xl text-sm font-bold group flex items-center justify-center gap-2" 
                        onClick={() => navigate('/student/dashboard')}
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Terminate;
