import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { 
  Download, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  User,
  ChevronRight,
  Eye,
  ShieldCheck,
  Search,
  Maximize2,
  ChevronLeft,
  X,
  ShieldAlert,
  Monitor as MonitorIcon,
  Save,
  Camera,
  Clock
} from 'lucide-react';


const Reports = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        if (examId) fetchSubmissions();
    }, [examId]);

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/reports/exam/${examId}/submissions`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setSubmissions(data || []);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/reports/exam/${examId}/export/csv`, {
                headers: { 'x-auth-token': token }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exam-report-${examId}.csv`;
            a.click();
        } catch (err) {
            console.error('Failed to export CSV:', err);
        }
    };

    const handleViewDetails = async (submissionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/reports/submission/${submissionId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setSelectedSubmission(data);
        } catch (err) {
            console.error('Failed to fetch submission details:', err);
        }
    };

    const handleUpdateVerdict = async (submissionId, verdict, remarks) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/reports/submission/${submissionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ verdict, adminRemarks: remarks })
            });
            if (res.ok) {
                fetchSubmissions();
                setSelectedSubmission(null);
            }
        } catch (err) {
            console.error('Failed to update verdict:', err);
        }
    };

    const filteredSubmissions = submissions.filter(s => 
        s.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* Human-readable violation type */
    const formatViolationType = (type) => {
        const map = {
            'focus_loss': 'Left the exam tab',
            'tab_switch': 'Switched to another tab',
            'face_not_detected': 'Face not visible on camera',
            'multiple_faces': 'Multiple faces detected',
            'no_face': 'No face detected',
            'browser_blur': 'Browser window lost focus',
            'devtools': 'Developer tools opened',
            'copy_paste': 'Copy/paste attempted',
            'right_click': 'Right-click attempted',
            'fullscreen_exit': 'Exited fullscreen',
            'audio_detected': 'Background audio detected',
            'screen_share_stopped': 'Screen share was stopped',
            'webcam_stopped': 'Camera was turned off',
        };
        return map[type] || type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-rf-text-muted/10 text-rf-text-muted border-rf-text-muted/20',
            medium: 'bg-rf-warning/10 text-rf-warning border-rf-warning/20',
            high: 'bg-rf-danger/10 text-rf-danger border-rf-danger/20',
            critical: 'bg-rf-danger/20 text-rf-danger border-rf-danger/40',
        };
        return colors[severity] || colors.medium;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-rf-canvas flex items-center justify-center rf-animate-bloom">
                <div className="w-10 h-10 border-3 border-rf-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
                        <h1 className="text-xl font-bold text-rf-text-pure">Exam Reports</h1>
                        <p className="text-xs text-rf-text-dim">Submissions and violation details</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="rf-card-glass px-3 py-2 flex items-center gap-2 border-rf-border-glass">
                        <Search size={15} className="text-rf-text-muted" />
                        <input 
                            placeholder="Search students..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-rf-text-pure placeholder:text-rf-text-muted w-44"
                        />
                    </div>
                    <button className="rf-btn rf-btn-primary !py-2 !px-4 !rounded-lg text-sm font-bold" onClick={handleExportCSV}>
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Submissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSubmissions.map(submission => {
                    const status = submission.verdict || 'clean';
                    const statusConfig = {
                        clean: { color: 'text-rf-success', bg: 'bg-rf-success/10 border-rf-success/20', label: 'Clean' },
                        suspicious: { color: 'text-rf-warning', bg: 'bg-rf-warning/10 border-rf-warning/20', label: 'Suspicious' },
                        cheating: { color: 'text-rf-danger', bg: 'bg-rf-danger/10 border-rf-danger/20', label: 'Cheating' }
                    };
                    const cfg = statusConfig[status] || statusConfig.clean;

                    return (
                        <div 
                            key={submission._id} 
                            onClick={() => handleViewDetails(submission._id)}
                            className="rf-card-glass p-5 cursor-pointer hover:border-rf-accent/30 transition-all group"
                        >
                            {/* Student Info */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-rf-panel/40 border border-rf-border-glass flex items-center justify-center shrink-0">
                                        <User size={18} className="text-rf-text-muted" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-rf-text-pure truncate">{submission.studentId?.name || 'Unknown Student'}</h4>
                                        <p className="text-[11px] text-rf-text-muted truncate">{submission.studentId?.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-rf-panel/30 border border-rf-border-glass rounded-lg p-3">
                                    <span className="text-[10px] text-rf-text-muted block mb-1">Score</span>
                                    <span className="text-base font-bold text-rf-text-pure">{submission.score}<span className="text-[10px] text-rf-text-muted font-normal"> / {submission.maxScore}</span></span>
                                </div>
                                <div className="bg-rf-panel/30 border border-rf-border-glass rounded-lg p-3">
                                    <span className="text-[10px] text-rf-text-muted block mb-1">Time</span>
                                    <span className="text-base font-bold text-rf-text-pure">{Math.floor(submission.timeTaken / 60)}<span className="text-[10px] text-rf-text-muted font-normal"> min</span></span>
                                </div>
                                <div className="bg-rf-panel/30 border border-rf-border-glass rounded-lg p-3">
                                    <span className="text-[10px] text-rf-text-muted block mb-1">Warnings</span>
                                    <span className={`text-base font-bold ${submission.warnings > 0 ? 'text-rf-danger' : 'text-rf-success'}`}>{submission.warnings}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-rf-border-glass">
                                <div className="flex items-center gap-3">
                                    {(submission.violations?.length > 0 || submission.warnings > 0) ? (
                                        <span className="flex items-center gap-1 text-rf-danger text-xs font-semibold">
                                            <ShieldAlert size={13} /> {submission.violations?.length || submission.warnings} violation{(submission.violations?.length || submission.warnings) !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-rf-success text-xs font-semibold">
                                            <ShieldCheck size={13} /> No issues
                                        </span>
                                    )}
                                </div>
                                <ChevronRight size={16} className="text-rf-text-muted group-hover:text-rf-accent group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </div>
                    );
                })}

                {filteredSubmissions.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <FileText size={36} className="text-rf-text-muted mb-3 opacity-30" />
                        <h3 className="text-base font-bold text-rf-text-pure mb-1">No Submissions Yet</h3>
                        <p className="text-sm text-rf-text-dim max-w-sm">
                            Submissions will appear here once students complete the exam.
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════════ Submission Detail Modal ═══════════ */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-rf-canvas/95 backdrop-blur-xl">
                    <div className="rf-card-glass w-full max-w-5xl max-h-[88vh] overflow-hidden !rounded-2xl flex flex-col lg:flex-row rf-animate-bloom">
                        
                        {/* ── Left Sidebar (Student Info + Verdict) ── */}
                        <aside className="w-full lg:w-[300px] bg-rf-panel/20 border-b lg:border-b-0 lg:border-r border-rf-border-glass p-5 overflow-y-auto shrink-0">
                            <button 
                                onClick={() => setSelectedSubmission(null)} 
                                className="flex items-center gap-1.5 text-xs font-semibold text-rf-text-dim hover:text-rf-accent transition-colors mb-4"
                            >
                                <ChevronLeft size={14} /> Back to Submissions
                            </button>
                            <p className="text-[10px] font-semibold text-rf-text-muted uppercase tracking-wider mb-3">Student</p>
                            
                            <h3 className="text-lg font-bold text-rf-text-pure mb-0.5">{selectedSubmission.submission?.studentId?.name}</h3>
                            <p className="text-xs text-rf-accent mb-5">{selectedSubmission.submission?.studentId?.email}</p>

                            <div className="space-y-3 mb-5">
                                <DetailRow label="Score" value={`${selectedSubmission.submission?.score} / ${selectedSubmission.submission?.maxScore}`} />
                                <DetailRow label="Time" value={`${Math.floor((selectedSubmission.submission?.timeTaken || 0) / 60)}m ${(selectedSubmission.submission?.timeTaken || 0) % 60}s`} />
                                <DetailRow label="Warnings" value={selectedSubmission.warningCount || selectedSubmission.submission?.warnings || 0} highlight={selectedSubmission.submission?.warnings > 0} />
                                <DetailRow label="Violations" value={selectedSubmission.violations?.length || 0} highlight={selectedSubmission.violations?.length > 0} />
                                <DetailRow label="Verdict" value={(selectedSubmission.submission?.verdict || 'clean').charAt(0).toUpperCase() + (selectedSubmission.submission?.verdict || 'clean').slice(1)} />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-rf-border-glass">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-rf-text-dim">Update Verdict</label>
                                    <select 
                                        defaultValue={selectedSubmission.submission?.verdict || 'clean'}
                                        onChange={(e) => setSelectedSubmission({ ...selectedSubmission, submission: { ...selectedSubmission.submission, verdict: e.target.value } })}
                                        className="w-full bg-rf-panel/40 border border-rf-border-glass rounded-lg px-3 py-2 text-sm text-rf-text-pure outline-none focus:border-rf-accent transition-all"
                                    >
                                        <option value="clean">Clean</option>
                                        <option value="suspicious">Suspicious</option>
                                        <option value="cheating">Cheating</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-rf-text-dim">Admin Remarks</label>
                                    <textarea 
                                        placeholder="Add notes..."
                                        defaultValue={selectedSubmission.submission?.adminRemarks || ''}
                                        onChange={(e) => setSelectedSubmission({ ...selectedSubmission, submission: { ...selectedSubmission.submission, adminRemarks: e.target.value } })}
                                        className="w-full bg-rf-panel/40 border border-rf-border-glass rounded-lg p-3 text-sm text-rf-text-pure outline-none focus:border-rf-accent min-h-[80px] resize-none transition-all"
                                    />
                                </div>
                                <button 
                                    className="rf-btn rf-btn-primary w-full py-2.5 text-sm font-bold" 
                                    onClick={() => handleUpdateVerdict(selectedSubmission.submission?._id, selectedSubmission.submission?.verdict, selectedSubmission.submission?.adminRemarks)}
                                >
                                    <Save size={14} /> Save Verdict
                                </button>
                            </div>
                        </aside>

                        {/* ── Right: Violation Timeline ── */}
                        <main className="flex-1 p-5 overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-rf-text-pure">
                                    Violation Timeline 
                                    <span className="text-xs text-rf-text-muted font-normal ml-2">
                                        ({selectedSubmission.violations?.length || 0} event{(selectedSubmission.violations?.length || 0) !== 1 ? 's' : ''})
                                    </span>
                                </h3>
                                <button className="p-2 rf-btn rf-btn-secondary !rounded-lg" onClick={() => setSelectedSubmission(null)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedSubmission.violations && selectedSubmission.violations.length > 0 ? (
                                    selectedSubmission.violations.map((violation, idx) => (
                                        <div key={idx} className="rf-card-glass p-4 border-l-4 border-l-rf-danger/60">
                                            {/* Violation Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-rf-danger/10 border border-rf-danger/20 rounded-lg">
                                                        <AlertTriangle size={14} className="text-rf-danger" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-rf-text-pure">
                                                            {formatViolationType(violation.type)}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="flex items-center gap-1 text-[10px] text-rf-text-muted">
                                                                <Clock size={10} /> {violation.timestamp ? new Date(violation.timestamp).toLocaleTimeString() : 'Unknown time'}
                                                            </span>
                                                            {violation.severity && (
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getSeverityColor(violation.severity)}`}>
                                                                    {violation.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-rf-text-muted font-mono">#{idx + 1}</span>
                                            </div>

                                            {/* Evidence: Camera & Screen Screenshots */}
                                            {violation.evidence && (violation.evidence.webcam || violation.evidence.screen) ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                    {violation.evidence.webcam && (
                                                        <div className="relative group/frame">
                                                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-rf-border-glass">
                                                                <img src={violation.evidence.webcam} className="w-full h-full object-cover" alt="Camera capture" />
                                                            </div>
                                                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-bold text-white">
                                                                <Camera size={9} /> Camera
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.webcam); }}
                                                                className="absolute bottom-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded opacity-0 group-hover/frame:opacity-100 transition-all"
                                                            >
                                                                <Maximize2 size={11} className="text-white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {violation.evidence.screen && (
                                                        <div className="relative group/frame">
                                                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-rf-border-glass">
                                                                <img src={violation.evidence.screen} className="w-full h-full object-cover" alt="Screen capture" />
                                                            </div>
                                                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-bold text-white">
                                                                <MonitorIcon size={9} /> Screen
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.screen); }}
                                                                className="absolute bottom-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded opacity-0 group-hover/frame:opacity-100 transition-all"
                                                            >
                                                                <Maximize2 size={11} className="text-white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-2 bg-rf-panel/20 border border-rf-border-glass rounded-lg p-3 flex items-center gap-3">
                                                    <Eye size={14} className="text-rf-text-muted shrink-0" />
                                                    <p className="text-xs text-rf-text-dim">No camera or screen capture for this event</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <ShieldCheck size={28} className="text-rf-success mb-3" />
                                        <h3 className="text-base font-bold text-rf-text-pure mb-1">Clean Session</h3>
                                        <p className="text-sm text-rf-text-dim">
                                            {(selectedSubmission.warningCount || selectedSubmission.submission?.warnings || 0) > 0
                                                ? `${selectedSubmission.submission?.warnings} warning(s) were recorded but no detailed violation data was captured.`
                                                : 'No violations were detected during this exam.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            )}

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all z-10"
                        onClick={() => setLightboxImage(null)}
                    >
                        <X size={20} className="text-white" />
                    </button>
                    <img 
                        src={lightboxImage} 
                        alt="Evidence preview" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            </div>
        </div>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs text-rf-text-muted">{label}</span>
        <span className={`text-sm font-semibold ${highlight ? 'text-rf-danger' : 'text-rf-text-pure'}`}>{value}</span>
    </div>
);

export default Reports;
