import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  FileText,
  AlertTriangle
} from 'lucide-react';


const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch(`${API_URL}/api/exam`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                const data = await res.json();
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch exams:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const now = new Date();

    const liveExams = exams.filter(e => {
        const start = e.startTime ? new Date(e.startTime) : null;
        const end = e.endTime ? new Date(e.endTime) : null;
        return start && end && start <= now && end >= now && !e.hasSubmitted;
    });

    const upcomingExams = exams.filter(e => {
        const start = e.startTime ? new Date(e.startTime) : null;
        return start && start > now;
    });

    const completedExams = exams.filter(e => e.hasSubmitted);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-rf-canvas">
                <div className="w-10 h-10 border-3 border-rf-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rf-canvas pt-24 pb-12 px-4 sm:px-6 lg:px-8 rf-animate-bloom">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-rf-text-pure mb-1">
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}
                    </h1>
                    <p className="text-sm text-rf-text-dim">Here are your exams</p>
                </div>

                {/* Live Exams */}
                {liveExams.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-rf-success animate-pulse" />
                            <h2 className="text-sm font-bold text-rf-success uppercase tracking-wider">Live Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveExams.map(exam => (
                                <ExamCard key={exam._id} exam={exam} status="live" onClick={() => navigate(`/landing/${exam._id}`)} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Exams */}
                {upcomingExams.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-bold text-rf-text-muted uppercase tracking-wider mb-4">Upcoming</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcomingExams.map(exam => (
                                <ExamCard key={exam._id} exam={exam} status="upcoming" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Completed Exams */}
                {completedExams.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-bold text-rf-text-muted uppercase tracking-wider mb-4">Completed</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedExams.map(exam => (
                                <ExamCard key={exam._id} exam={exam} status="completed" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {exams.length === 0 && (
                    <div className="rf-card-glass flex flex-col items-center justify-center py-20 text-center">
                        <FileText size={40} className="text-rf-text-muted mb-4 opacity-30" />
                        <h3 className="text-lg font-bold text-rf-text-pure mb-1">No Exams Available</h3>
                        <p className="text-sm text-rf-text-dim max-w-sm">
                            You don't have any exams assigned yet. Check back later or contact your teacher.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


const ExamCard = ({ exam, status, onClick }) => {
    const statusConfig = {
        live: { color: 'text-rf-success', bg: 'bg-rf-success/10 border-rf-success/20', label: 'Live', icon: <Play size={14} /> },
        upcoming: { color: 'text-rf-warning', bg: 'bg-rf-warning/10 border-rf-warning/20', label: 'Upcoming', icon: <Calendar size={14} /> },
        completed: { color: 'text-rf-text-muted', bg: 'bg-rf-panel/40 border-rf-border-glass', label: 'Submitted', icon: <CheckCircle2 size={14} /> },
    };

    const cfg = statusConfig[status];
    const startTime = exam.startTime ? new Date(exam.startTime) : null;

    return (
        <div 
            className={`rf-card-glass p-5 ${onClick ? 'cursor-pointer hover:border-rf-accent/30' : ''} transition-all duration-300`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-rf-text-pure leading-tight pr-4">{exam.title}</h3>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-rf-text-dim mb-4">
                <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {exam.duration} min
                </span>
                <span className="flex items-center gap-1.5">
                    <BookOpen size={13} /> {exam.questions?.length || 0} questions
                </span>
            </div>

            {startTime && (
                <div className="text-[11px] text-rf-text-muted mb-4">
                    {status === 'upcoming' ? 'Starts' : 'Started'}: {startTime.toLocaleString()}
                </div>
            )}

            {status === 'live' && (
                <button className="rf-btn rf-btn-primary w-full py-2.5 !rounded-lg text-xs font-bold gap-2">
                    Take Exam <ArrowRight size={14} />
                </button>
            )}
        </div>
    );
};


export default StudentDashboard;
