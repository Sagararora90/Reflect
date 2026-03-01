import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, LogOut, Menu, X } from 'lucide-react';
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

    // Hide Navbar in Exam and Terminate screens
    if (['/exam', '/terminate'].includes(location.pathname)) return null;

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-black/60 hover:text-black"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ fontFamily: '"SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
                        className="fixed top-[48px] left-0 right-0 z-[999] p-4 bg-white border-b border-black/10 flex flex-col gap-2 origin-top rounded-b-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)]"
                    >
                        {navLinks.map((link) => {
                            const isAnchor = link.path.startsWith('#');
                            const LinkComponent = isAnchor ? 'a' : Link;
                            const linkProps = isAnchor ? { href: link.path } : { to: link.path };
                            
                            return (
                                <LinkComponent
                                    key={link.path}
                                    {...linkProps}
                                    onClick={(e) => link.path.includes('#') ? scrollToSection(e, link.path) : setMobileMenuOpen(false)}
                                    className="px-4 py-3 border-b border-black/10 last:border-0 rounded-xl hover:bg-black/5 transition-colors"
                                >
                                    <span className={clsx(
                                        "text-[15px] font-medium transition-colors",
                                        isActive(link.path) ? "text-black font-bold" : "text-black/70 hover:text-black"
                                    )}>
                                        {link.name}
                                    </span>
                                </LinkComponent>
                            );
                        })}
                        
                        <div className="mt-4 flex flex-col gap-3 px-4 pb-4">
                            {user ? (
                                <>
                                    <Link
                                        to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex flex-col text-left"
                                    >
                                        <span className={clsx(
                                            "text-[15px] font-medium transition-colors",
                                            isActive(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard')
                                                ? "text-black font-bold"
                                                : "text-black/70 hover:text-black"
                                        )}>
                                            Dashboard
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full text-[15px] text-black bg-black/10 hover:bg-black/20 py-3.5 rounded-2xl font-semibold transition-colors mt-2 text-center"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-[15px] font-semibold text-black/70 hover:text-black transition-colors text-center py-2"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full bg-black text-white text-[15px] font-semibold py-3.5 rounded-2xl text-center hover:bg-black/90 transition-all mt-1"
                                    >
                                        Start Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
