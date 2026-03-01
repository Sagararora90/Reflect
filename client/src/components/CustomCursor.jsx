import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const haloRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;
        const halo = haloRef.current;

        const moveCursor = (e) => {
            const { clientX, clientY } = e;
            
            // Move small dot instantly
            gsap.to(dot, {
                x: clientX,
                y: clientY,
                duration: 0.1,
                ease: "power2.out"
            });

            // Move halo with lag (inertia)
            gsap.to(halo, {
                x: clientX,
                y: clientY,
                duration: 0.4,
                ease: "power3.out"
            });
        };

        const handleHover = (e) => {
            const isClickable = e.target.closest('a, button, input, textarea, [role="button"]');
            if (isClickable) {
                gsap.to(dot, { scale: 2.5, backgroundColor: '#000000', duration: 0.3 });
                gsap.to(halo, { scale: 1.4, opacity: 0.15, backgroundColor: '#000000', border: 'none', duration: 0.3 });
            } else {
                gsap.to(dot, { scale: 1, backgroundColor: '#000000', duration: 0.3 });
                gsap.to(halo, { scale: 1, opacity: 0.3, border: '1px solid black', backgroundColor: 'transparent', duration: 0.3 });
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);

        // Hide cursor when it leaves the window
        document.addEventListener('mouseleave', () => {
            gsap.to([dot, halo], { opacity: 0, duration: 0.5 });
        });

        document.addEventListener('mouseenter', () => {
            gsap.to(dot, { opacity: 1, duration: 0.5 });
            gsap.to(halo, { opacity: 0.3, duration: 0.5 });
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Primary Dot */}
            <div 
                ref={dotRef}
                className="fixed w-2 h-2 bg-black rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 shadow-sm"
            />
            {/* Smooth Halo */}
            <div 
                ref={haloRef}
                className="fixed w-10 h-10 border border-black/20 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-30 backdrop-blur-[1px]"
                style={{ backgroundColor: 'transparent' }}
            />
        </div>
    );
};

export default CustomCursor;
