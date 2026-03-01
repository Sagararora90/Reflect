import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../socket';
import { 
  Eye, 
  AlertTriangle, 
  XCircle, 
  ChevronLeft, 
  User, 
  Wifi,
  Clock,
  Monitor as MonitorIcon
} from 'lucide-react';


const LiveMonitor = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState({});

    useEffect(() => {
        socket.emit('join-monitor', examId);

        socket.on('monitor-update', (data) => {
            if (!data) return; 
            setStudents(prev => ({
                ...prev,
                [data.studentId]: { 
                    ...(prev[data.studentId] || { alerts: [] }), 
                    ...data, 
                    lastUpdate: Date.now() 
                }
            }));
        });

        socket.on('monitor-alert', (alert) => {
            setStudents(prev => {
                const student = prev[alert.studentId];
                if (!student) return prev;
                return {
                    ...prev,
                    [alert.studentId]: {
                        ...student,
                        violations: alert.violations,
                        alerts: [
                            { type: alert.type, timestamp: alert.timestamp, evidence: alert.evidence },
                            ...(student.alerts || [])
                        ].slice(0, 50)
                    }
                };
            });
        });

        return () => {
            socket.off('monitor-update');
            socket.off('monitor-alert');
        };
    }, [examId]);

    const handleTerminate = (studentId) => {
        if(window.confirm("Are you sure you want to terminate this student's exam?")) {
            socket.emit('admin-action', { studentId, action: 'terminate' });
        }
    };

    const handleWarn = (studentId) => {
        const msg = prompt("Enter a warning message for the student:");
        if(msg) {
            socket.emit('admin-action', { studentId, action: 'warn', payload: msg });
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6 sm:px-8">
            <div className="max-w-6xl mx-auto">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary px-3 py-2" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-2 mb-1">Live Monitor</h1>
                        <p className="text-body mt-0">Watch student activity in real time</p>
                    </div>
                </div>
                
                <div className="card px-4 py-2.5 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                    <span className="text-sm font-semibold text-text-primary">{Object.keys(students).length} students online</span>
                    <div className="w-px h-5 bg-border" />
                    <Wifi size={16} className="text-primary" />
                    <span className="text-sm text-text-secondary">Connected</span>
                </div>
            </header>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.values(students).map(stu => {
                    const isOffline = Date.now() - stu.lastUpdate > 15000;
                    const isHighRisk = stu.violations > 5;
                    
                    return (
                        <div 
                            key={stu.studentId} 
                            className={`card overflow-hidden flex flex-col ${isHighRisk ? 'ring-2 ring-status-danger border-transparent' : ''}`}
                        >
                            {/* Risk Indicator Bar */}
                            <div className={`h-1.5 w-full ${isHighRisk ? 'bg-status-danger' : isOffline ? 'bg-text-tertiary' : 'bg-status-success'}`} />
                            
                            <div className="p-5 flex-1 flex flex-col">
                                {/* Student Info */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-panel border border-border flex items-center justify-center">
                                                <User size={18} className="text-text-secondary" />
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${isOffline ? 'bg-text-tertiary' : 'bg-status-success'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-text-primary truncate">{stu.name}</h4>
                                            <span className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                                                <Clock size={12} /> {new Date(stu.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <span className={`shrink-0 ml-3 ${isHighRisk ? 'badge badge-danger' : 'badge badge-neutral'}`}>
                                        {stu.violations} warnings
                                    </span>
                                </div>

                                {/* Camera & Screen Feeds */}
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden border border-border">
                                        {stu.webcam ? (
                                            <img src={stu.webcam} className="w-full h-full object-cover" alt="Camera" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                                <Eye size={20} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-semibold text-white">Camera</div>
                                    </div>
                                    <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden border border-border">
                                        {stu.screen ? (
                                            <img src={stu.screen} className="w-full h-full object-cover" alt="Screen" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                                <MonitorIcon size={20} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-semibold text-white">Screen</div>
                                    </div>
                                </div>

                                {/* Alert Log */}
                                <div className="bg-background rounded-lg border border-border flex flex-col flex-1 min-h-[140px]">
                                    <div className="flex items-center justify-between p-3 border-b border-border bg-surface rounded-t-lg">
                                        <p className="text-xs font-semibold text-text-secondary">Recent Alerts</p>
                                        {stu.alerts && stu.alerts.length > 0 && (
                                            <span className="badge badge-danger !text-[10px]">{stu.alerts.length} Total</span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {stu.alerts && stu.alerts.length > 0 ? (
                                            stu.alerts.map((alert, idx) => (
                                                <div key={idx} className={`flex items-start justify-between p-2 rounded-md text-xs ${idx === 0 ? 'bg-red-50 text-status-danger font-medium' : 'text-text-secondary'}`}>
                                                    <span className="truncate pr-2">{alert.type}</span>
                                                    <span className="text-[11px] opacity-70 font-mono shrink-0 pt-0.5">
                                                        {new Date(alert.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-text-tertiary">No alerts detected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 divide-x divide-border border-t border-border mt-auto bg-surface">
                                <button 
                                    onClick={() => handleWarn(stu.studentId)} 
                                    className="px-4 py-3 text-sm font-semibold text-text-secondary hover:text-status-warning hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={16} /> Warn
                                </button>
                                <button 
                                    onClick={() => handleTerminate(stu.studentId)} 
                                    className="px-4 py-3 text-sm font-semibold text-text-secondary hover:text-status-danger hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Terminate
                                </button>
                            </div>
                        </div>
                    );
                })}

                {Object.keys(students).length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
                        <h3 className="heading-3 mb-2">Waiting for Students</h3>
                        <p className="text-text-secondary max-w-sm">
                            Students will appear here as they connect to the exam session.
                        </p>
                    </div>
                )}
            </div>

            </div>
        </div>
    );
};

export default LiveMonitor;
