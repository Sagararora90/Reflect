import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Login = () => {
    const location = useLocation();
    const isRegister = location.pathname === '/register';
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const { login, register, user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const panelRef = useRef(null);

    useGSAP(() => {
        // Spatial 3D Tilting Effect
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const xPercent = (clientX / innerWidth - 0.5) * 2;
            const yPercent = (clientY / innerHeight - 0.5) * 2;

            if (panelRef.current) {
                gsap.to(panelRef.current, {
                    rotateY: xPercent * 10,
                    rotateX: -yPercent * 10,
                    duration: 1.2,
                    ease: "power2.out",
                    transformPerspective: 1200
                });
            }

            // Glow follow
            gsap.to(".spatial-glow", {
                x: (clientX - innerWidth / 2) * 0.1,
                y: (clientY - innerHeight / 2) * 0.1,
                duration: 2,
                ease: "power1.out"
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        gsap.from(".login-stagger", {
            y: 30,
            opacity: 0,
            duration: 1.4,
            stagger: 0.15,
            ease: "expo.out",
            clearProps: "all"
        });

        // Magnetic login button
        const btn = document.querySelector(".magnetic-login-btn");
        if (btn) {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.6, ease: "power2.out" });
            });
            btn.addEventListener("mouseleave", () => {
                gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            });
        }

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, { scope: containerRef });

    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'teacher') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        }
    }, [user, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                await register(formData.name, formData.email, formData.password, formData.role);
            } else {
                await login(formData.email, formData.password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        },
        exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center px-4 py-20 bg-[#F8FAFC] selection:bg-primary/30 relative overflow-hidden font-sans">
            
            {/* Cinematic Spatial Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-radial-[at_50%_50%,_rgba(37,99,235,0.03)_0%,_transparent_60%]" />
                <div className="spatial-glow absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/5 rounded-full blur-[160px]" />
                <div className="spatial-glow absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[140px]" />
            </div>

            <div 
                ref={panelRef}
                className="max-w-[460px] w-full relative z-10 transition-transform duration-300 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Header */}
                <div className="text-center mb-10 login-stagger" style={{ transform: 'translateZ(50px)' }}>
                    <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] text-primary uppercase mb-6 border border-black/5">
                        <Shield size={12} />
                        <span>Security Gateway</span>
                    </div>
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4 text-black leading-[1.1]">
                        {isRegister ? 'Create Your Account.' : 'Welcome Back.'}
                    </h2>
                    <p className="text-black/40 text-[17px] font-medium tracking-tight">
                        {isRegister ? 'Join the future of spatial integrity.' : 'Enter your credentials to continue.'}
                    </p>
                </div>

                <div 
                    className="bg-white/40 backdrop-blur-[50px] border border-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] login-stagger relative overflow-hidden"
                    style={{ transform: 'translateZ(30px)' }}
                >
                    {/* Interior Shimmer */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                    <AnimatePresence mode="popLayout">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-red-600 text-sm font-bold overflow-hidden"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <AnimatePresence mode="popLayout">
                            {isRegister && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5 overflow-hidden"
                                >
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-1 mb-2 block">Full Name</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-primary transition-all duration-300">
                                            <User size={18} />
                                        </span>
                                        <input 
                                            className="w-full bg-black/5 border border-black/5 pl-11 py-4 rounded-2xl text-black placeholder:text-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                            type="text" 
                                            name="name" 
                                            placeholder="John Doe"
                                            onChange={handleChange}
                                            required={isRegister}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-1 mb-2 block">Email Address</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-primary transition-all duration-300">
                                    <Mail size={18} />
                                </span>
                                <input 
                                    className="w-full bg-black/5 border border-black/5 pl-11 py-4 rounded-2xl text-black placeholder:text-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                    type="email" 
                                    name="email" 
                                    placeholder="you@example.com"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-1 mb-2 block">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-primary transition-all duration-300">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    className="w-full bg-black/5 border border-black/5 pl-11 py-4 rounded-2xl text-black placeholder:text-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {isRegister && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden mt-1"
                                >
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-1 mb-2 block">I AM A</label>
                                    <div className="grid grid-cols-2 bg-black/5 p-1.5 rounded-2xl gap-2 border border-black/5">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, role: 'student'})}
                                            className={`py-3 rounded-xl text-[11px] font-black tracking-widest transition-all uppercase ${formData.role === 'student' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        >
                                            Candidate
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, role: 'teacher'})}
                                            className={`py-3 rounded-xl text-[11px] font-black tracking-widest transition-all uppercase ${formData.role === 'teacher' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
                                        >
                                            Proctor
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            className="magnetic-login-btn w-full py-5 mt-6 rounded-[1.75rem] bg-black text-white text-[13px] font-black tracking-[0.15em] uppercase shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            {isRegister ? 'Initialize Access' : 'Secure Entry'}
                            <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1.5 transition-transform" />
                        </button>
                    </form>
                </div>
                
                <div className="mt-10 text-center text-[11px] font-black tracking-widest uppercase login-stagger" style={{ transform: 'translateZ(20px)' }}>
                    <span className="text-black/30">{isRegister ? 'Already have credentials?' : "New to the platform?"}</span>
                    <button 
                        type="button"
                        onClick={() => navigate(isRegister ? '/login' : '/register')}
                        className="ml-2 text-black hover:text-primary transition-all underline decoration-black/10 underline-offset-8"
                    >
                        {isRegister ? 'Secure Login' : 'Create Identity'}
                    </button>
                </div>
            </div>
        </div>
    );

};

export default Login;
