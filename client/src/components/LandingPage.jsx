import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Cpu, Code, Lock, Globe, ArrowRight, Clock } from 'lucide-react';


const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="rf-animate-bloom selection:bg-rf-accent/10 bg-rf-canvas">
            
            {/* HERO SECTION */}
            <section className="relative flex flex-col items-center text-center pt-48 pb-16 px-8 overflow-hidden">
                {/* Background Glows (Dark Mode) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-rf-accent/10 blur-[150px] pointer-events-none -z-10" />
                <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-rf-accent/20 blur-[120px] rounded-full pointer-events-none -z-10 opacity-40" />
                
                <div className="inline-flex items-center gap-2 bg-rf-accent/10 border border-rf-accent/20 px-4 py-1.5 rounded-full text-[11px] font-bold text-rf-accent-light mb-10 animate-pulse">
                    <Zap size={14} />
                    <span>AI Assessment Logic v4.0 is live</span>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tight mb-8 text-rf-text-pure">
                    Think better with <br />
                    <span className="rf-text-gradient">Reflect Platform</span>
                </h1>

                <p className="text-xl text-rf-text-dim max-w-2xl mb-12 leading-relaxed font-medium">
                    The professional standard for high-stakes online examinations. 
                    Monitor, analyze, and scale with absolute integrity and clarity.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-5">
                    <button 
                        className="rf-btn rf-btn-primary px-10 py-4 text-base shadow-rf-btn-primary" 
                        onClick={() => navigate('/login')}
                    >
                        Get Started for Free <ArrowRight size={20} className="ml-2" />
                    </button>
                    <button 
                        className="rf-btn rf-btn-secondary px-10 py-4 text-base font-bold bg-rf-surface/40 backdrop-blur-md"
                        onClick={() => navigate('/enterprise')}
                    >
                        Book a Demo
                    </button>
                </div>

                {/* THE PORTAL VISUAL - REDESIGNED FOR DARK MODE */}
                <div className="w-full max-w-6xl mt-28 relative z-10 group px-4">
                    <div className="absolute -inset-4 bg-rf-accent/20 blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000" />
                    <div className="rf-card-glass p-6 md:p-10 shadow-3xl group-hover:shadow-rf-accent/5 transition-all duration-700">
                        {/* Control Buttons */}
                        <div className="flex items-center gap-2 mb-10 ml-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Dark Grid */}
                            <div className="col-span-2 rf-card-glass !bg-rf-panel/20 p-8 flex flex-col gap-8 group/calendar hover:border-rf-accent/40 transition-all duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rf-accent/10 rounded-xl text-rf-accent border border-rf-accent/20">
                                            <Clock size={22} />
                                        </div>
                                        <span className="text-rf-text-pure text-xl font-bold">Session Grid</span>
                                    </div>
                                    <span className="text-[11px] text-rf-text-muted font-black tracking-widest uppercase">OCT 2026</span>
                                </div>
                                <div className="grid grid-cols-7 gap-3 text-center text-xs text-rf-text-dim font-bold">
                                    {['M','T','W','T','F','S','S'].map(d=><span key={d} className="opacity-40">{d}</span>)}
                                    {Array.from({ length: 31 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-300 border border-transparent ${
                                                i === 14 
                                                ? 'bg-rf-accent text-white shadow-rf-accent-glow font-black border-rf-accent/50 scale-105' 
                                                : 'hover:bg-rf-panel/50 hover:text-rf-text-pure cursor-pointer'
                                            }`}
                                        >
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Sidebar */}
                            <div className="flex flex-col gap-6">
                                <div className="rf-card-glass !bg-rf-panel/20 p-8 flex flex-col justify-between flex-1 group/time hover:border-rf-accent/40 transition-all duration-500">
                                    <div>
                                        <span className="text-[10px] text-rf-text-muted uppercase tracking-[0.2em] font-black">Next Influx</span>
                                        <div className="text-5xl font-black text-rf-text-pure mt-4 group-hover/time:text-rf-accent transition-colors duration-300">
                                            14:00
                                        </div>
                                        <div className="text-xs text-rf-text-dim mt-3 font-semibold">UTC+05:30 Standard Time</div>
                                    </div>
                                    
                                    <div className="space-y-4 pt-8">
                                        <div className="flex items-center justify-between text-[10px] font-black">
                                            <span className="text-rf-text-muted uppercase tracking-widest">Integrity Level</span>
                                            <span className="text-rf-success">V.SECURED</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-rf-canvas rounded-full overflow-hidden">
                                            <div className="h-full bg-rf-accent w-3/4 shadow-glow" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* FEATURES GRID */}
            <section id="features" className="rf-section">
                <div className="flex flex-col items-center mb-20 text-center">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-rf-text-pure">Built for Scale</h2>
                    <p className="text-xl text-rf-text-dim max-w-2xl font-medium leading-relaxed">Everything you need to automate your high-stakes assessment workflow.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Cpu size={26} />} 
                        title="Vision AI" 
                        desc="Advanced face detection and gaze tracking to maintain extreme integrity."
                    />
                    <FeatureCard 
                        icon={<Code size={26} />} 
                        title="Neural Sandbox" 
                        desc="Locked-down runtime for 40+ languages with deep I/O validation."
                    />
                    <FeatureCard 
                        icon={<Globe size={26} />} 
                        title="Cloud Lockdown" 
                        desc="Prevents tab switching, copy-pasting, and external tool usage instantly."
                    />
                </div>
            </section>


            {/* HOW IT WORKS */}
            <section className="bg-rf-panel/20 relative py-32 px-8 overflow-hidden border-y border-rf-border-glass">
                {/* Background Grid & Glows */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rf-accent/5 blur-[160px] rounded-full pointer-events-none" />

                <div className="max-w-[1200px] mx-auto relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-24 text-center text-rf-text-pure">
                        Optimized <span className="rf-text-gradient">Workflow</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-px bg-rf-border-accent" />
                        
                        <StepItem 
                            number="01" 
                            title="Deploy" 
                            desc="Design assessments with AI-generated questions and robust test cases." 
                        />
                        <StepItem 
                            number="02" 
                            title="Enforce" 
                            desc="Real-time vision feeds with automated anomaly flags and alerts." 
                        />
                        <StepItem 
                            number="03" 
                            title="Certify" 
                            desc="Detailed integrity reports and skill-gap analysis delivered instantly." 
                        />
                    </div>
                </div>
            </section>


            {/* TRUST / SECURITY */}
            <section id="security" className="rf-section">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-20 items-center">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-rf-text-pure text-left leading-[1.05]">Zero-trust <br/> protocol</h2>
                        <p className="text-xl text-rf-text-dim mb-12 leading-relaxed font-medium">
                            The platform is architected with a security-first mindset. Every interaction is verified and encrypted at rest and in transit.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="rf-card-glass p-10 hover:-translate-y-1 transition-all duration-300">
                                <Lock size={24} className="text-rf-accent mb-6" />
                                <h4 className="text-rf-text-pure font-bold text-xl mb-3 tracking-tight">Compliance</h4>
                                <p className="text-base text-rf-text-dim font-medium leading-relaxed">SOC2 Type II & GDPR Ready</p>
                            </div>
                            <div className="rf-card-glass p-10 hover:-translate-y-1 transition-all duration-300">
                                <Shield size={24} className="text-rf-accent mb-6" />
                                <h4 className="text-rf-text-pure font-bold text-xl mb-3 tracking-tight">Data Privacy</h4>
                                <p className="text-base text-rf-text-dim font-medium leading-relaxed">Military-grade encryption</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center opacity-[0.05] grayscale pointer-events-none">
                        <Shield size={440} className="text-rf-text-pure fill-rf-text-pure" />
                    </div>
                </div>
            </section>


            {/* FINAL CTA */}
            <section className="rf-section pb-32">
                <div className="rf-card-glass relative overflow-hidden text-center py-28 px-10 shadow-3xl">
                    {/* Background Bloom */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-rf-accent/5 blur-[120px] -z-10" />
                    
                    <h2 className="text-5xl md:text-8xl font-black mb-8 text-rf-text-pure tracking-tight leading-tight">Ready to scale <br/> with integrity?</h2>
                    <p className="text-xl text-rf-text-dim max-w-2xl mx-auto mb-14 font-medium leading-relaxed">Join leading enterprises using Reflect to protect their testing integrity and scale with confidence.</p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button 
                            className="rf-btn rf-btn-primary px-12 py-4.5 text-lg shadow-rf-btn-primary" 
                            onClick={() => navigate('/login')}
                        >
                            Initialize Setup <ArrowRight size={22} className="ml-2" />
                        </button>
                        <button 
                            className="rf-btn rf-btn-secondary px-10 py-4.5 text-lg font-bold bg-rf-surface/20"
                            onClick={() => navigate('/security')}
                        >
                            Contact Security
                        </button>
                    </div>
                </div>
            </section>


            {/* FOOTER */}
            <footer className="bg-rf-surface border-t border-rf-border-glass pt-32 pb-16 px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rf-accent/20 to-transparent" />
                
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] gap-20 mb-28">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-2.5 bg-rf-accent rounded-xl shadow-rf-accent">
                                <Shield size={28} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-rf-text-pure">Reflect</span>
                        </div>
                        <p className="text-rf-text-dim max-w-xs leading-relaxed font-medium">
                            The professional assessment standard for modern, security-conscious organizations.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-rf-text-pure font-black mb-8 text-[10px] uppercase tracking-[0.2em]">Platform</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Vision AI</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Neural Sandbox</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Enterprise API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-rf-text-pure font-black mb-8 text-[10px] uppercase tracking-[0.2em]">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Security Docs</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Privacy Policy</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Terms of Use</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-rf-text-pure font-black mb-8 text-[10px] uppercase tracking-[0.2em]">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Help Center</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">API Status</a></li>
                            <li><a href="#" className="text-rf-text-dim hover:text-rf-accent transition-all font-medium text-sm">Chat with Sales</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto border-t border-rf-border-glass pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-xs text-rf-text-muted font-medium">
                    <span>&copy; 2026 Reflect International. All rights reserved.</span>
                    <div className="flex items-center gap-10">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rf-success shadow-success" />
                            System Operational
                        </span>
                        <span className="opacity-40 font-mono">V3.4.0_V0ID</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="group flex flex-col gap-6 p-8 rounded-2xl rf-glass transition-all duration-300 hover:border-rf-accent/40 hover:-translate-y-2 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none">
            {React.cloneElement(icon, { size: 160 })}
        </div>
        <div className="w-14 h-14 rounded-xl bg-rf-panel/60 flex items-center justify-center text-rf-accent group-hover:bg-rf-accent group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-rf-accent">
            {icon}
        </div>
        <div className="relative z-10">
            <h3 className="text-rf-text-pure font-bold text-2xl mb-3 tracking-tight leading-tight">{title}</h3>
            <p className="text-rf-text-dim text-base font-medium leading-relaxed group-hover:text-rf-text-silver transition-colors duration-300">{desc}</p>
        </div>
    </div>
);

const StepItem = ({ number, title, desc }) => (
    <div className="flex flex-col items-center text-center gap-6 group relative z-10">
        <div className="w-24 h-24 rounded-full rf-glass flex items-center justify-center relative transition-all duration-300 group-hover:scale-110 group-hover:border-rf-accent/40 shadow-2xl">
            <div className="absolute inset-2 rounded-full border border-rf-accent/20 border-dashed animate-[spin_20s_linear_infinite] opacity-40" />
            <span className="font-black text-2xl text-rf-text-pure group-hover:text-rf-accent transition-all duration-300">
                {number}
            </span>
        </div>
        <div>
            <h3 className="text-rf-text-pure font-bold text-2xl mb-3 tracking-tight leading-tight">{title}</h3>
            <p className="text-rf-text-dim text-sm font-medium leading-relaxed max-w-xs mx-auto group-hover:text-rf-text-silver transition-colors duration-300">{desc}</p>
        </div>
    </div>
);

export default LandingPage;

