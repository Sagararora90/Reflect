import React from 'react';
import { useExam } from '../context/ExamContext';
import { AlertTriangle, Lock, Maximize2, Shield } from 'lucide-react';

const WarningSystem = () => {
  const { state, dispatch } = useExam();
  
  if (!state.isExamActive) return null;

  return (
    <>
        {/* Fullscreen lost — blocking overlay */}
        {!state.isFullScreen && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-status-danger/5 animate-pulse pointer-events-none" />
                <div className="card max-w-md w-full text-center p-8 md:p-10 border-status-danger/40 ring-4 ring-status-danger/20 shadow-2xl">
                    <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} className="text-status-danger" />
                    </div>
                    <h2 className="heading-2 mb-3">Fullscreen Enforced</h2>
                    <p className="text-body mb-8">
                        Active participation requires <span className="text-text-primary font-bold">fullscreen mode</span>. Exiting fullscreen compromises exam integrity. 
                    </p>
                    <button 
                        className="btn btn-primary bg-status-danger hover:bg-status-danger/90 border-transparent shadow-lg shadow-status-danger/20 w-full py-3.5 flex items-center justify-center gap-2"
                        onClick={() => {
                            const el = document.documentElement;
                            const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                            if (request) {
                                request.call(el).catch(err => {
                                    console.error("Fullscreen request failed:", err);
                                });
                            }
                        }}
                    >
                        <Maximize2 size={18} /> Restore Fullscreen
                    </button>
                </div>
            </div>
        )}

        {/* Proctor Message Modal */}
        {state.proctorMessage && (
            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                <div className="card max-w-sm w-full text-center p-8 md:p-10 border-primary shadow-2xl ring-4 ring-primary/10">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <Shield size={32} />
                    </div>
                    <h2 className="heading-2 mb-3">Proctor Communication</h2>
                    <p className="text-body mb-8 whitespace-pre-wrap text-left bg-surface p-4 rounded-lg border border-border">
                        {state.proctorMessage}
                    </p>
                    <button 
                        className="btn btn-primary w-full py-3.5 shadow-md"
                        onClick={() => dispatch({ type: 'SET_PROCTOR_MESSAGE', payload: null })}
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        )}

        {/* Floating Warning Badge */}
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[4000] pointer-events-none transition-all duration-300">
            {state.warnings > 0 && (
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border shadow-xl animate-in slide-in-from-top-4 ${state.warnings >= 3 ? 'bg-red-50 border-red-200 text-status-danger' : 'bg-amber-50 border-amber-200 text-status-warning'}`}>
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Violations: {state.warnings} / {state.maxWarnings}</span>
                </div>
            )}
        </div>
    </>
  );
};

export default WarningSystem;
