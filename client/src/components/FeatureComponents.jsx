import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Shield, Zap, Cpu, Code, Lock, Globe, ArrowRight, Activity, Eye, RefreshCw, ArrowUp, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import wallpaper from '/wallpaper.jpg';

export const FeatureAppleCard = ({ icon, title, desc, className = "" }) => {
    return (
        <div className={`feature-card p-10 rounded-[3.5rem] bg-black/40 border-[3px] border-white/10 hover:bg-black/60 hover:border-[3px] hover:border-white/20 hover:shadow-[0_40px_100px_-20px_rgba(255,255,255,0.05)] transition-all duration-500 flex flex-col justify-between group cursor-pointer shadow-2xl min-h-[360px] gpu ${className}`} role="button">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:bg-white group-hover:text-black group-hover:border-white/50 transition-all duration-500 shadow-xl">
                {React.cloneElement(icon, { size: 28, strokeWidth: 2.2 })}
            </div>
            <div className="mt-12">
                <h3 className="text-[26px] font-bold tracking-tight mb-3 text-white transition-colors duration-500 group-hover:text-white/90">{title}</h3>
                <p className="text-[17px] text-white/50 font-medium leading-relaxed group-hover:text-white/70 transition-colors duration-500">{desc}</p>
            </div>
        </div>
    );
};

