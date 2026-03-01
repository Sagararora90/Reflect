import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Shield, Cpu, Code, Eye, Lock, RefreshCw } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Icosahedron, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FeatureAppleCard, BentoShowcase } from './FeatureComponents';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const SpatialCore = ({ scrollRef, isActive }) => {
    const meshRef = useRef();
    const wireRef = useRef();
    const { invalidate } = useThree();

    useFrame((state) => {
        if (!isActive.current) return;

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

        const fadeStart = 0.7;
        const opacity = Math.max(0, 1 - Math.max(0, (scrollProgress - fadeStart) / (1 - fadeStart)));
        if (meshRef.current.material) meshRef.current.material.opacity = 0.8 * opacity;
        if (wireRef.current.material) wireRef.current.material.opacity = (0.1 + scrollProgress * 0.2) * opacity;

        invalidate();
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

    const mobileCalendarRef = useRef(null);
    const mobilePhoneRef = useRef(null);
    const mobileCard1Ref = useRef(null);
    const mobileCard2Ref = useRef(null);
    const mobileCard3Ref = useRef(null);

    const scrollRef = useRef(0);
    const canvasActive = useRef(true);
    
    useGSAP(() => {
        ScrollTrigger.create({
            trigger: heroSectionRef.current,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            fastScrollEnd: true,
            preventOverlaps: true,
            onUpdate: (self) => {
                scrollRef.current = self.progress;
                canvasActive.current = self.progress < 0.9;
            }
        });

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
            duration: 1
        });

        const isTouchDevice = !window.matchMedia('(pointer: fine)').matches;
        if (!isTouchDevice) {
            const handleMouseMove = (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 60;
                const yPos = (clientY / window.innerHeight - 0.5) * 60;
                gsap.to(".ambient-orb", { x: xPos, y: yPos, duration: 2.5, ease: "power2.out" });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }

        ScrollTrigger.addEventListener("scrollStart", () => {
            document.body.classList.add("scrolling");
        });
        ScrollTrigger.addEventListener("scrollEnd", () => {
            document.body.classList.remove("scrolling");
        });
    }, { scope: mainRef });

    // ✅ Throttled scroll state
    const bentoScrollRef = useRef(0);
    const [bentoScroll, setBentoScroll] = useState(0);
    const bentoRafRef = useRef(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const bentoTrigger = ScrollTrigger.create({
                trigger: ".bento-pin-container",
                start: "center 55%",
                end: "+=120%", 
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                fastScrollEnd: true,
                scrub: 1,
                onUpdate: (self) => {
                    bentoScrollRef.current = self.progress;
                    if (!bentoRafRef.current) {
                        bentoRafRef.current = requestAnimationFrame(() => {
                            setBentoScroll(bentoScrollRef.current);
                            bentoRafRef.current = null;
                        });
                    }
                }
            });

            gsap.from(".bento-left", {
                x: "-60vw", rotationY: -45, scale: 0.8, opacity: 0,
                scrollTrigger: { trigger: ".bento-pin-container", start: "top 120%", end: "center 55%", scrub: 2 }
            });
            gsap.from(".bento-right", {
                x: "60vw", rotationY: 45, scale: 0.8, opacity: 0,
                scrollTrigger: { trigger: ".bento-pin-container", start: "top 120%", end: "center 55%", scrub: 2 }
            });

            return () => bentoTrigger.kill();
        });

        // ✅ MOBILE: Horizontal conveyor — each item slides in from right, exits left
        // Calendar → Phone → Card1 → Card2 → Card3
        mm.add("(max-width: 1023px)", () => {
            const calEl = mobileCalendarRef.current;
            const phoneEl = mobilePhoneRef.current;
            const c1 = mobileCard1Ref.current;
            const c2 = mobileCard2Ref.current;
            const c3 = mobileCard3Ref.current;
            if (!calEl || !phoneEl) return;

            const SX = 300; // slide distance in px
            const allEls = [calEl, phoneEl, c1, c2, c3].filter(Boolean);

            // Helper: hide all, then show only the one we need
            const hideAll = () => allEls.forEach(el => gsap.set(el, { opacity: 0, x: SX }));

            // Set initial state
            hideAll();

            const mobileTrigger = ScrollTrigger.create({
                trigger: ".mobile-widget-stage",
                start: "top 10%",
                end: "+=400%",
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                fastScrollEnd: true,
                scrub: 1,
                onUpdate: (self) => {
                    const p = self.progress;

                    // ── Phase 0 (0→0.06): Calendar slides in from right ──
                    if (p < 0.06) {
                        const t = p / 0.06;
                        gsap.set(calEl, { opacity: t, x: SX * (1 - t), scale: 0.9 + t * 0.1 });
                        gsap.set(phoneEl, { opacity: 0, x: SX });
                        if (c1) gsap.set(c1, { opacity: 0, x: SX });
                        if (c2) gsap.set(c2, { opacity: 0, x: SX });
                        if (c3) gsap.set(c3, { opacity: 0, x: SX });
                        if (!bentoRafRef.current) {
                            bentoRafRef.current = requestAnimationFrame(() => {
                                setBentoScroll(0);
                                bentoRafRef.current = null;
                            });
                        }

                    // ── Phase 1 (0.06→0.20): Calendar animates (23→31) ──
                    } else if (p < 0.20) {
                        gsap.set(calEl, { opacity: 1, x: 0, scale: 1 });
                        gsap.set(phoneEl, { opacity: 0, x: SX });
                        const calP = (p - 0.06) / 0.14;
                        if (!bentoRafRef.current) {
                            bentoRafRef.current = requestAnimationFrame(() => {
                                setBentoScroll(calP);
                                bentoRafRef.current = null;
                            });
                        }

                    // ── Phase 2 (0.20→0.28): Calendar exits left + Phone enters right ──
                    } else if (p < 0.28) {
                        const t = (p - 0.20) / 0.08;
                        gsap.set(calEl, { opacity: 1 - t, x: -SX * t });
                        gsap.set(phoneEl, { opacity: t, x: SX * (1 - t), scale: 0.9 + t * 0.1 });
                        if (c1) gsap.set(c1, { opacity: 0, x: SX });
                        if (!bentoRafRef.current) {
                            bentoRafRef.current = requestAnimationFrame(() => {
                                setBentoScroll(0);
                                bentoRafRef.current = null;
                            });
                        }

                    // ── Phase 3 (0.28→0.48): Phone animates (lock→unlock) ──
                    } else if (p < 0.48) {
                        gsap.set(calEl, { opacity: 0, x: -SX });
                        gsap.set(phoneEl, { opacity: 1, x: 0, scale: 1 });
                        if (c1) gsap.set(c1, { opacity: 0, x: SX });
                        const phoneP = (p - 0.28) / 0.20;
                        if (!bentoRafRef.current) {
                            bentoRafRef.current = requestAnimationFrame(() => {
                                setBentoScroll(phoneP);
                                bentoRafRef.current = null;
                            });
                        }

                    // ── Phase 4 (0.48→0.56): Phone exits left + Card1 enters right ──
                    } else if (p < 0.56) {
                        const t = (p - 0.48) / 0.08;
                        gsap.set(calEl, { opacity: 0 });
                        gsap.set(phoneEl, { opacity: 1 - t, x: -SX * t });
                        if (c1) gsap.set(c1, { opacity: t, x: SX * (1 - t) });
                        if (c2) gsap.set(c2, { opacity: 0, x: SX });
                        if (c3) gsap.set(c3, { opacity: 0, x: SX });

                    // ── Phase 5 (0.56→0.66): Card1 visible ──
                    } else if (p < 0.66) {
                        gsap.set(calEl, { opacity: 0 });
                        gsap.set(phoneEl, { opacity: 0 });
                        if (c1) gsap.set(c1, { opacity: 1, x: 0 });
                        if (c2) gsap.set(c2, { opacity: 0, x: SX });
                        if (c3) gsap.set(c3, { opacity: 0, x: SX });

                    // ── Phase 6 (0.66→0.74): Card1 exits left + Card2 enters right ──
                    } else if (p < 0.74) {
                        const t = (p - 0.66) / 0.08;
                        if (c1) gsap.set(c1, { opacity: 1 - t, x: -SX * t });
                        if (c2) gsap.set(c2, { opacity: t, x: SX * (1 - t) });
                        if (c3) gsap.set(c3, { opacity: 0, x: SX });

                    // ── Phase 7 (0.74→0.84): Card2 visible ──
                    } else if (p < 0.84) {
                        if (c1) gsap.set(c1, { opacity: 0 });
                        if (c2) gsap.set(c2, { opacity: 1, x: 0 });
                        if (c3) gsap.set(c3, { opacity: 0, x: SX });

                    // ── Phase 8 (0.84→0.92): Card2 exits left + Card3 enters right ──
                    } else if (p < 0.92) {
                        const t = (p - 0.84) / 0.08;
                        if (c1) gsap.set(c1, { opacity: 0 });
                        if (c2) gsap.set(c2, { opacity: 1 - t, x: -SX * t });
                        if (c3) gsap.set(c3, { opacity: t, x: SX * (1 - t) });

                    // ── Phase 9 (0.92→1.0): Card3 visible ──
                    } else {
                        if (c1) gsap.set(c1, { opacity: 0 });
                        if (c2) gsap.set(c2, { opacity: 0 });
                        if (c3) gsap.set(c3, { opacity: 1, x: 0 });
                    }
                }
            });

            return () => mobileTrigger.kill();
        });

        const cards = gsap.utils.toArray(".feature-card");
        cards.forEach((card, i) => {
            gsap.from(card, {
                y: 100,
                opacity: 0,
                scale: 0.95,
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

        return () => mm.revert();
    }, { scope: mainRef });

    return (
        <div ref={mainRef} className="bg-white selection:bg-primary/30 overflow-hidden font-sans text-white">
            
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="ambient-orb absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)' }} />
                <div className="ambient-orb absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.08), transparent 70%)' }} />
            </div>

            {/* HERO SECTION */}
            <section id="home" ref={heroSectionRef} className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
                <div className="absolute inset-0 z-0">
                    <Canvas 
                        frameloop="demand"
                        dpr={[1, 1.5]}
                        gl={{ powerPreference: "high-performance", antialias: false }}
                    >
                        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                        <SpatialCore scrollRef={scrollRef} isActive={canvasActive} />
                    </Canvas>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#dcd8e1] to-[#dcd8e1]/0 pointer-events-none" />
                </div>

                <div ref={heroTitleRef} className="relative z-10 w-full max-w-5xl">
                    <div className="inline-flex items-center gap-2 bg-black/5 border border-black/10 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-10 shadow-2xl">
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
                            className="font-semibold bg-white/80 text-black border border-black/10 px-10 py-2 rounded-[1.75rem] text-lg tracking-tight shadow-[0_20px_50px_rgba(37,99,235,0.1)] hover:shadow-[0_30px_70px_#646464] active:scale-95 transition-all flex items-center gap-2" 
                            onClick={() => navigate('/login')}
                        >
                            Get Started
                            <ArrowRight size={20} className="stroke-[3px]" />
                        </button>
                        <button 
                            className="bg-black text-white border border-black/10 px-10 py-2 rounded-[1.75rem] text-lg tracking-tight transition-all active:scale-95"
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

            {/* FEATURES SECTION */}
            <section id="features" className="features-section relative bg-[#646668] text-white z-20 rounded-t-[5rem] border-t border-white/5 overflow-hidden">
                {/* FIX 1: Reduced bottom padding on mobile so widget stage sits closer to heading */}
                <div className="max-w-7xl mx-auto px-8 pt-12 pb-4 lg:py-32 lg:pb-16">
                    <div className="mb-4 lg:mb-16 max-w-3xl text-center mx-auto">
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 lg:mb-6 leading-[0.9]">
                            Security <br className="hidden sm:block" /> that feels like magic.
                        </h2>
                        <p className="text-lg lg:text-xl text-white/40 font-medium leading-relaxed max-w-xl mx-auto">
                            We use spatial AI to protect your hard work. Simple, powerful, and private.
                        </p>
                    </div>
                </div>

                {/* ✅ MOBILE: Conveyor belt — each item slides in/out individually */}
                <div className="mobile-widget-stage lg:hidden relative w-full h-[75vh] flex items-center justify-center overflow-hidden">
                    {/* Calendar layer */}
                    <div ref={mobileCalendarRef} className="mobile-calendar absolute inset-0 flex items-center justify-center px-4 gpu" style={{ opacity: 0 }}>
                        <div className="w-full max-w-[92vw]">
                            <BentoShowcase scrollProgress={bentoScroll} showOnly="calendar" />
                        </div>
                    </div>
                    {/* Phone layer */}
                    <div ref={mobilePhoneRef} className="mobile-phone absolute inset-0 flex items-center justify-center px-4 gpu" style={{ opacity: 0 }}>
                        <div className="w-full max-w-[80vw]">
                            <BentoShowcase scrollProgress={bentoScroll} showOnly="phone" />
                        </div>
                    </div>
                    {/* Card 1 */}
                    <div ref={mobileCard1Ref} className="absolute inset-0 flex items-center justify-center px-6 gpu" style={{ opacity: 0 }}>
                        <div className="w-full max-w-[85vw]">
                            <FeatureAppleCard icon={<Cpu />} title="Neural Core" desc="Advanced machine learning models that monitor session integrity in real-time." />
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div ref={mobileCard2Ref} className="absolute inset-0 flex items-center justify-center px-6 gpu" style={{ opacity: 0 }}>
                        <div className="w-full max-w-[85vw]">
                            <FeatureAppleCard icon={<Code />} title="Hybrid Logic" desc="A highly responsive environment supporting 40+ execution layers natively." />
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div ref={mobileCard3Ref} className="absolute inset-0 flex items-center justify-center px-6 gpu" style={{ opacity: 0 }}>
                        <div className="w-full max-w-[85vw]">
                            <FeatureAppleCard icon={<Eye />} title="Biometric Sync" desc="Seamless presence verification and multi-layer structural gaze tracking." />
                        </div>
                    </div>
                </div>

                {/* DESKTOP: Original layout (unchanged) */}
                <div className="hidden lg:block">
                    <div className="bento-pin-container relative w-full h-screen flex items-center justify-center">
                        <div className="max-w-7xl mx-auto px-8 w-full bento-widget-container">
                            <BentoShowcase scrollProgress={bentoScroll} />
                        </div>
                    </div>

                    <div className="feature-cards-grid grid grid-cols-3 gap-10 relative z-30 pb-24 max-w-7xl mx-auto w-full px-8">
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

            {/* CTA/PRICING SECTION */}
            <section id="pricing" className="py-48 bg-gradient-to-t from-black to-black/0 text-white z-30 relative -mt-10">
                <div className="max-w-7xl mx-auto px-10 text-center">
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

            {/* Footer */}
            <footer className="py-6 bg-white border-t border-border flex flex-col items-center gap-6">
                <div className="text-black flex items-center gap-2 grayscale brightness-0 opacity-50">
                    <Shield size={24} />
                    <span className="text-lg font-bold">Reflect</span>
                </div>
                <p className="text-xs text-text-tertiary font-bold tracking-widest uppercase">© 2026 Reflect Technologies Inc.</p>
            </footer>
        </div>
    );
};

export default LandingPage;