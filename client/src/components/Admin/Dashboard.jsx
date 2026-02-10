import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { 
  Plus, 
  Eye, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  FileText,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  Trash2,
  Clock
} from 'lucide-react';


const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState({
        totalTests: 0,
        activeTests: 0,
        scheduledTests: 0,
        totalStudents: 0, 
        flaggedAttempts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const examsRes = await fetch(`${API_URL}/api/exam`, {
                headers: { 'x-auth-token': token }
            });
            const examsData = await examsRes.json();
            const examList = Array.isArray(examsData) ? examsData : [];
            setExams(examList);

            const now = new Date();
            const activeTests = examList.filter(exam => {
                const start = exam.startTime ? new Date(exam.startTime) : null;
                const end = exam.endTime ? new Date(exam.endTime) : null;
                return start && end && start <= now && end >= now;
            }).length;

            const scheduledTests = examList.filter(exam => {
                const start = exam.startTime ? new Date(exam.startTime) : null;
                return start && start > now;
            }).length;

            let flaggedAttempts = 0;
            for (const exam of examList) {
                try {
                    const statsRes = await fetch(`${API_URL}/api/exam/${exam._id}/stats`, {
                        headers: { 'x-auth-token': token }
                    });
                    if (statsRes.ok) {
                        const examStats = await statsRes.json();
                        flaggedAttempts += examStats.flaggedSubmissions || 0;
                    }
                } catch (err) {}
            }

            setStats({
                totalTests: examList.length,
                activeTests,
                scheduledTests,
                totalStudents: 0, 
                flaggedAttempts
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/exam/${examId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            
            if (res.ok) {
                setExams(exams.filter(e => e._id !== examId));
                fetchDashboardData();
            } else {
                let errorMsg = 'Failed to delete exam';
                try {
                    const data = await res.json();
                    errorMsg = data.msg || errorMsg;
                } catch (parseErr) {
                    errorMsg = `Server Error: ${res.status} ${res.statusText}`;
                }
                alert(errorMsg);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Server error while deleting exam');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-rf-canvas">
                <div className="w-10 h-10 border-3 border-rf-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rf-canvas text-rf-text-pure pt-24 pb-12 px-4 sm:px-6 lg:px-8 rf-animate-bloom">
            <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-rf-text-pure mb-1">Dashboard</h1>
                    <p className="text-sm text-rf-text-dim">Welcome back, {user?.name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="rf-btn rf-btn-secondary !py-2 !px-4 !rounded-lg text-sm" onClick={() => navigate('/admin/audit')}>
                        <Activity size={16} /> Audit Logs
                    </button>
                    <button className="rf-btn rf-btn-primary !py-2 !px-5 !rounded-lg text-sm font-bold" onClick={() => navigate('/admin/create-exam')}>
                        <Plus size={16} /> Create Exam
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<TrendingUp size={18} />} label="Active Now" value={stats.activeTests} color="#10B981" />
                <StatCard icon={<FileText size={18} />} label="Total Exams" value={stats.totalTests} color="#7C3AED" />
                <StatCard icon={<AlertTriangle size={18} />} label="Flagged" value={stats.flaggedAttempts} color="#EF4444" />
                <StatCard icon={<Users size={18} />} label="Students" value={stats.totalStudents} color="#94A3B8" />
            </div>

            {/* Quick Actions */}
            <section className="mb-8">
                <h2 className="text-xs font-bold text-rf-text-muted uppercase tracking-wider mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <QuickAction icon={<Plus />} label="Create Exam" onClick={() => navigate('/admin/create-exam')} />
                    <QuickAction icon={<BarChart3 />} label="View Reports" onClick={() => navigate('/admin/audit')} />
                    <QuickAction icon={<Eye />} label="Live Monitor" onClick={() => navigate('/admin/monitor')} />
                    <QuickAction icon={<Settings />} label="Settings" onClick={() => navigate('/admin/settings')} />
                </div>
            </section>

            {/* Exams List */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-rf-text-muted uppercase tracking-wider">Your Exams</h2>
                    <button className="rf-btn rf-btn-primary !px-5 !py-2 !rounded-lg text-xs font-bold" onClick={() => navigate('/admin/create-exam')}>
                        <Plus size={14} /> New Exam
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {exams.length === 0 ? (
                        <div className="rf-card-glass flex flex-col items-center justify-center py-16 text-center">
                            <FileText size={36} className="text-rf-text-muted mb-3 opacity-30" />
                            <h3 className="text-base font-bold text-rf-text-pure mb-1">No Exams Yet</h3>
                            <p className="text-sm text-rf-text-dim">Create your first exam to get started</p>
                        </div>
                    ) : (
                        exams.map(exam => (
                            <ExamRow 
                                key={exam._id} 
                                exam={exam} 
                                onMonitor={() => navigate(`/admin/monitor/${exam._id}`)}
                                onView={() => navigate(`/admin/reports/exam/${exam._id}`)}
                                onDelete={() => handleDelete(exam._id)}
                            />
                        ))
                    )}
                </div>
            </section>

            </div>
        </div>
    );
};

/* Sub-components */
const StatCard = ({ icon, label, value, color }) => (
    <div className="rf-card-glass p-4 group hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rf-panel" style={{ color }}>
                {icon}
            </div>
            <span className="text-[11px] font-semibold text-rf-text-dim uppercase tracking-wider">{label}</span>
        </div>
        <h3 className="text-2xl font-bold text-rf-text-pure">{value}</h3>
    </div>
);


const QuickAction = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="rf-card-glass p-4 flex flex-col items-center gap-2 transition-all duration-200 group hover:-translate-y-0.5 hover:border-rf-accent/40"
    >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rf-accent/10 text-rf-accent group-hover:bg-rf-accent group-hover:text-white transition-all">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-xs font-semibold text-rf-text-silver group-hover:text-rf-text-pure">{label}</span>
    </button>
);


const ExamRow = ({ exam, onMonitor, onView, onDelete }) => {
    const now = new Date();
    const isLive = new Date(exam.startTime) <= now && new Date(exam.endTime) >= now;
    const isCompleted = now > new Date(exam.endTime);

    return (
        <div className="rf-card-glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-rf-accent/30 transition-all">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-rf-panel border border-rf-border-glass rounded-lg flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-rf-accent" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-rf-text-pure leading-tight mb-1 truncate cursor-pointer hover:text-rf-accent transition-colors" onClick={onView}>
                        {exam.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-rf-text-dim">
                        <span>{exam.questions?.length} questions</span>
                        <span>•</span>
                        <span>{exam.duration} min</span>
                        <span>•</span>
                        <span className={isLive ? 'text-rf-success font-semibold' : isCompleted ? 'text-rf-text-muted' : 'text-rf-warning'}>
                            {isLive ? 'Live' : isCompleted ? 'Ended' : 'Scheduled'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-rf-text-muted mr-2 hidden md:block">
                    {new Date(exam.startTime).toLocaleDateString()}
                </span>
                <button 
                    className="p-2 rounded-lg hover:bg-rf-panel text-rf-text-dim hover:text-rf-text-pure transition-all"
                    onClick={onView}
                    title="View Reports"
                >
                    <BarChart3 size={16} />
                </button>
                <button 
                    className="p-2 rounded-lg hover:bg-rf-danger/10 text-rf-text-dim hover:text-rf-danger transition-all"
                    onClick={onDelete}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
                <button 
                    className={`rf-btn !py-1.5 !px-4 !rounded-lg text-xs font-semibold ${isLive ? 'rf-btn-primary' : 'rf-btn-secondary'}`}
                    onClick={onMonitor}
                >
                    {isLive ? 'Monitor' : 'View'}
                </button>
            </div>
        </div>
    );
};


export default AdminDashboard;