export const CalendarWidget = ({ rotation, progress }) => {
    const cardRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(23);

    useEffect(() => {
        const date = Math.min(31, 23 + Math.floor(progress * 9)); 
        setCurrentDate(date);
    }, [progress]);

    const months = [
        "May 2006", "June 2006", "July 2006", "August 2006", 
        "September 2006", "October 2006", "November 2006", "December 2006", "January 2006"
    ];
    const shortMonths = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    
    const monthIndex = currentDate - 23;
    const displayMonth = months[monthIndex] || "May 2006";
    const displayShortMonth = shortMonths[monthIndex] || "May";

    useGSAP(() => {
        gsap.to(cardRef.current, {
            rotateY: rotation.x,
            rotateX: -rotation.y,
            duration: 0.5,
            ease: "power2.out"
        });
    }, [rotation]);

    return (
        /* ✅ Removed backdrop-blur-[50px] — replaced with solid semi-transparent bg */
        <div ref={cardRef} className="relative w-full h-auto min-h-[420px] md:h-[580px] bg-[rgba(30,30,30,0.88)] border border-white/20 rounded-[2.5rem] md:rounded-[3.5rem] p-5 md:p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform-gpu ring-1 ring-white/10 overflow-hidden font-sans flex flex-col gpu">
            <div className="flex justify-between items-center mb-6 md:mb-8 px-1 md:px-2">
                <div>
                    <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1 transition-all">{displayMonth}</h4>
                    <p className="text-white/60 font-medium tracking-tight text-xs md:text-sm">Upcoming Assessments</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                    <Calendar size={22} className="text-white scale-75 md:scale-100" />
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 gap-x-1 md:gap-x-2 text-center text-[10px] md:text-[11px] font-bold tracking-wider text-white/50 mb-2 uppercase">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
            </div>
            
            <div className="grid grid-cols-7 gap-y-1 md:gap-y-2 gap-x-1 md:gap-x-2 text-center text-[14px] md:text-[19px] font-medium text-white relative">
                {[...Array(31)].map((_, i) => {
                    const dayNumber = i + 1;
                    const isActive = dayNumber === currentDate;
                    const isExam = dayNumber === 25 || dayNumber === 31;
                    const isPast = dayNumber < 23;
                    
                    return (
                        <div key={i} className={`h-9 md:h-12 w-full mx-auto flex flex-col items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 relative cursor-default
                            ${isActive ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.4)] scale-110 z-20 font-bold border border-white/50' : 
                              isPast ? 'text-white/20' : 'text-white/80 hover:bg-white/10'}`}>
                            
                            <span>{dayNumber}</span>
                            
                            {isExam && !isActive && <div className="absolute bottom-1 md:bottom-1.5 w-1 h-1 rounded-full bg-white/40" />}
                            {isActive && <div className="absolute bottom-1 md:bottom-1.5 w-1 h-1 rounded-full bg-black/40" />}
                        </div>
                    );
                })}
            </div>
            
            {/* ✅ Removed backdrop-blur-[40px] — solid bg instead */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 pb-6 md:pb-10 bg-gradient-to-t from-black/40 to-transparent">
                <div className="flex items-center gap-4 md:gap-5 bg-black/40 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl group hover:border-white/40 transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                        <Code size={18} className="text-white md:hidden" />
                        <Code size={22} className="text-white hidden md:block" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5 md:mb-1">
                            <p className="font-semibold text-base md:text-lg tracking-tight text-white leading-tight placeholder truncate">Data Structures Final</p>
                        </div>
                        <p className="text-[10px] md:text-xs font-semibold tracking-wide text-white/60 truncate">{displayShortMonth} {currentDate} • 9:57 - 11:58</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PhoneWidget = ({ rotation, progress }) => {
    const cardRef = useRef(null);
    const isOpened = progress > 0.4;
    const swipeProgress = Math.min(progress * 2.5, 1);
    const appRevealProgress = Math.min(Math.max((progress - 0.4) * 1.6, 0), 1);

    useGSAP(() => {
        gsap.to(cardRef.current, {
            rotateY: rotation.x,
            rotateX: -rotation.y,
            duration: 0.6,
            ease: "power2.out"
        });
    }, [rotation]);

    return (
        /* ✅ Responsive width instead of fixed w-80 */
        <div ref={cardRef} className="relative w-full max-w-[320px] h-[580px] border-[6px] border-white/10 rounded-[4.5rem] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/20 transform-gpu mx-auto bg-black gpu">
            {/* Background Wallpaper */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: `url(${wallpaper})`,
                    /* ✅ GPU-only transform */
                    transform: `scale(${1 + appRevealProgress * 0.05}) translateZ(0)` 
                }}
            />
            <div className="absolute inset-0 z-0 bg-black/10 pointer-events-none" />

            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-7 bg-black rounded-full z-50 flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10 mr-2 ml-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 ml-auto mr-3 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>

            <div className="relative z-10 h-full w-full p-5 pt-16 font-sans">
                {/* Lock Screen */}
                <div 
                    className="absolute inset-0 z-40 flex flex-col items-center p-6 pt-20"
                    style={{ 
                        /* ✅ GPU-only: transform + opacity */
                        transform: `translateY(${-swipeProgress * 110}%) translateZ(0)`,
                        opacity: 1 - (swipeProgress * 0.5),
                        display: swipeProgress >= 1 ? 'none' : 'flex'
                    }}
                >
                    <div className="text-center transition-all duration-300 w-full mt-2">
                        <Lock size={24} className="text-white/80 mb-3 mx-auto" strokeWidth={2.5} />
                        <div className="text-center drop-shadow-lg">
                            <p className="text-[5.5rem] font-medium text-white tracking-tight leading-none mb-1 tabular-nums drop-shadow-md">9:57</p>
                            <p className="text-[17px] font-semibold text-white mt-1 drop-shadow-md tracking-wide">Tuesday, May 23</p>
                        </div>
                    </div>

                    {/* Music Player Widget — ✅ solid bg instead of backdrop-blur */}
                    <div className="w-full mt-8 bg-black/60 border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                                <img src="/albumart.jpg" alt="Album Art" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[14px] font-bold text-white tracking-tight truncate">Lag Ja Gale Se Phir</p>
                                <p className="text-[12px] font-medium text-white/60 truncate mt-0.5">Lata Mangeshkar</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-0.5">
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="w-[45%] h-full bg-white rounded-full" />
                            </div>
                            <div className="flex justify-between items-center mt-1 px-0.5">
                                <span className="text-[9px] font-medium text-white/70 tabular-nums">2:03</span>
                                <span className="text-[9px] font-medium text-white/70 tabular-nums">-2:20</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-6 z-10 text-center w-full">
                        <div className="w-32 h-1 bg-white mx-auto mt-3 rounded-full opacity-80 shadow-md" />
                    </div>
                </div>

                {/* Home Screen App Content — ✅ opacity only, NO filter:blur */}
                <div 
                    className="h-full flex flex-col relative gpu"
                    style={{ 
                        opacity: appRevealProgress,
                        transform: `scale(${0.92 + appRevealProgress * 0.08}) translateZ(0)`,
                        /* ✅ Removed filter:blur() — the single biggest mobile killer */
                    }}
                >
                    {/* Status Bar Time */}
                    <div className="absolute -top-12 left-1 z-50">
                        <span className="text-white text-[13px] font-bold tracking-tight">11:58</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 mb-6 text-center mt-1">
                        {/* ✅ Removed backdrop-blur-xl */}
                        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xl mb-1 relative overflow-hidden">
                           <div className="absolute inset-0 pointer-events-none" />
                           <Eye size={26} strokeWidth={2} className="text-white relative z-10" />
                        </div>
                        <div>
                            <h5 className="font-bold text-xl tracking-tight text-white mb-0.5">Reflect</h5>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white">Exam Mode Live</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 flex-1 w-full max-w-[260px] mx-auto">
                        {[
                            { icon: <Lock />, title: "App Lockdown", stat: "Enforced" },
                            { icon: <Activity />, title: "Biometric AI", stat: "Tracking" },
                            { icon: <Globe />, title: "DNS Shield", stat: "Encrypted" }
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                /* ✅ Removed backdrop-blur-xl */
                                className="phone-item bg-white/8 border border-white/10 p-3.5 rounded-2xl group hover:bg-white/10 transition-all duration-500"
                                style={{
                                    /* ✅ GPU-only: transform + opacity */
                                    transform: `translateY(${(1 - appRevealProgress) * (40 + i * 15)}px) translateZ(0)`,
                                    opacity: appRevealProgress
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-white border border-white/10 shrink-0`}>
                                            {React.cloneElement(item.icon, { size: 16 })}
                                        </div>
                                        <span className="text-[14px] font-semibold text-white tracking-tight truncate max-w-[90px]">{item.title}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider text-white/60 shrink-0`}>{item.stat}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ✅ Removed backdrop-blur-2xl */}
                    <div className="mt-auto p-5 bg-white/8 rounded-3xl relative overflow-hidden border border-white/10 shrink-0">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                <div className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                                <div className="w-3.5 h-3.5 rounded-full bg-white absolute" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1">Live Feed</p>
                                <p className="text-[15px] font-semibold text-white tracking-tight">Proctor Connected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ✅ Mousemove stored in ref (no setState), scroll progress received as prop
// showOnly: 'calendar' | 'phone' | undefined (both for desktop)
export const BentoShowcase = ({ scrollProgress, showOnly }) => {
    const mousePosRef = useRef({ x: 0, y: 0 });

    // ✅ Mousemove: only on desktop (pointer: fine), stored in ref not state
    useEffect(() => {
        const isTouchDevice = !window.matchMedia('(pointer: fine)').matches;
        if (isTouchDevice) return;

        const handleMove = (e) => {
            const { clientWidth, clientHeight } = document.documentElement;
            const x = (e.clientX / clientWidth - 0.5) * 30;
            const y = (e.clientY / clientHeight - 0.5) * 30;
            mousePosRef.current = { x, y };
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    const calendarProgress = Math.min(Math.max(scrollProgress * 2, 0), 1);
    const phoneProgress = Math.min(Math.max((scrollProgress - 0.3) * 1.5, 0), 1);

    // Mobile: render single widget
    if (showOnly === 'calendar') {
        return (
            <div className="w-full flex justify-center gpu">
                <CalendarWidget rotation={mousePosRef.current} progress={calendarProgress} />
            </div>
        );
    }
    if (showOnly === 'phone') {
        return (
            <div className="w-full flex justify-center gpu">
                <PhoneWidget rotation={mousePosRef.current} progress={phoneProgress} />
            </div>
        );
    }

    // Desktop: original grid layout
    return (
        <div 
            className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-12 items-center perspective-2000 w-full h-full lg:h-auto my-auto"
        >
            <div className="lg:col-span-8 flex justify-center w-full bento-left md:scale-90 lg:scale-100 origin-top lg:origin-center gpu">
                <CalendarWidget rotation={mousePosRef.current} progress={calendarProgress} />
            </div>
            <div className="lg:col-span-4 flex justify-center w-full bento-right md:scale-90 lg:scale-100 origin-top lg:origin-center pb-10 lg:pb-0 gpu">
                <PhoneWidget rotation={mousePosRef.current} progress={phoneProgress} />
            </div>
        </div>
    );
};
