import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Monitor, Mic, CheckCircle2, XCircle, Shield, ArrowRight, Video } from 'lucide-react';
import { useExam } from '../context/ExamContext';


const Permission = () => {
  const navigate = useNavigate();
  const { dispatch } = useExam();
  
  const [permissions, setPermissions] = useState({
    webcam: false,
    mic: false,
    screen: false
  });
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);

  const requestWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      dispatch({ type: 'SET_STREAMS', payload: { webcam: stream } });
      setPermissions(prev => ({ ...prev, webcam: true, mic: true }));
      setError('');
    } catch (err) {
      setError('Camera/microphone access denied. Please allow permissions in your browser.');
      console.error(err);
    }
  };

  const requestScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "monitor" } });
      setPermissions(prev => ({ ...prev, screen: true }));
      dispatch({ type: 'SET_STREAMS', payload: { screen: stream } });
    } catch (err) {
      setError('Screen sharing is required. Please select "Entire Screen".');
      setPermissions(prev => ({ ...prev, screen: false }));
    }
  };

  const handleProceed = async () => {
    if (permissions.webcam && permissions.mic && permissions.screen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        setError('Full screen is required to continue.');
        return;
      }
      navigate('/exam');
    } else {
      setError('Please grant all permissions before continuing.');
    }
  };

    return (
        <div className="min-h-screen bg-rf-canvas flex items-center justify-center px-4 py-20 rf-animate-bloom">
            <div className="max-w-2xl w-full">
                <div className="rf-card-glass overflow-hidden">
                    {/* Header */}
                    <div className="bg-rf-panel/20 p-6 md:p-8 border-b border-rf-border-glass">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-11 h-11 rf-glass rounded-xl flex items-center justify-center border-rf-border-glass text-rf-accent shrink-0">
                                <Shield size={22} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-rf-text-muted uppercase tracking-wider mb-0.5">Step 2 of 3</p>
                                <h1 className="text-xl font-bold text-rf-text-pure">Grant Permissions</h1>
                            </div>
                        </div>
                        <p className="text-sm text-rf-text-dim leading-relaxed">
                            Allow camera, microphone, and screen sharing to start the exam. When sharing your screen, select <span className="text-rf-text-pure font-semibold">Entire Screen</span>.
                        </p>
                    </div>

                    {/* Permissions & Preview */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                        <div className="flex flex-col gap-3">
                            <PermissionItem 
                                icon={<Camera size={18} />} 
                                label="Camera" 
                                status={permissions.webcam} 
                                onAction={requestWebcam} 
                            />
                            <PermissionItem 
                                icon={<Mic size={18} />} 
                                label="Microphone" 
                                status={permissions.mic} 
                                onAction={requestWebcam}
                                waiting={!permissions.webcam}
                            />
                            <PermissionItem 
                                icon={<Monitor size={18} />} 
                                label="Screen Share" 
                                status={permissions.screen} 
                                onAction={requestScreen} 
                            />
                            
                            {error && (
                                <div className="flex items-center gap-3 bg-rf-danger/5 border border-rf-danger/10 rounded-lg p-3 text-rf-danger text-sm font-medium mt-1">
                                    <XCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Camera Preview */}
                        <div className="space-y-2">
                            <div className="aspect-[3/4] bg-rf-canvas rounded-xl border border-rf-border-glass overflow-hidden relative flex items-center justify-center">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                {!permissions.webcam && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rf-canvas/80 backdrop-blur-sm">
                                        <Video size={20} className="text-rf-text-muted opacity-40" />
                                        <span className="text-[10px] font-semibold text-rf-text-muted">Camera Off</span>
                                    </div>
                                )}
                                {permissions.webcam && (
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-rf-success/90 text-white rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        <span className="text-[9px] font-bold">LIVE</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-center text-rf-text-muted">Camera Preview</p>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <button 
                            className="rf-btn rf-btn-primary w-full py-3.5 !rounded-xl text-sm font-bold group disabled:opacity-30 transition-all" 
                            disabled={!permissions.webcam || !permissions.mic || !permissions.screen}
                            onClick={handleProceed}
                        >
                            Start Exam <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PermissionItem = ({ icon, label, status, onAction, waiting }) => (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${status ? 'bg-rf-success/5 border-rf-success/20' : 'bg-rf-surface border-rf-border-glass hover:border-rf-accent/30'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${status ? 'bg-rf-success/10 border-rf-success/20 text-rf-success' : 'rf-glass text-rf-accent border-rf-border-glass'}`}>
                {icon}
            </div>
            <span className={`text-sm font-semibold ${status ? 'text-rf-success' : 'text-rf-text-dim'}`}>{label}</span>
        </div>
        
        <div>
            {status ? (
                <div className="flex items-center gap-2 text-rf-success">
                    <span className="text-xs font-bold">Granted</span>
                    <CheckCircle2 size={16} />
                </div>
            ) : waiting ? (
                <span className="text-xs text-rf-text-muted">Waiting...</span>
            ) : (
                <button 
                    onClick={onAction}
                    className="rf-btn rf-btn-secondary !px-4 !py-1.5 !rounded-lg text-xs font-semibold"
                >
                    Allow
                </button>
            )}
        </div>
    </div>
);


export default Permission;
