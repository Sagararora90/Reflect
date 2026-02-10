import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Layout, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Hide Navbar in Exam and Terminate screens
    if (['/exam', '/terminate'].includes(location.pathname)) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                pointerEvents: 'auto',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div
                style={{
                    background: 'rgba(10, 12, 16, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '10px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8 }}>
                        <Shield size={18} style={{ color: '#3B82F6' }} />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Reflect</span>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <NavLink to="/" active={isActive('/')}>Home</NavLink>
                    <NavLink to="/product" active={isActive('/product')}>Features</NavLink>
                    <NavLink to="/security" active={isActive('/security')}>Security</NavLink>
                    <NavLink to="/pricing" active={isActive('/pricing')}>Pricing</NavLink>
                </div>

                {/* Auth Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 10 }}>
                    {user ? (
                        <>
                            <Link
                                to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#E2E8F0', fontSize: 13, fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Layout size={15} /> Dashboard
                            </Link>
                            <button
                                onClick={logout}
                                title="Logout"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: '#3B82F6', color: '#fff',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <LogOut size={15} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '8px 16px', borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#E2E8F0', fontSize: 13, fontWeight: 600,
                                    textDecoration: 'none',
                                    background: 'transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '8px 20px', borderRadius: 8,
                                    border: 'none',
                                    background: '#3B82F6', color: '#fff',
                                    fontSize: 13, fontWeight: 700,
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, active, children }) => (
    <Link
        to={to}
        style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s',
            color: active ? '#3B82F6' : '#94A3B8',
            background: active ? 'rgba(59,130,246,0.05)' : 'transparent',
            border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
        }}
    >
        {children}
    </Link>
);


export default Navbar;
