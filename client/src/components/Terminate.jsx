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
                  title: "Session Terminated",
                  desc: "Your exam was forcefully ended by the proctor.",
                  icon: <ShieldOff size={40} />,
                  bg: "bg-red-50",
                  text: "text-status-danger",
                  border: "border-red-200",
                  detail: "Your session was flagged by the administrative proctor. All relevant monitoring evidence has been recorded and attached to your profile."
              };
          case 'max_warnings':
              return {
                  title: "Auto-Submitted",
                  desc: "Integrity constraints violated.",
                  icon: <AlertOctagon size={40} />,
                  bg: "bg-red-50",
                  text: "text-status-danger",
                  border: "border-red-200",
                  detail: `You reached the absolute warning limit (${state.warnings}/${state.maxWarnings}). Your exam has been automatically submitted to preserve integrity.`
              };
          case 'timeout':
              return {
                  title: "Time Expired",
                  desc: "The allocated exam duration has ended.",
                  icon: <Clock size={40} />,
                  bg: "bg-amber-50",
                  text: "text-status-warning",
                  border: "border-amber-200",
                  detail: "Your answers have been auto-submitted as the time limit was reached. No further modifications are permitted."
              };
          case 'manual':
          default:
              return {
                  title: "Successfully Submitted",
                  desc: "Your responses have been saved.",
                  icon: <CheckCircle2 size={40} />,
                  bg: "bg-green-50",
                  text: "text-status-success",
                  border: "border-green-200",
                  detail: "Your responses and monitoring telemetry have been securely transmitted. Your instructor will review the results."
              };
      }
  };

  const content = getStatusContent();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
            <div className="max-w-md w-full">
                <div className="card p-8 md:p-10 text-center shadow-xl shadow-black/5 border-border/80">
                    {/* Status Icon */}
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 shadow-sm ${content.bg} ${content.text} ${content.border}`}>
                        {content.icon}
                    </div>

                    {/* Title */}
                    <h1 className="heading-2 mb-2">
                        {content.title}
                    </h1>
                    <p className="text-body mb-8 font-medium">
                        {content.desc}
                    </p>
                    
                    {/* Explanation */}
                    <div className="bg-surface border border-border rounded-xl p-5 mb-8 text-left shadow-sm">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {content.detail}
                        </p>
                    </div>

                    {/* Back Button */}
                    <button 
                        className="btn btn-secondary w-full py-3.5 group flex items-center justify-center gap-2" 
                        onClick={() => navigate('/student/dashboard')}
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Terminate;
