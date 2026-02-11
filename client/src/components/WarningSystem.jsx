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
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-rf-canvas/95 backdrop-blur-2xl rf-animate-bloom">
                <div className="absolute inset-0 bg-rf-danger/10 animate-pulse pointer-events-none" />
                <div className="rf-card-glass max-w-md w-full text-center p-8 border-rf-danger/30">
                    <div className="w-16 h-16 bg-rf-danger/10 border border-rf-danger/30 rounded-xl flex items-center justify-center mx-auto mb-5">
                        <Lock size={32} className="text-rf-danger" />
                    </div>
                    <h2 className="text-xl font-bold text-rf-text-pure mb-2">Fullscreen Required</h2>
                    <p className="text-sm text-rf-text-dim mb-6 leading-relaxed">
                        You must stay in <span className="text-rf-text-pure font-bold">fullscreen mode</span> during the exam. Click below to re-enter fullscreen.
                    </p>
                    <button 
                        className="rf-btn rf-btn-primary !bg-rf-danger w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
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
                        <Maximize2 size={16} /> Enter Fullscreen
                    </button>
                </div>
            </div>
        )}

        {/* Proctor Message Modal */}
        {state.proctorMessage && (
            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-rf-canvas/90 backdrop-blur-xl rf-animate-bloom">
                <div className="rf-card-glass max-w-sm w-full text-center p-8 border-rf-accent/30 shadow-2xl">
                    <div className="w-16 h-16 bg-rf-accent/10 border border-rf-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rf-accent">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-rf-text-pure mb-2">Message from Proctor</h2>
                    <p className="text-sm text-rf-text-dim mb-8 leading-relaxed whitespace-pre-wrap">
                        {state.proctorMessage}
                    </p>
                    <button 
                        className="rf-btn rf-btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-rf-accent/20"
                        onClick={() => dispatch({ type: 'SET_PROCTOR_MESSAGE', payload: null })}
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        )}

        {/* Floating Warning Badge */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[4000] pointer-events-none">
            {state.warnings > 0 && (
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-xl shadow-lg rf-animate-bloom ${state.warnings >= 3 ? 'bg-rf-danger/10 border-rf-danger/30 text-rf-danger' : 'bg-rf-warning/10 border-rf-warning/30 text-rf-warning'}`}>
                    <AlertTriangle size={14} />
                    <span className="text-xs font-bold">Warnings: {state.warnings} / {state.maxWarnings}</span>
                </div>
            )}
        </div>
    </>
  );
};

export default WarningSystem;
