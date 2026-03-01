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
            low: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
            medium: 'bg-amber-50 text-status-warning border-amber-200',
            high: 'bg-red-50 text-status-danger border-red-200',
            critical: 'bg-status-danger text-white border-status-danger',
        };
        return colors[severity] || colors.medium;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary pt-24 pb-12 px-6 sm:px-8">
            <div className="max-w-6xl mx-auto">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary px-3 py-2" onClick={() => navigate('/admin/dashboard')}>
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="heading-2 mb-1">Exam Reports</h1>
                        <p className="text-body mt-0">Submissions and violation details</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="card px-3 py-2 flex items-center gap-2">
                        <Search size={16} className="text-text-tertiary" />
                        <input 
                            placeholder="Search students..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary w-44"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Submissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSubmissions.map(submission => {
                    const status = submission.verdict || 'clean';
                    const statusConfig = {
                        clean: { color: 'text-status-success', bg: 'bg-green-50 border-green-200', label: 'Clean' },
                        suspicious: { color: 'text-status-warning', bg: 'bg-amber-50 border-amber-200', label: 'Suspicious' },
                        cheating: { color: 'text-status-danger', bg: 'bg-red-50 border-red-200', label: 'Cheating' }
                    };
                    const cfg = statusConfig[status] || statusConfig.clean;

                    return (
                        <div 
                            key={submission._id} 
                            onClick={() => handleViewDetails(submission._id)}
                            className="card p-5 cursor-pointer hover:border-primary/40 transition-colors group flex flex-col"
                        >
                            {/* Student Info */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-panel border border-border flex items-center justify-center shrink-0">
                                        <User size={18} className="text-text-secondary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-text-primary truncate">{submission.studentId?.name || 'Unknown Student'}</h4>
                                        <p className="text-xs text-text-secondary truncate mt-0.5">{submission.studentId?.email}</p>
                                    </div>
                                </div>
                                <span className={`shrink-0 ml-3 px-2 py-1 rounded-md border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-5 mt-auto">
                                <div className="bg-surface border border-border rounded-lg p-3">
                                    <span className="text-xs text-text-secondary block mb-1">Score</span>
                                    <span className="text-base font-bold text-text-primary">{submission.score}<span className="text-xs text-text-tertiary font-normal"> / {submission.maxScore}</span></span>
                                </div>
                                <div className="bg-surface border border-border rounded-lg p-3">
                                    <span className="text-xs text-text-secondary block mb-1">Time</span>
                                    <span className="text-base font-bold text-text-primary">{Math.floor(submission.timeTaken / 60)}<span className="text-xs text-text-tertiary font-normal"> min</span></span>
                                </div>
                                <div className="bg-surface border border-border rounded-lg p-3">
                                    <span className="text-xs text-text-secondary block mb-1">Warnings</span>
                                    <span className={`text-base font-bold ${submission.warnings > 0 ? 'text-status-danger' : 'text-status-success'}`}>{submission.warnings}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                <div className="flex items-center gap-3">
                                    {(submission.violations?.length > 0 || submission.warnings > 0) ? (
                                        <span className="flex items-center gap-1.5 text-status-danger text-sm font-medium">
                                            <ShieldAlert size={14} /> {submission.violations?.length || submission.warnings} violation{(submission.violations?.length || submission.warnings) !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-status-success text-sm font-medium">
                                            <ShieldCheck size={14} /> No issues
                                        </span>
                                    )}
                                </div>
                                <ChevronRight size={18} className="text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    );
                })}

                {filteredSubmissions.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                        <FileText size={40} className="text-text-tertiary mb-4 opacity-50" />
                        <h3 className="heading-3 mb-2">No Submissions Yet</h3>
                        <p className="text-text-secondary max-w-sm">
                            Submissions will appear here once students complete the exam.
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════════ Submission Detail Modal ═══════════ */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* ── Left Sidebar (Student Info + Verdict) ── */}
                        <aside className="w-full lg:w-[320px] bg-surface border-b lg:border-b-0 lg:border-r border-border p-6 overflow-y-auto shrink-0 flex flex-col">
                            <button 
                                onClick={() => setSelectedSubmission(null)} 
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6 w-fit"
                            >
                                <ChevronLeft size={16} /> Back to Submissions
                            </button>
                            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Participant</p>
                            
                            <h3 className="heading-3 mb-1">{selectedSubmission.submission?.studentId?.name}</h3>
                            <p className="text-sm text-text-secondary mb-6">{selectedSubmission.submission?.studentId?.email}</p>

                            <div className="space-y-4 mb-6">
                                <DetailRow label="Final Score" value={`${selectedSubmission.submission?.score} / ${selectedSubmission.submission?.maxScore}`} />
                                <DetailRow label="Time Elapsed" value={`${Math.floor((selectedSubmission.submission?.timeTaken || 0) / 60)}m ${(selectedSubmission.submission?.timeTaken || 0) % 60}s`} />
                                <DetailRow label="Warnings" value={selectedSubmission.warningCount || selectedSubmission.submission?.warnings || 0} highlight={selectedSubmission.submission?.warnings > 0} />
                                <DetailRow label="Violations" value={selectedSubmission.violations?.length || 0} highlight={selectedSubmission.violations?.length > 0} />
                                <DetailRow label="Final Verdict" value={(selectedSubmission.submission?.verdict || 'clean').charAt(0).toUpperCase() + (selectedSubmission.submission?.verdict || 'clean').slice(1)} />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border mt-auto">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-text-primary">Update Verdict</label>
                                    <select 
                                        defaultValue={selectedSubmission.submission?.verdict || 'clean'}
                                        onChange={(e) => setSelectedSubmission({ ...selectedSubmission, submission: { ...selectedSubmission.submission, verdict: e.target.value } })}
                                        className="input-field"
                                    >
                                        <option value="clean">Clean</option>
                                        <option value="suspicious">Suspicious</option>
                                        <option value="cheating">Cheating</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-text-primary">Admin Remarks</label>
                                    <textarea 
                                        placeholder="Add private evaluation notes..."
                                        defaultValue={selectedSubmission.submission?.adminRemarks || ''}
                                        onChange={(e) => setSelectedSubmission({ ...selectedSubmission, submission: { ...selectedSubmission.submission, adminRemarks: e.target.value } })}
                                        className="input-field min-h-[100px] resize-none"
                                    />
                                </div>
                                <button 
                                    className="btn btn-primary w-full mt-2" 
                                    onClick={() => handleUpdateVerdict(selectedSubmission.submission?._id, selectedSubmission.submission?.verdict, selectedSubmission.submission?.adminRemarks)}
                                >
                                    <Save size={16} /> Save Verdict
                                </button>
                            </div>
                        </aside>

                        {/* ── Right: Violation Timeline ── */}
                        <main className="flex-1 p-6 overflow-y-auto bg-background">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="heading-3">
                                    Violation Timeline 
                                    <span className="text-sm text-text-secondary font-normal ml-3 bg-panel px-2 py-0.5 rounded-full border border-border">
                                        {selectedSubmission.violations?.length || 0} event{(selectedSubmission.violations?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                </h3>
                                <button className="p-2 btn btn-secondary px-3 py-2" onClick={() => setSelectedSubmission(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedSubmission.violations && selectedSubmission.violations.length > 0 ? (
                                    selectedSubmission.violations.map((violation, idx) => (
                                        <div key={idx} className="card p-5 border-l-4 border-l-status-danger border-t-border border-r-border border-b-border rounded-l-none bg-surface">
                                            {/* Violation Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
                                                        <AlertTriangle size={16} className="text-status-danger" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary mb-1">
                                                            {formatViolationType(violation.type)}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                                <Clock size={12} /> {violation.timestamp ? new Date(violation.timestamp).toLocaleTimeString() : 'Unknown time'}
                                                            </span>
                                                            {violation.severity && (
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getSeverityColor(violation.severity)}`}>
                                                                    {violation.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-text-tertiary font-mono">#{idx + 1}</span>
                                            </div>

                                            {/* Evidence: Camera & Screen Screenshots */}
                                            {violation.evidence && (violation.evidence.webcam || violation.evidence.screen) ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                    {violation.evidence.webcam && (
                                                        <div className="relative group/frame">
                                                            <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border border-border cursor-pointer" onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.webcam); }}>
                                                                <img src={violation.evidence.webcam} className="w-full h-full object-cover" alt="Camera capture" />
                                                            </div>
                                                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-semibold text-white pointer-events-none">
                                                                <Camera size={10} /> Camera
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.webcam); }}
                                                                className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-md opacity-0 group-hover/frame:opacity-100 transition-all backdrop-blur-sm"
                                                            >
                                                                <Maximize2 size={14} className="text-white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {violation.evidence.screen && (
                                                        <div className="relative group/frame">
                                                            <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border border-border cursor-pointer" onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.screen); }}>
                                                                <img src={violation.evidence.screen} className="w-full h-full object-cover" alt="Screen capture" />
                                                            </div>
                                                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-semibold text-white pointer-events-none">
                                                                <MonitorIcon size={10} /> Screen
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setLightboxImage(violation.evidence.screen); }}
                                                                className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-md opacity-0 group-hover/frame:opacity-100 transition-all backdrop-blur-sm"
                                                            >
                                                                <Maximize2 size={14} className="text-white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-4 bg-panel border border-border rounded-lg p-4 flex items-center gap-3">
                                                    <Eye size={16} className="text-text-tertiary shrink-0" />
                                                    <p className="text-sm text-text-secondary">No camera or screen capture available for this specific event</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
                                        <ShieldCheck size={40} className="text-status-success mb-4" />
                                        <h3 className="heading-3 mb-2">Clean Session</h3>
                                        <p className="text-text-secondary max-w-sm">
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
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 cursor-pointer animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
                        onClick={() => setLightboxImage(null)}
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <img 
                        src={lightboxImage} 
                        alt="Evidence preview full size" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            </div>
        </div>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={`text-sm font-semibold ${highlight ? 'text-status-danger' : 'text-text-primary'}`}>{value}</span>
    </div>
);

export default Reports;
