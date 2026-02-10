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
        console.log("Joining monitor room:", examId);
        socket.emit('join-monitor', examId);

        socket.on('monitor-update', (data) => {
            if (!data) return; 
            console.log("Monitor update received:", data.studentId);
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
        <div className="min-h-screen bg-rf-canvas pt-24 pb-12 px-4 sm:px-6 lg:px-8 rf-animate-bloom">
            <div className="max-w-6xl mx-auto">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="p-2 rf-btn rf-btn-secondary !rounded-lg" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-rf-text-pure">Live Monitor</h1>
                        <p className="text-xs text-rf-text-dim">Watch student activity in real time</p>
                    </div>
                </div>
                
                <div className="rf-card-glass px-4 py-2 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rf-success animate-pulse" />
                    <span className="text-xs font-bold text-rf-text-pure">{Object.keys(students).length} students online</span>
                    <div className="w-px h-4 bg-rf-border-glass" />
                    <Wifi size={14} className="text-rf-accent" />
                    <span className="text-xs text-rf-text-dim">Connected</span>
                </div>
            </header>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.values(students).map(stu => {
                    const isOffline = Date.now() - stu.lastUpdate > 15000;
                    const isHighRisk = stu.violations > 5;
                    
                    return (
                        <div 
                            key={stu.studentId} 
                            className={`rf-card-glass !p-0 overflow-hidden transition-all group ${isHighRisk ? 'border-rf-danger/40' : ''}`}
                        >
                            {/* Risk Indicator Bar */}
                            <div className={`h-1 ${isHighRisk ? 'bg-rf-danger' : isOffline ? 'bg-rf-text-muted' : 'bg-rf-success'}`} />
                            
                            <div className="p-5">
                                {/* Student Info */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-lg bg-rf-panel/40 border border-rf-border-glass flex items-center justify-center">
                                                <User size={18} className="text-rf-text-muted" />
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-rf-canvas ${isOffline ? 'bg-rf-text-muted' : 'bg-rf-success'}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-rf-text-pure">{stu.name}</h4>
                                            <span className="flex items-center gap-1 text-[10px] text-rf-text-muted">
                                                <Clock size={10} /> {new Date(stu.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${isHighRisk ? 'bg-rf-danger/10 border-rf-danger/20 text-rf-danger' : 'bg-rf-panel/40 border-rf-border-glass text-rf-text-muted'}`}>
                                        {stu.violations} warnings
                                    </span>
                                </div>

                                {/* Camera & Screen Feeds */}
                                <div className="grid grid-cols-2 gap-2 aspect-video mb-4">
                                    <div className="relative bg-rf-panel/40 rounded-lg overflow-hidden border border-rf-border-glass">
                                        {stu.webcam ? (
                                            <img src={stu.webcam} className="w-full h-full object-cover" alt="Camera" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-rf-text-muted opacity-20">
                                                <Eye size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-rf-canvas/80 backdrop-blur-md rounded text-[8px] font-bold text-rf-text-pure">Camera</div>
                                    </div>
                                    <div className="relative bg-rf-panel/40 rounded-lg overflow-hidden border border-rf-border-glass">
                                        {stu.screen ? (
                                            <img src={stu.screen} className="w-full h-full object-cover" alt="Screen" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-rf-text-muted opacity-20">
                                                <MonitorIcon size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-rf-canvas/80 backdrop-blur-md rounded text-[8px] font-bold text-rf-text-pure">Screen</div>
                                    </div>
                                </div>

                                {/* Alert Log */}
                                <div className="bg-rf-panel/20 rounded-lg p-3 border border-rf-border-glass h-28 overflow-hidden flex flex-col">
                                    <p className="text-[10px] font-bold text-rf-text-muted uppercase tracking-wider mb-2">Recent Alerts</p>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                        {stu.alerts && stu.alerts.length > 0 ? (
                                            stu.alerts.map((alert, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs mb-1.5">
                                                    <span className={`font-medium ${idx === 0 ? 'text-rf-accent' : 'text-rf-text-dim'}`}>
                                                        {alert.type}
                                                    </span>
                                                    <span className="text-[10px] text-rf-text-muted font-mono">
                                                        {new Date(alert.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-rf-text-muted opacity-40">No alerts yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 divide-x divide-rf-border-glass bg-rf-panel/20 border-t border-rf-border-glass">
                                <button 
                                    onClick={() => handleWarn(stu.studentId)} 
                                    className="px-4 py-3 text-xs font-semibold text-rf-text-muted hover:text-rf-accent hover:bg-rf-accent/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={14} /> Warn
                                </button>
                                <button 
                                    onClick={() => handleTerminate(stu.studentId)} 
                                    className="px-4 py-3 text-xs font-semibold text-rf-text-muted hover:text-rf-danger hover:bg-rf-danger/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={14} /> End Exam
                                </button>
                            </div>
                        </div>
                    );
                })}

                {Object.keys(students).length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 border-3 border-rf-accent/30 border-t-rf-accent rounded-full animate-spin mb-4" />
                        <h3 className="text-base font-bold text-rf-text-pure mb-1">Waiting for Students</h3>
                        <p className="text-sm text-rf-text-dim max-w-sm">
                            Students will appear here as they join the exam.
                        </p>
                    </div>
                )}
            </div>

            </div>
        </div>
    );
};

export default LiveMonitor;
