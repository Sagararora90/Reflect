import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { AlertOctagon, CheckCircle2, ShieldOff, ArrowLeft, Clock } from 'lucide-react';


const Terminate = () => {
  const { state } = useExam();
  const navigate = useNavigate();
  const reason = state.submissionReason || (state.examStatus === 'submitted' ? 'manual' : null);

  const getStatusContent = () => {
      switch(reason) {
          case 'proctor_terminated':
              return {
                  title: "Exam Terminated",
                  desc: "Your exam was ended by the proctor.",
                  icon: <ShieldOff size={32} />,
                  bg: "bg-rf-danger/10",
                  text: "text-rf-danger",
                  border: "border-rf-danger/20",
                  detail: "Your session was flagged by the proctor. All evidence has been recorded."
              };
          case 'max_warnings':
              return {
                  title: "Auto-Submitted",
                  desc: "Too many warnings.",
                  icon: <AlertOctagon size={32} />,
                  bg: "bg-rf-danger/10",
                  text: "text-rf-danger",
                  border: "border-rf-danger/20",
                  detail: `You reached the warning limit (${state.warnings}/${state.maxWarnings}). Your exam has been automatically submitted.`
              };
          case 'timeout':
              return {
                  title: "Time Up!",
                  desc: "Exam time expired.",
                  icon: <Clock size={32} />,
                  bg: "bg-rf-warning/10",
                  text: "text-rf-warning",
                  border: "border-rf-warning/20",
                  detail: "Your answers have been auto-submitted as the time limit was reached."
              };
          case 'manual':
          default:
              return {
                  title: "Exam Submitted",
                  desc: "Answers saved successfully.",
                  icon: <CheckCircle2 size={32} />,
                  bg: "bg-rf-success/10",
                  text: "text-rf-success",
                  border: "border-rf-success/20",
                  detail: "Your responses and monitoring data have been submitted. Your teacher will review the results."
              };
      }
  };

  const content = getStatusContent();

    return (
        <div className="min-h-screen bg-rf-canvas flex items-center justify-center px-4 py-20 rf-animate-bloom">
            <div className="max-w-md w-full">
                <div className="rf-card-glass p-8 text-center">
                    {/* Status Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${content.bg} ${content.text} ${content.border}`}>
                        {content.icon}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-rf-text-pure mb-1">
                        {content.title}
                    </h1>
                    <p className="text-sm text-rf-text-muted mb-6">
                        {content.desc}
                    </p>
                    
                    {/* Explanation */}
                    <div className="bg-rf-panel/30 border border-rf-border-glass rounded-xl p-5 mb-6 text-left">
                        <p className="text-sm text-rf-text-dim leading-relaxed">
                            {content.detail}
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
