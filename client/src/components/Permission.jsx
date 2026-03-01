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
      setError('Camera/microphone access denied. Please allow permissions in your browser settings.');
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
        setError('Full screen is required to continue. Please click the button again.');
        return;
      }
      navigate('/exam');
    } else {
      setError('Please grant all required permissions before continuing.');
    }
  };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
            <div className="max-w-3xl w-full">
                <div className="card overflow-hidden shadow-xl shadow-black/5 border-border/80">
                    {/* Header */}
                    <div className="bg-surface p-6 md:p-8 border-b border-border">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm text-primary shrink-0">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Step 2 of 3</p>
                                <h1 className="heading-2">System Permissions</h1>
                            </div>
                        </div>
                        <p className="text-body max-w-xl">
                            Allow camera, microphone, and screen sharing to initiate the exam container. When prompted for screen share, you must select <span className="text-text-primary font-bold">Entire Screen</span>.
                        </p>
                    </div>

                    {/* Permissions & Preview */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8">
                        <div className="flex flex-col gap-4">
                            <PermissionItem 
                                icon={<Camera size={20} />} 
                                label="Camera Access" 
                                status={permissions.webcam} 
                                onAction={requestWebcam} 
                            />
                            <PermissionItem 
                                icon={<Mic size={20} />} 
                                label="Microphone Access" 
                                status={permissions.mic} 
                                onAction={requestWebcam}
                                waiting={!permissions.webcam}
                            />
                            <PermissionItem 
                                icon={<Monitor size={20} />} 
                                label="Screen Capture" 
                                status={permissions.screen} 
                                onAction={requestScreen} 
                            />
                            
                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-status-danger text-sm font-medium mt-2">
                                    <XCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Camera Preview */}
                        <div className="flex flex-col gap-3">
                            <div className="aspect-[4/3] bg-panel rounded-xl border border-border shadow-inner overflow-hidden relative flex items-center justify-center w-full">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                {!permissions.webcam && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel border border-border">
                                        <div className="p-3 bg-white rounded-full border border-border shadow-sm">
                                            <Video size={24} className="text-text-tertiary" />
                                        </div>
                                        <span className="text-xs font-semibold text-text-secondary">Camera Inactive</span>
                                    </div>
                                )}
                                {permissions.webcam && (
                                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-status-success/90 backdrop-blur-md text-white rounded-md border border-white/20 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Live</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center font-medium text-text-tertiary uppercase tracking-wider">Feed Preview</p>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-border bg-surface">
                        <button 
                            className="btn btn-primary w-full py-4 text-base group disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md" 
                            disabled={!permissions.webcam || !permissions.mic || !permissions.screen}
                            onClick={handleProceed}
                        >
                            Initialize Environment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PermissionItem = ({ icon, label, status, onAction, waiting }) => (
    <div className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${status ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-border hover:border-text-tertiary'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${status ? 'bg-white text-status-success border-green-200' : 'bg-panel text-text-secondary border-border'}`}>
                {icon}
            </div>
            <span className={`text-sm font-semibold ${status ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>
        </div>
        
        <div className="flex sm:justify-end">
            {status ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 rounded-md text-status-success shadow-sm">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Granted</span>
                </div>
            ) : waiting ? (
                <span className="text-sm font-medium text-text-tertiary px-2 py-1.5">Waiting...</span>
            ) : (
                <button 
                    onClick={onAction}
                    className="btn btn-secondary py-1.5 px-4 text-sm w-full sm:w-auto"
                >
                    Allow
                </button>
            )}
        </div>
    </div>
);

export default Permission;
