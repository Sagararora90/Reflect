import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Shield, Cpu, Code, Eye, Lock, RefreshCw } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Icosahedron, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FeatureAppleCard, BentoShowcase } from './FeatureComponents';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const SpatialCore = ({ scrollRef }) => {
    const meshRef = useRef();
    const wireRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const scrollProgress = scrollRef.current || 0;
        
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.2 + scrollProgress * 5;
            meshRef.current.rotation.x = t * 0.1 + scrollProgress * 2;
            meshRef.current.scale.setScalar(1 + scrollProgress * 0.5);
        }
        if (wireRef.current) {
            wireRef.current.rotation.y = -t * 0.15 - scrollProgress * 3;
            wireRef.current.scale.setScalar(1.2 + scrollProgress * 0.8);
        }

        // Handle opacity directly via material
        const fadeStart = 0.7;
        const opacity = Math.max(0, 1 - Math.max(0, (scrollProgress - fadeStart) / (1 - fadeStart)));
        if (meshRef.current.material) meshRef.current.material.opacity = 0.8 * opacity;
        if (wireRef.current.material) wireRef.current.material.opacity = (0.1 + scrollProgress * 0.2) * opacity;
    });

    return (
        <group>
            <Icosahedron ref={meshRef} args={[1, 15]}>
                <MeshDistortMaterial 
                    color="#2563eb" 
                    speed={2} 
                    distort={0.4} 
                    radius={1} 
                    emissive="#89a3f7ff"
                    emissiveIntensity={0.5}
                    transparent 
                    opacity={0.8}
                />
            </Icosahedron>
            <Icosahedron ref={wireRef} args={[1, 2]}>
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
            </Icosahedron>
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#a2c5f1ff" />
            <ambientLight intensity={0.5} />
        </group>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const heroTitleRef = useRef(null);
    const heroSectionRef = useRef(null);

    const scrollRef = useRef(0);
    
    useGSAP(() => {
        // PIN THE HERO SECTION
        ScrollTrigger.create({
            trigger: heroSectionRef.current,
            start: "top top",
            end: "+=100%", // Faster exit from hero
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                scrollRef.current = self.progress;
            }
        });

        // SCALE THE HERO TITLE ON SCROLL
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroSectionRef.current,
                start: "top top",
                end: "70% top",
                scrub: 1.5,
            }
        });

        tl.to(heroTitleRef.current, {
            scale: 0.9,
            opacity: 0,
            y: -100,
            filter: "blur(20px)",
            duration: 1
        });

        // MOUSE MOVE MAGNETIC PARALLAX
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 60;
            const yPos = (clientY / window.innerHeight - 0.5) * 60;
            gsap.to(".ambient-orb", { x: xPos, y: yPos, duration: 2.5, ease: "power2.out" });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, { scope: mainRef });

    const [bentoScroll, setBentoScroll] = useState(0);

    useGSAP(() => {
        // PIN AND SCRUB BENTO WIDGETS
        const bentoTrigger = ScrollTrigger.create({
            trigger: ".bento-pin-container",
            start: "center 55%", // Drops the pinning position slightly below center viewport
            end: "+=120%", 
            pin: true,
            scrub: 1,
            onUpdate: (self) => setBentoScroll(self.progress)
        });

        // LEFT BENTO (Calendar) ENTRANCE
        gsap.from(".bento-left", {
            x: "-60vw", 
            rotationY: -45,
            scale: 0.8,
            opacity: 0,
            filter: "blur(60px)",
            scrollTrigger: {
                trigger: ".bento-pin-container",
                start: "top 120%", 
                end: "center 55%", // Must match pin start exactly
                scrub: 2, 
            }
        });

        // RIGHT BENTO (Phone) ENTRANCE
        gsap.from(".bento-right", {
            x: "60vw", 
            rotationY: 45,
            scale: 0.8,
            opacity: 0,
            filter: "blur(60px)",
            scrollTrigger: {
                trigger: ".bento-pin-container",
                start: "top 120%", 
                end: "center 55%", 
                scrub: 2, 
            }
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
        <div ref={mainRef} className="bg-white selection:bg-primary/30 overflow-hidden font-sans text-white">
            
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="ambient-orb absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/5 rounded-full blur-[160px]" />
                <div className="ambient-orb absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[140px]" />
            </div>

            {/* HERO SECTION */}
            <section id="home" ref={heroSectionRef} className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
                {/* Spatial Core (Three.js) */}
                <div className="absolute inset-0 z-0">
                    <Canvas>
                        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                        <SpatialCore scrollRef={scrollRef} />
                    </Canvas>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#dcd8e1] to-[#dcd8e1]/0 pointer-events-none" />
                </div>

                <div ref={heroTitleRef} className="relative z-10 w-full max-w-5xl">
                    <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-3xl border border-black/10 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-10 shadow-2xl">
                        <Activity size={14} className="animate-pulse" />
                        <span>System Integrity: Active</span>
                    </div>

                    <h6 
                        className="text-[26px] leading-[38px] md:text-[4rem] md:leading-[1] lg:text-[8rem] lg:leading-[0.8] font-black drop-shadow-[0_0_30px_rgba(37,99,235,0.2)] tracking-tighter mb-10 text-black"
                        style={{
                            fontFamily: '"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: 'rgb(29, 29, 31)',
                        }}
                    >
                        Smart.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60">
                            Secure.
                        </span>
                    </h6>

                    <p 
                        className="max-w-xl mx-auto mb-14 tracking-tight"
                        style={{
                            fontFamily: '"SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: 'rgb(29, 29, 31)',
                            fontSize: '26px',
                            lineHeight: '38px'
                        }}
                    >
                        The world's most advanced spatial exam environment. Built for focus, engineered for trust.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <button 
                            className="font-semibold bg-black/5 backdrop-blur-2xl text-black border border-black/10 px-10 py-2 rounded-[1.75rem] text-lg tracking-tight shadow-[0_20px_50px_rgba(37,99,235,0.1)] hover:shadow-[0_30px_70px_#646464] active:scale-95 transition-all flex items-center gap-2" 
                            onClick={() => navigate('/login')}
                        >
                            Get Started
                            <ArrowRight size={20} className="stroke-[3px]" />
                        </button>
                        <button 
                            className="bg-black backdrop-blur-2xl text-white border border-black/10 px-10 py-2 rounded-[1.75rem] text-lg tracking-tight transition-all active:scale-95"
                            onClick={() => navigate('/features')}
                        >
                            Learn More
                        </button>
                    </div>

                </div>

                <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-30">
                    <div className="w-1 h-1 rounded-full bg-white animate-bounce" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white">Scroll down</span>
                </div>
            </section>

            {/* FEATURES SECTION (RESTORED) */}
            <section id="features" className="features-section relative py-32 bg-[#646668] text-white z-20 rounded-t-[5rem] border-t border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-16 max-w-3xl text-center mx-auto">
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
                            Security <br className="hidden sm:block" /> that feels like magic.
                        </h2>
                        <p className="text-xl text-white/40 font-medium leading-relaxed max-w-xl mx-auto">
                            We use spatial AI to protect your hard work. Simple, powerful, and private.
                        </p>
                    </div>

                    <div className="bento-pin-container relative w-full h-screen flex items-center justify-center">
                        <div className="max-w-7xl mx-auto px-8 w-full bento-widget-container">
                            <BentoShowcase scrollProgress={bentoScroll} />
                        </div>
                    </div>

                    <div className="feature-cards-grid grid grid-cols-1 md:grid-cols-3 gap-10 relative z-30 pb-24 max-w-7xl mx-auto w-full px-8">
                        <FeatureAppleCard 
                            icon={<Cpu />}
                            title="Neural Core"
                            desc="Advanced machine learning models that monitor session integrity in real-time."
                        />
                        <FeatureAppleCard 
                            icon={<Code />}
                            title="Hybrid Logic"
                            desc="A highly responsive environment supporting 40+ execution layers natively."
                        />
                        <FeatureAppleCard 
                            icon={<Eye />}
                            title="Biometric Sync"
                            desc="Seamless presence verification and multi-layer structural gaze tracking."
                        />
                    </div>
                </div>
            </section>

            {/* CTA/PRICING SECTION (RESTORED) */}
            <section id="pricing" className="py-48 bg-gradient-to-t from-black to-black/0 text-white z-30 relative  -mt-10">
                <div className="max-w-7xl mx-auto px-10 text-center">
                    {/* <div className="inline-flex p-6 bg-primary/10 rounded-[2.5rem] text-primary mb-12">
                        <RefreshCw size={48} strokeWidth={2.5} className="animate-spin-slow" />
                    </div> */}
                    <h2 className="text-[3.5rem] sm:text-[5rem] font-black tracking-tighter mb-10 leading-[1] text-white">
                        Ready to join<br /> the future?
                    </h2>
                    <p className="text-xl text-white/50 max-w-xl mx-auto mb-16 font-medium leading-relaxed">
                        Join thousands of students and institutions moving to a smarter, safer way to test.
                    </p>
                    <button 
                        className="font-semibold bg-white text-black px-12 py-2 rounded-[1.75rem] font-black shadow-2xl hover:bg-black/90 hover:text-white transition-all flex items-center gap-4 mx-auto"
                        onClick={() => navigate('/pricing')}
                    >
                        Sign Up Now
                        <ArrowRight size={28} strokeWidth={2} />
                    </button>
                </div>
            </section>

            {/* Footer Placeholder */}
            <footer className="py-6 bg-white border-t border-border flex flex-col items-center gap-6">
                <div className="text-black flex items-center gap-2 grayscale brightness-0 opacity-50">
                    <Shield size={24} />
                    <span className="text-lg font-bold ">Reflect</span>
                </div>
                <p className="text-xs text-text-tertiary font-bold tracking-widest uppercase">© 2026 Reflect Technologies Inc.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
