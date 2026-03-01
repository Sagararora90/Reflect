import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Plus, 
  Eye, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  FileText,
  Settings,
  Shield,
  TrendingUp,
  Trash2,
  Clock,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);
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
            const examsRes = await fetch(`${API_URL}/api/exam`, { headers: { 'x-auth-token': token } });
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
            await Promise.all(examList.map(async (exam) => {
                try {
                    const statsRes = await fetch(`${API_URL}/api/exam/${exam._id}/stats`, { headers: { 'x-auth-token': token } });
                    if (statsRes.ok) {
                        const examStats = await statsRes.json();
                        flaggedAttempts += examStats.flaggedSubmissions || 0;
                    }
                } catch (err) {}
            }));

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
                alert('Failed to delete exam');
            }
        } catch (err) {
            alert('Server error while deleting exam');
        }
    };

    useGSAP(() => {
        if (!loading) {
            gsap.from(".bento-item", {
                y: 30,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "expo.out",
                clearProps: "all"
            });
            
            gsap.from(".exam-row", {
                x: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.8
            });

            // MAGNETIC EFFECT
            const cards = document.querySelectorAll(".magnetic-card");
            cards.forEach(card => {
                card.addEventListener("mousemove", (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    gsap.to(card, {
                        x: x * 0.1,
                        y: y * 0.1,
                        rotationY: x * 0.05,
                        rotationX: -y * 0.05,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, {
                        x: 0,
                        y: 0,
                        rotationY: 0,
                        rotationX: 0,
                        duration: 1,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            });
        }
    }, { dependencies: [loading], scope: containerRef });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full" 
                />
            </div>
        );
    }

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-text-primary pt-28 pb-12 px-6 sm:px-8">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-text-primary items-center flex gap-3">
                            Overview
                        </h1>
                        <p className="text-text-secondary text-lg">Welcome back, <span className="text-primary font-medium">{user?.name || 'Admin'}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="btn btn-primary shadow-lg shadow-primary/20 py-3 px-6 rounded-full flex items-center gap-2" 
                            onClick={() => navigate('/admin/create-exam')}
                        >
                            <Plus size={18} /> New Assessment
                        </motion.button>
                    </div>
                </header>

                {/* BENTO BOX GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-min">
                    
                    {/* Main Stats Panel (ColSpan 8) */}
                    <div className="col-span-1 md:col-span-4 lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bento-item">
                            <BentoStatCard 
                                icon={<TrendingUp size={20} />} 
                                label="Active Exams" 
                                value={stats.activeTests} 
                                trend="+2 from last week"
                                color="text-status-success" 
                                bgColor="bg-green-50"
                                borderColor="border-green-100"
                            />
                        </div>
                        <div className="bento-item">
                            <BentoStatCard 
                                icon={<FileText size={20} />} 
                                label="Total Created" 
                                value={stats.totalTests} 
                                trend="All time"
                                color="text-primary" 
                                bgColor="bg-primary/10"
                                borderColor="border-primary/20"
                            />
                        </div>
                        <div className="bento-item">
                            <BentoStatCard 
                                icon={<AlertTriangle size={20} />} 
                                label="Integrity Flags" 
                                value={stats.flaggedAttempts} 
                                trend="Needs review"
                                color="text-status-danger" 
                                bgColor="bg-red-50"
                                borderColor="border-red-100"
                            />
                        </div>
                        <div className="bento-item">
                            <BentoStatCard 
                                icon={<Users size={20} />} 
                                label="Total Students" 
                                value={stats.totalStudents} 
                                trend="Registered users"
                                color="text-text-secondary" 
                                bgColor="bg-panel"
                                borderColor="border-border"
                            />
                        </div>
                    </div>

                    {/* Quick Access Floating Panel (ColSpan 4) */}
                    <div className="bento-item col-span-1 md:col-span-4 lg:col-span-4 bg-surface rounded-[2rem] border border-border p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-text-primary text-lg">Quick Access</h3>
                                <Shield size={18} className="text-text-tertiary" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <BentoQuickAction icon={<Eye />} label="Live Monitor" color="text-primary" bg="bg-primary/5" onClick={() => {
                                    const now = new Date();
                                    const activeTest = exams.find(e => new Date(e.startTime) <= now && new Date(e.endTime) >= now);
                                    if (activeTest) navigate(`/admin/monitor/${activeTest._id}`);
                                    else alert("No active exams to monitor presently.");
                                }} />
                                <BentoQuickAction icon={<BarChart3 />} label="Reports" color="text-purple-600" bg="bg-purple-50" onClick={() => navigate('/admin/audit')} />
                                <BentoQuickAction icon={<Plus />} label="Create" color="text-green-600" bg="bg-green-50" onClick={() => navigate('/admin/create-exam')} />
                                <BentoQuickAction icon={<Settings />} label="Settings" color="text-text-secondary" bg="bg-panel" onClick={() => navigate('/admin/settings')} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Exams List (Spans Full Width Below) */}
                    <div className="bento-item col-span-1 md:col-span-4 lg:col-span-12 bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm mt-2">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
                            <h2 className="text-lg font-bold text-text-primary">Recent Assessments</h2>
                            <button 
                                className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
                                onClick={() => navigate('/admin/audit')}
                            >
                                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="flex flex-col">
                            {exams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <FileText size={48} className="text-text-tertiary mb-4 opacity-50" strokeWidth={1} />
                                    <h3 className="text-base font-bold text-text-primary mb-1">No Exams Created Yet</h3>
                                    <p className="text-sm text-text-secondary">Start evaluating your students by building a new assessment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {exams.slice(0, 5).map((exam, index) => (
                                        <BentoExamRow 
                                            key={exam._id} 
                                            index={index}
                                            exam={exam} 
                                            onMonitor={() => navigate(`/admin/monitor/${exam._id}`)}
                                            onView={() => navigate(`/admin/reports/exam/${exam._id}`)}
                                            onDelete={() => handleDelete(exam._id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* Sub-components */
const BentoStatCard = ({ icon, label, value, color, bgColor, borderColor, trend }) => (
    <div 
        className={`magnetic-card bg-white rounded-[2rem] border ${borderColor} p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default perspective-1000`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>
                {icon}
            </div>
        </div>
        <div>
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-1">{label}</span>
            <div className="flex items-end gap-3">
                <h3 className="text-4xl font-bold text-text-primary tracking-tight leading-none">{value}</h3>
            </div>
            <p className="text-[11px] font-medium text-text-tertiary mt-2">{trend}</p>
        </div>
    </div>
);

const BentoQuickAction = ({ icon, label, onClick, color, bg }) => (
    <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl ${bg} border border-transparent hover:border-black/5 transition-colors group`}
    >
        <div className={`${color}`}>
            {React.cloneElement(icon, { size: 22 })}
        </div>
        <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
    </motion.button>
);

const BentoExamRow = ({ exam, onMonitor, onView, onDelete, index }) => {
    const now = new Date();
    const isLive = new Date(exam.startTime) <= now && new Date(exam.endTime) >= now;
    const isCompleted = now > new Date(exam.endTime);

    return (
        <div 
            className="exam-row p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/50 transition-colors group"
        >
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm shrink-0 group-hover:border-primary/30 transition-colors">
                    <Shield size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-base font-bold text-text-primary leading-tight mb-1 truncate cursor-pointer hover:text-primary transition-colors" onClick={onView}>
                        {exam.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {exam.duration}m</span>
                        <span className="text-text-tertiary">•</span>
                        <span>{exam.questions?.length} Qs</span>
                        <span className="text-text-tertiary">•</span>
                        <span className={isLive ? 'text-status-success font-bold flex items-center gap-1.5' : isCompleted ? 'text-text-tertiary' : 'text-status-warning font-bold'}>
                            {isLive && <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />}
                            {isLive ? 'LIVE' : isCompleted ? 'Ended' : 'Scheduled'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                <span className="text-xs font-medium text-text-tertiary mr-4 hidden md:block">
                    {new Date(exam.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <button 
                    className="p-2.5 rounded-xl hover:bg-panel text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
                    onClick={onView}
                    title="View Reports"
                >
                    <BarChart3 size={16} />
                </button>
                <button 
                    className="p-2.5 rounded-xl hover:bg-red-50 text-text-secondary hover:text-status-danger transition-colors border border-transparent hover:border-red-100"
                    onClick={onDelete}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
                <button 
                    className={`ml-2 px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${isLive ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-text-primary border border-border hover:bg-panel'}`}
                    onClick={onMonitor}
                >
                    {isLive ? 'Monitor' : 'View'}
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
