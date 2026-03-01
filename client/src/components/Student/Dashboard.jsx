import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  FileText,
  Shield
} from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch(`${API_URL}/api/exam`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
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

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 10000); 
        return () => clearInterval(timer);
    }, []);

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
                delay: 0.6
            });

            // MAGNETIC EFFECT
            const cards = document.querySelectorAll(".magnetic-card");
            cards.forEach(card => {
                card.addEventListener("mousemove", (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    gsap.to(card, {
                        x: x * 0.15,
                        y: y * 0.15,
                        rotationY: x * 0.08,
                        rotationX: -y * 0.08,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, {
                        x: 0,
                        y: 0,
                        rotationY: 0,
                        rotationX: 0,
                        duration: 1.2,
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-text-primary pt-28 pb-12 px-6 sm:px-8">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Header Section */}
                <div className="mb-12 border-b border-border/50 pb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-text-primary">
                            Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-text-secondary text-lg">Your assessments and academic progress.</p>
                    </div>
                </div>

                {/* Empty State */}
                {exams.length === 0 && (
                    <div className="bg-surface rounded-[2rem] border border-border flex flex-col items-center justify-center py-32 text-center shadow-sm">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-border/50 mb-6"
                        >
                            <FileText size={48} className="text-text-tertiary opacity-40" strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-text-primary">No Assessments Yet</h3>
                        <p className="text-text-secondary max-w-sm text-lg">
                            You don't have any exams assigned to your cohort yet. Check back later or contact your instructor.
                        </p>
                    </div>
                )}

                {/* Live Exams (Priority Layout - Large Cards) */}
                {liveExams.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-success/10">
                                <div className="w-3 h-3 rounded-full bg-status-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                            <h2 className="text-lg font-bold text-text-primary tracking-tight">Active Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveExams.map((exam, i) => (
                                <div key={exam._id} className="bento-item">
                                    <AnimatedExamCard index={i} exam={exam} status="live" onClick={() => navigate(`/landing/${exam._id}`)} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming & Completed Split (Bento style if applicable) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Upcoming */}
                    {upcomingExams.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6 px-2">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Calendar size={16} className="text-status-warning" />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary tracking-tight">Upcoming</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                {upcomingExams.map((exam, i) => (
                                    <div key={exam._id} className="exam-row">
                                        <AnimatedExamRow index={i} exam={exam} status="upcoming" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Completed */}
                    {completedExams.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6 px-2">
                                <div className="w-8 h-8 rounded-full bg-panel flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-text-tertiary" />
                                </div>
                                <h2 className="text-lg font-bold text-text-primary tracking-tight">Completed</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                {completedExams.map((exam, i) => (
                                    <div key={exam._id} className="exam-row">
                                        <AnimatedExamRow index={i} exam={exam} status="completed" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
};

/* Animated Cards and Rows */
const AnimatedExamCard = ({ exam, status, onClick, index }) => {
    return (
        <div 
            className="magnetic-card bg-white rounded-[2rem] border border-primary/20 p-8 flex flex-col justify-between shadow-lg cursor-pointer group relative overflow-hidden perspective-1000"
            onClick={onClick}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-primary border border-border shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <Shield size={24} />
                    </div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-status-success border border-green-200 shadow-sm">
                        <Play size={10} className="fill-current" /> LIVE
                    </span>
                </div>
                
                <h3 className="text-2xl font-bold text-text-primary leading-tight mb-4 group-hover:text-primary transition-colors">{exam.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Duration</span>
                        <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                            <Clock size={14} className="text-primary"/> {exam.duration}m
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Questions</span>
                        <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                            <BookOpen size={14} className="text-primary"/> {exam.questions?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-auto relative z-10"
            >
                Enter Examination Context <ArrowRight size={16} />
            </motion.button>
        </div>
    );
};

const AnimatedExamRow = ({ exam, status, index }) => {
    const isUpcoming = status === 'upcoming';
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    
    return (
        <div 
            className={`bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${isUpcoming ? 'hover:border-status-warning shadow-sm hover:shadow' : 'opacity-80'}`}
        >
            <div className="flex flex-col sm:w-2/3">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-text-primary leading-tight truncate">{exam.title}</h3>
                    {isUpcoming && startTime && (
                        <span className="text-xs font-semibold text-status-warning bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap hidden sm:inline-block">
                            Starts {startTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {exam.duration}m</span>
                    <span className="text-border mx-1">|</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={14} /> {exam.questions?.length || 0} Qs</span>
                </div>
            </div>

            <div className="flex sm:w-1/3 sm:justify-end">
                <div className={`w-full sm:w-auto text-center px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase border
                    ${isUpcoming ? 'bg-amber-50 text-status-warning border-amber-200' : 'bg-surface text-text-tertiary border-border'}`}
                >
                    {isUpcoming ? 'Scheduled' : 'Submitted'}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
