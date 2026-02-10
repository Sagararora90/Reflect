import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';


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

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-20 bg-rf-canvas overflow-hidden selection:bg-rf-accent/10 rf-animate-bloom">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rf-accent/5 blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-[420px] w-full relative z-10">
                <div className="rf-card-glass p-8 md:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rf-glass rounded-xl flex items-center justify-center mx-auto mb-5 border-rf-border-glass text-rf-accent">
                            <Shield size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-rf-text-pure mb-1">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-sm text-rf-text-dim">
                            {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-rf-danger/10 border border-rf-danger/20 rounded-lg p-3.5 mb-6 text-rf-danger text-sm font-medium">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {isRegister && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-rf-text-muted ml-0.5">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rf-text-muted">
                                        <User size={16} />
                                    </span>
                                    <input 
                                        className="rf-input pl-10 h-11 !bg-rf-panel/40 !rounded-lg border-rf-border-glass focus:border-rf-accent/50"
                                        type="text" 
                                        name="name" 
                                        placeholder="John Doe"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-rf-text-muted ml-0.5">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rf-text-muted">
                                    <Mail size={16} />
                                </span>
                                <input 
                                    className="rf-input pl-10 h-11 !bg-rf-panel/40 !rounded-lg border-rf-border-glass focus:border-rf-accent/50"
                                    type="email" 
                                    name="email" 
                                    placeholder="you@example.com"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-rf-text-muted ml-0.5">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rf-text-muted">
                                    <Lock size={16} />
                                </span>
                                <input 
                                    className="rf-input pl-10 h-11 !bg-rf-panel/40 !rounded-lg border-rf-border-glass focus:border-rf-accent/50"
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {isRegister && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-rf-text-muted ml-0.5">I am a...</label>
                                <div className="flex bg-rf-canvas/50 p-1 rounded-lg gap-1 border border-rf-border-glass">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, role: 'student'})}
                                        className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all duration-300 ${formData.role === 'student' ? 'bg-rf-accent text-white shadow-lg' : 'text-rf-text-dim hover:text-rf-text-pure'}`}
                                    >
                                        Student
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, role: 'teacher'})}
                                        className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all duration-300 ${formData.role === 'teacher' ? 'bg-rf-accent text-white shadow-lg' : 'text-rf-text-dim hover:text-rf-text-pure'}`}
                                    >
                                        Teacher
                                    </button>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="rf-btn rf-btn-primary w-full py-3 mt-2 !rounded-lg group/btn"
                        >
                            <span className="flex items-center justify-center gap-2 font-semibold text-sm">
                                {isRegister ? 'Create Account' : 'Sign In'}
                                <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-rf-border-glass text-center text-sm">
                        <span className="text-rf-text-muted">{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
                        <button 
                            type="button"
                            onClick={() => navigate(isRegister ? '/login' : '/register')}
                            className="ml-1.5 text-rf-accent hover:text-rf-accent-light transition-all font-semibold"
                        >
                            {isRegister ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Login;
