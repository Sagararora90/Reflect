import React, { useRef, useState } from 'react';
import { Lock, Cpu, Code, Eye, Shield, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FeatureAppleCard, BentoShowcase } from './FeatureComponents';

gsap.registerPlugin(ScrollTrigger);

const FeaturesPage = () => {
    const mainRef = useRef(null);
    const [bentoScroll, setBentoScroll] = useState(0);

    useGSAP(() => {
        // PIN AND SCRUB BENTO WIDGETS
        const bentoTrigger = ScrollTrigger.create({
            trigger: ".bento-pin-container",
            start: "top 150px",
            end: "+=120%", 
            pin: true,
            scrub: 1,
            onUpdate: (self) => setBentoScroll(self.progress)
        });

        // BENTO WIDGETS ENTRANCE
        gsap.from(".bento-widget-container", {
            y: 80,
            scale: 0.95,
            opacity: 0,
            filter: "blur(40px)",
            duration: 3,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".bento-pin-container",
                start: "top 105%",
            },
            clearProps: "all"
        });

        // FEATURE CARD REVEALS
        const cards = gsap.utils.toArray(".feature-card");
        cards.forEach((card, i) => {
            gsap.from(card, {
                y: 100,
                opacity: 0,
                filter: "blur(20px)",
                duration: 1.2,
                delay: i * 0.15,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                },
                clearProps: "all"
            });
        });

        return () => {
            bentoTrigger.kill();
        };
    }, { scope: mainRef });

    return (
        <div ref={mainRef} className="bg-white min-h-screen pt-40 pb-24 overflow-hidden selection:bg-primary/30 font-sans text-black">
            <div className="max-w-7xl mx-auto px-8">
                <div className="mb-24 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-3xl border border-black/10 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-8"
                    >
                        <span>Core Capabilities</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.8]"
                    >
                        Security that <br /> feels like magic.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-black/50 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Every component is engineered for focus and transparency, providing a seamless experience for both students and proctors.
                    </motion.p>
                </div>

                {/* BENTO EXPERIENCE */}
                <div className="bento-pin-container relative w-full h-[85vh] flex items-center overflow-hidden mb-32">
                    <div className="w-full bento-widget-container text-white">
                        <BentoShowcase scrollProgress={bentoScroll} />
                    </div>
                </div>

                {/* FEATURE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-24">
                    <FeatureAppleCard 
                        icon={<Cpu />}
                        title="Neural Core"
                        desc="Advanced machine learning models that monitor session integrity in real-time, right on your hardware."
                    />
                    <FeatureAppleCard 
                        icon={<Code />}
                        title="Hybrid Logic"
                        desc="A powerful execution environment supporting 40+ languages with sub-millisecond latency."
                    />
                    <FeatureAppleCard 
                        icon={<Eye />}
                        title="Biometric Sync"
                        desc="Multi-layer gaze tracking and presence verification that respects student privacy while ensuring trust."
                    />
                    <FeatureAppleCard 
                        icon={<Lock />}
                        title="Total Shield"
                        desc="Locks down your environment completely. No screen recording, no distractions, just you."
                    />
                    <FeatureAppleCard 
                        icon={<Zap />}
                        title="Super-Low Latency"
                        desc="Engineered for performance. Experience smooth interactions and instant feedback."
                    />
                    <FeatureAppleCard 
                        icon={<Shield />}
                        title="Privacy First"
                        desc="Your data is your business. We prioritize end-to-end encryption and user-centered privacy models."
                    />
                </div>
            </div>
        </div>
    );
};

export default FeaturesPage;
