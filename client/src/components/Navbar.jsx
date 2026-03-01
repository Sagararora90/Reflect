import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navRef = useRef(null);

    const scrollToSection = (e, path) => {
        const id = path.substring(path.indexOf('#') + 1);
        const isHomePage = location.pathname === '/';

        if (isHomePage) {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                const offset = id === 'pricing' ? 0 : 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
            setMobileMenuOpen(false);
        } else {
            // Let the Link navigate to /#id
            setMobileMenuOpen(false);
        }
    };

    // Handle scroll to hash when navigating from another page
    useEffect(() => {
        if (location.pathname === '/' && location.hash) {
            const id = location.hash.substring(1);
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            }, 100);
        }
    }, [location]);

    useGSAP(() => {
        // SECTION TRACKING
        const sections = ['home', 'features', 'pricing'];
        const triggers = sections.map(id => {
            return ScrollTrigger.create({
                trigger: `#${id}`,
                start: id === 'pricing' ? "top 80%" : "top 40%", // Reveal pricing earlier
                end: id === 'pricing' ? "bottom bottom" : "bottom 40%",
                onEnter: () => setActiveSection(id),
                onEnterBack: () => setActiveSection(id),
            });
        });

        const links = document.querySelectorAll(".nav-link-magnetic");
        links.forEach(link => {
            link.addEventListener("mousemove", (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(link, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });

            link.addEventListener("mouseleave", () => {
                gsap.to(link, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });

        return () => {
            triggers.forEach(t => t.kill());
        };
    }, { scope: navRef });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide Navbar in Exam and Terminate screens - Moved after all hooks
    if (['/exam', '/terminate'].includes(location.pathname)) return null;

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'Security', path: '/security' },
        { name: 'Pricing', path: '/pricing' }
    ];

    return (
        <>
            <nav ref={navRef} className="liquid-nav">
                <div className="liquid-nav-inner h-full">
                    {/* Professional Logo */}
                    <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
                        <span className="font-black text-sm tracking-[-0.03em] text-black">REFLECT</span>
                    </Link>

                    {/* Desktop Nav */}
                    <ul className="hidden md:flex">
                        {navLinks.map((link) => {
                            const isAnchor = link.path.startsWith('#');
                            const LinkComponent = isAnchor ? 'a' : Link;
                            const linkProps = isAnchor ? { href: link.path } : { to: link.path };
                            
                            return (
                                <LinkComponent
                                    key={link.path}
                                    {...linkProps}
                                    onClick={(e) => link.path.includes('#') ? scrollToSection(e, link.path) : setMobileMenuOpen(false)}
                                    className="nav-link-magnetic mx-4"
                                >
                                    <li className={clsx(isActive(link.path) && "active font-bold")}>
                                        {link.name}
                                    </li>
                                </LinkComponent>
                            );
                        })}
                    </ul>

                    {/* Auth Section Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                                    className={clsx(
                                        "text-[13px] font-semibold transition-all duration-300",
                                        isActive(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard') 
                                            ? "text-black active relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:height-[1.5px] after:bg-black after:rounded-full" 
                                            : "text-black/60 hover:text-black"
                                    )}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="nav-cta-black !py-2 !px-5 !rounded-full !text-[12px]"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-[13px] font-semibold text-black/60 hover:text-black transition-opacity"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="nav-cta-black !py-2 !px-5 !rounded-full !text-[12px]"
                                >
                                    Start Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle — animated hamburger */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                    className="block w-full h-[1.5px] bg-black rounded-full origin-center"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                                    transition={{ duration: 0.15 }}
                                    className="block w-full h-[1.5px] bg-black rounded-full"
                                />
                                <motion.span
                                    animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                    className="block w-full h-[1.5px] bg-black rounded-full origin-center"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu — Full-screen frosted overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[998] md:hidden"
                    >
                        {/* Backdrop blur layer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                            style={{
                                background: 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(40px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                            }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
                            className="relative pt-24 px-8 flex flex-col h-full"
                            style={{ fontFamily: '"SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
                        >
                            {/* Nav links — staggered */}
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link, i) => {
                                    const isAnchor = link.path.startsWith('#');
                                    const LinkComponent = isAnchor ? 'a' : Link;
                                    const linkProps = isAnchor ? { href: link.path } : { to: link.path };
                                    
                                    return (
                                        <motion.div
                                            key={link.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
                                        >
                                            <LinkComponent
                                                {...linkProps}
                                                onClick={(e) => link.path.includes('#') ? scrollToSection(e, link.path) : setMobileMenuOpen(false)}
                                                className="group flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors"
                                            >
                                                <span className={clsx(
                                                    "text-[28px] font-semibold tracking-tight transition-colors",
                                                    isActive(link.path) ? "text-black" : "text-black/50 group-hover:text-black"
                                                )}>
                                                    {link.name}
                                                </span>
                                                {isActive(link.path) && (
                                                    <div className="w-2 h-2 rounded-full bg-black" />
                                                )}
                                            </LinkComponent>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="h-px bg-black/10 my-6 mx-4 origin-left"
                            />

                            {/* Auth section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col gap-3 px-4"
                            >
                                {user ? (
                                    <>
                                        <Link
                                            to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-black/5 transition-colors"
                                        >
                                            <span className="text-[20px] font-medium text-black/60">Dashboard</span>
                                            <Layout size={18} className="text-black/30" />
                                        </Link>
                                        <button
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className="w-full text-[16px] font-semibold py-4 rounded-2xl text-center transition-all active:scale-[0.98]"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04))',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                color: 'rgba(0,0,0,0.7)',
                                            }}
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-[16px] font-semibold text-black/50 hover:text-black text-center py-3 rounded-2xl hover:bg-black/5 transition-all"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full text-[16px] font-semibold py-4 rounded-2xl text-center text-white transition-all active:scale-[0.98]"
                                            style={{
                                                background: 'linear-gradient(135deg, #1d1d1f, #3a3a3c)',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            Start Free →
                                        </Link>
                                    </>
                                )}
                            </motion.div>

                            {/* Bottom subtle branding */}
                            <div className="mt-auto pb-12 text-center">
                                <p className="text-[11px] font-medium text-black/20 tracking-[0.2em] uppercase">Reflect Technologies</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
