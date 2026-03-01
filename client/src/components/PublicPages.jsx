import React from 'react';
import { Shield, Zap, Globe, Database, ArrowRight, CheckCircle2, Star, Users, Sparkles, Terminal } from 'lucide-react';

const PageLayout = ({ title, subtitle, children, icon: Icon }) => (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 sm:px-8 selection:bg-primary/20">
        <div className="max-w-7xl mx-auto text-center">
            {Icon && (
                <div className="inline-flex p-3 bg-white border border-border rounded-xl mb-8 shadow-sm">
                    <Icon size={28} className="text-primary" />
                </div>
            )}
            <h1 className="heading-1 md:text-5xl lg:text-7xl mb-6">
                {title}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-16 leading-relaxed">
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
             <div className="card p-8 md:p-12 hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8 text-primary">
                    <Terminal size={24} />
                </div>
                <h3 className="heading-3 mb-4">Logic Workspace</h3>
                <p className="text-text-secondary leading-relaxed mb-8">Support for 40+ languages including Python, Java, and C++. Optimized for low-latency compilation and deep test case validation.</p>
                <div className="flex gap-2 flex-wrap">
                    {['v8', 'LLVM', 'Clang'].map(t => (
                        <span key={t} className="badge badge-neutral">{t}</span>
                    ))}
                </div>
             </div>
             
             <div className="card p-8 md:p-12 hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8 text-primary">
                    <Shield size={24} />
                </div>
                <h3 className="heading-3 mb-4">Watcher_v2</h3>
                <p className="text-text-secondary leading-relaxed mb-8">Advanced biometric mapping, gaze estimation, and neural environment capture. Ensuring session integrity at the micro-level.</p>
                <div className="flex gap-2 flex-wrap">
                    {['TensorFlow', 'MediaPipe', 'E2E'].map(t => (
                        <span key={t} className="badge badge-neutral">{t}</span>
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
         <div className="card !p-12 md:!p-16 text-center border-t-4 border-t-primary">
            <h2 className="heading-2 mb-6">SOC2 Type II Foundation</h2>
            <p className="text-text-secondary text-lg mb-12 max-w-3xl mx-auto leading-relaxed">We adhere to the strictest data privacy and security standards. Every bit of session data is encrypted with AES-256 and transitioned via secure TLS channels.</p>
            
            <div className="flex flex-wrap gap-4 justify-center">
                {['GDPR COMPLIANT', 'ISO 27001', 'SSL E2E', 'AES 256'].map(cert => (
                    <div key={cert} className="flex items-center gap-3 bg-panel px-6 py-3 rounded-lg border border-border">
                        <CheckCircle2 size={18} className="text-status-success" />
                        <span className="text-sm font-semibold text-text-primary tracking-wide">{cert}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
                { name: 'Starter', price: '0', icon: Database, featured: false },
                { name: 'Growth', price: '49', icon: Sparkles, featured: true },
                { name: 'Enterprise', price: 'Custom', icon: Globe, featured: false }
            ].map((plan) => (
                <div 
                    key={plan.name} 
                    className={`card !p-10 flex flex-col items-center text-center transition-all ${plan.featured ? 'border-primary ring-1 ring-primary shadow-md' : 'hover:border-primary/50'}`}
                >
                    <div className={`p-4 rounded-xl mb-8 ${plan.featured ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                        <plan.icon size={24} />
                    </div>
                    <h3 className="heading-3 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-text-primary">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-sm font-semibold text-text-secondary">/ user / mo</span>}
                    </div>
                    
                    <ul className="space-y-4 mb-10 text-left w-full border-t border-border pt-8">
                        {[
                            'Up to 100 Candidates',
                            'Biometric Watcher',
                            'Neural Runtime capture',
                            'E2E Security Handshake'
                        ].map(feature => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                                <CheckCircle2 size={16} className="text-primary shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button className={`btn w-full mt-auto ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}>
                        Choose {plan.name}
                    </button>
                </div>
            ))}
        </div>
    </PageLayout>
);

export const Enterprise = () => (
    <PageLayout 
        title="Enterprise Connect" 
        subtitle="For large-scale universities and global corporations requiring custom logic and deep LMS integration."
        icon={Globe}
    >
         <div className="card !p-12 md:!p-16 flex flex-col lg:grid lg:grid-cols-2 items-center justify-between gap-12 bg-surface border-border">
            
            <div className="text-left">
                <h2 className="heading-2 mb-4">LMS Deep Sync</h2>
                <p className="text-text-secondary text-lg leading-relaxed mb-8">We integrate directly with your learning ecosystem (Canvas, Blackboard, Moodle) to provide zero-friction automated deployments.</p>
                <div className="flex flex-wrap gap-3">
                    {['CANVAS', 'MOODLE', 'OKTA', 'AZURE'].map(l => (
                        <div key={l} className="badge badge-neutral">{l}</div>
                    ))}
                </div>
            </div>
            
            <div className="w-full flex justify-center lg:justify-end">
                <button className="btn btn-primary px-10 py-4 shadow-sm text-base group">
                    Architect Solution <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
         </div>
    </PageLayout>
);
