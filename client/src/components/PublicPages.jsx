import React from 'react';
import { Shield, Zap, Globe, Database, ArrowRight, CheckCircle2, Star, Users, Sparkles, Terminal } from 'lucide-react';

const PageLayout = ({ title, subtitle, children, icon: Icon }) => (
    <div className="min-h-screen bg-rf-canvas pt-40 pb-24 px-8 relative overflow-hidden selection:bg-rf-accent/30 rf-animate-bloom">
        {/* Ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-rf-accent/5 blur-[150px] -z-10 opacity-30" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rf-accent/10 blur-[120px] -z-10 opacity-10" />
        
        <div className="max-w-7xl mx-auto text-center">
            {Icon && (
                <div className="inline-flex p-4 bg-rf-accent/10 border border-rf-border-accent rounded-2xl mb-10 shadow-rf-accent/20">
                    <Icon size={32} className="text-rf-accent-light" />
                </div>
            )}
            <h1 className="text-5xl md:text-8xl font-black text-rf-text-pure mb-8 tracking-tighter">
                <span className="rf-text-gradient">
                    {title}
                </span>
            </h1>
            <p className="text-rf-text-dim text-lg md:text-xl font-medium max-w-2xl mx-auto mb-20 leading-relaxed">
                {subtitle}
            </p>
            
            <div className="grid">
                {children}
            </div>
        </div>
    </div>
);

export const Product = () => (
    <PageLayout 
        title="Assessment Engine" 
        subtitle="The next-generation runtime for secure technical evaluation. Built for speed, security, and enterprise scale."
        icon={Zap}
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
             <div className="rf-card-glass group p-8 md:p-12 hover:border-rf-accent/40 transition-all duration-500">
                <div className="w-14 h-14 bg-rf-accent/10 border border-rf-border-accent rounded-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform text-rf-accent">
                    <Terminal size={28} />
                </div>
                <h3 className="text-3xl font-black text-rf-text-pure mb-6 tracking-tight uppercase tracking-widest leading-tight">Logic Workspace</h3>
                <p className="text-rf-text-dim leading-relaxed mb-10 font-medium text-lg">Support for 40+ languages including Python, Java, and C++. Optimized for low-latency compilation and deep test case validation.</p>
                <div className="flex gap-3">
                    {['v8', 'LLVM', 'Clang'].map(t => (
                        <span key={t} className="px-4 py-2 bg-rf-accent/5 border border-rf-border-glass rounded-xl text-[10px] font-black text-rf-text-muted uppercase tracking-widest">{t}</span>
                    ))}
                </div>
             </div>
             
             <div className="rf-card-glass group p-8 md:p-12 hover:border-rf-accent/40 transition-all duration-500">
                <div className="w-14 h-14 bg-rf-accent/10 border border-rf-border-accent rounded-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform text-rf-accent">
                    <Shield size={28} />
                </div>
                <h3 className="text-3xl font-black text-rf-text-pure mb-6 tracking-tight uppercase tracking-widest leading-tight">Watcher_v2</h3>
                <p className="text-rf-text-dim leading-relaxed mb-10 font-medium text-lg">Advanced biometric mapping, gaze estimation, and neural environment capture. Ensuring session integrity at the micro-level.</p>
                <div className="flex gap-3">
                    {['TensorFlow', 'MediaPipe', 'E2E'].map(t => (
                        <span key={t} className="px-4 py-2 bg-rf-accent/5 border border-rf-border-glass rounded-xl text-[10px] font-black text-rf-text-muted uppercase tracking-widest">{t}</span>
                    ))}
                </div>
             </div>
        </div>
    </PageLayout>
);

export const Security = () => (
    <PageLayout 
        title="Global Security" 
        subtitle="Our infrastructure is designed for the most demanding security requirements, with zero-trust architecture at its core."
        icon={Shield}
    >
         <div className="rf-card-glass !p-16 text-center relative overflow-hidden group border-rf-border-glass">
            <div className="absolute top-0 left-0 w-full h-1 bg-rf-accent shadow-rf-accent-glow" />
            <h2 className="text-4xl md:text-5xl font-black text-rf-text-pure mb-8 uppercase tracking-tight leading-tight">SOC2 Type II Foundation</h2>
            <p className="text-rf-text-dim text-xl mb-14 max-w-3xl mx-auto font-medium leading-relaxed">We adhere to the strictest data privacy and security standards. Every bit of session data is encrypted with AES-256 and transitioned via secure TLS channels.</p>
            
            <div className="flex flex-wrap gap-8 justify-center">
                {['GDPR_COMPLIANT', 'ISO_27001', 'SSL_E2E', 'AES_256'].map(cert => (
                    <div key={cert} className="flex items-center gap-4 rf-glass px-8 py-4 border-rf-border-glass hover:border-rf-accent/50 transition-all duration-500 shadow-lg">
                        <CheckCircle2 size={20} className="text-rf-success" />
                        <span className="text-[11px] font-black text-rf-text-pure uppercase tracking-[0.3em]">{cert}</span>
                    </div>
                ))}
            </div>
         </div>
    </PageLayout>
);

export const Pricing = () => (
    <PageLayout 
        title="Session Credits" 
        subtitle="Transparent pricing designed for organizations scaling their technical hiring pipelines."
        icon={Zap}
    >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { name: 'Starter', price: '0', icon: Database, featured: false },
                { name: 'Growth', price: '49', icon: Sparkles, featured: true },
                { name: 'Enterprise', price: 'Custom', icon: Globe, featured: false }
            ].map((plan) => (
                <div 
                    key={plan.name} 
                    className={`rf-card-glass !p-12 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 border-rf-border-glass ${plan.featured ? '!border-rf-accent/40 bg-rf-accent/5 shadow-rf-accent/10' : ''}`}
                >
                    <div className={`p-5 rounded-3xl mb-10 border transition-all duration-500 ${plan.featured ? 'bg-rf-accent border-rf-accent shadow-rf-accent text-white' : 'rf-glass border-rf-border-glass text-rf-accent group-hover:bg-rf-accent group-hover:text-white group-hover:shadow-rf-accent'}`}>
                        <plan.icon size={28} />
                    </div>
                    <h3 className="text-3xl font-black text-rf-text-pure mb-3 uppercase tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-12">
                        <span className="text-5xl font-black text-rf-text-pure tracking-tighter leading-none">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-[11px] font-black text-rf-text-muted uppercase tracking-[0.2em] ml-2">/ Node</span>}
                    </div>
                    
                    <ul className="space-y-5 mb-14 text-left w-full">
                        {[
                            'Up to 100 Candidates',
                            'Biometric Watcher',
                            'Neural Runtime capture',
                            'E2E Security Handshake'
                        ].map(feature => (
                            <li key={feature} className="flex items-center gap-4 text-sm font-bold text-rf-text-dim group-hover:text-rf-text-silver transition-colors">
                                <CheckCircle2 size={16} className="text-rf-success shrink-0" />
                                <span className="uppercase tracking-widest">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button className={`rf-btn w-full py-5 !rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${plan.featured ? 'rf-btn-primary shadow-rf-btn-primary' : 'rf-btn-secondary'}`}>
                        Initialize {plan.name} <ArrowRight size={18} />
                    </button>
                </div>
            ))}
        </div>
    </PageLayout>
);

export const Enterprise = () => (
    <PageLayout 
        title="Neural_Grid" 
        subtitle="For large-scale universities and global corporations requiring custom logic and deep LMS integration."
        icon={Globe}
    >
         <div className="rf-card-glass !p-16 flex flex-col lg:grid lg:grid-cols-2 items-center justify-between gap-16 relative overflow-hidden border-rf-border-glass">
            <div className="absolute top-0 right-0 w-full h-full bg-rf-accent/5 blur-[150px] -z-10" />
            
            <div className="text-left">
                <h2 className="text-5xl font-black text-rf-text-pure mb-8 uppercase tracking-tight leading-none">LMS Deep_Sync</h2>
                <p className="text-rf-text-dim text-xl leading-relaxed mb-10 font-medium">We integrate directly with your learning ecosystem (Canvas, Blackboard, Moodle) to provide zero-friction automated deployments.</p>
                <div className="flex flex-wrap gap-4">
                    {['CANVAS', 'MOODLE', 'OKTA', 'AZURE'].map(l => (
                        <div key={l} className="px-5 py-2.5 rf-glass border-rf-border-glass text-[11px] font-black text-rf-text-muted uppercase tracking-[0.2em]">{l}</div>
                    ))}
                </div>
            </div>
            
            <div className="w-full flex justify-center lg:justify-end">
                <button className="rf-btn rf-btn-primary px-16 py-6 !rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-rf-btn-primary group">
                    Architect Solution <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform ml-4" />
                </button>
            </div>
         </div>
    </PageLayout>
);
