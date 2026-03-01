import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Database, Sparkles, Globe, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingPage = () => {
    const navigate = useNavigate();

    const plans = [
        { 
            name: 'Starter', 
            price: '0', 
            icon: <Database className="text-gray-400" />, 
            featured: false,
            desc: 'For individual students and trial sessions.',
            features: ['Up to 10 Users', 'Basic Monitoring', 'Standard Runtime', 'Email Support']
        },
        { 
            name: 'Growth', 
            price: '49', 
            icon: <Sparkles className="text-primary" />, 
            featured: true,
            desc: 'Perfect for growing teams and small institutions.',
            features: ['Unlimited Candidates', 'Biometric Watcher', 'Neural Runtime Capture', 'Priority Support']
        },
        { 
            name: 'Enterprise', 
            price: 'Custom', 
            icon: <Globe className="text-purple-400" />, 
            featured: false,
            desc: 'Custom solutions for large-scale deployments.',
            features: ['LMS Deep Sync', 'Custom Security Protocol', 'Dedicated Infrastructure', '24/7 Phone Support']
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-40 pb-24 selection:bg-primary/30 font-sans text-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="mb-24 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-3xl border border-black/10 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-8"
                    >
                        <span>Simple Transparency</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.8]"
                    >
                        Scalable value.<br /> No hidden costs.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-black/50 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Choose the plan that fits your institutional scale. Every Tier includes our core security handshake.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {plans.map((plan, i) => (
                        <motion.div 
                            key={plan.name}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`relative p-12 rounded-[3.5rem] bg-white border border-black/5 hover:border-black/10 transition-all flex flex-col h-full shadow-2xl ${plan.featured ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-xl border border-black/5">
                                {plan.icon}
                            </div>
                            <h3 className="text-3xl font-black tracking-tight mb-2">{plan.name}</h3>
                            <p className="text-black/40 text-sm font-medium mb-8 leading-relaxed">{plan.desc}</p>
                            
                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-5xl font-black tracking-tighter">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                                {plan.price !== 'Custom' && <span className="text-lg font-bold text-black/30">/mo</span>}
                            </div>

                            <ul className="space-y-5 mb-12 flex-grow">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-center gap-3 text-[15px] font-bold text-black/60">
                                        <CheckCircle2 size={18} className="text-primary" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                className={`w-full py-6 rounded-[1.75rem] text-lg font-black transition-all active:scale-95 ${plan.featured ? 'bg-primary text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(37,99,235,0.5)]' : 'bg-black text-white hover:bg-black/90'}`}
                                onClick={() => navigate('/register')}
                            >
                                {plan.price === 'Custom' ? 'Contact Sales' : `Start with ${plan.name}`}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Final CTA Strip */}
                <div className="relative p-12 sm:p-20 rounded-[4.5rem] bg-black text-white overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] rounded-full -mr-20 -mt-20" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                        <div>
                            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
                                Ready to join<br /> the future?
                            </h2>
                            <p className="text-lg text-white/50 max-w-xl font-medium leading-relaxed">
                                Join thousands of students and institutions moving to a smarter, safer way to test.
                            </p>
                        </div>
                        <button 
                            className="bg-white text-black px-12 py-6 rounded-[2rem] text-xl font-black shadow-2xl hover:bg-white/90 transition-all flex items-center gap-4 shrink-0 active:scale-95"
                            onClick={() => navigate('/register')}
                        >
                            Get Started Now
                            <ArrowRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
