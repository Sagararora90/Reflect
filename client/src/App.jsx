import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Landing from './components/Landing';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import PricingPage from './components/PricingPage';
import { Product, Security, Enterprise } from './components/PublicPages';
import Permission from './components/Permission';
import Exam from './components/Exam';
import Terminate from './components/Terminate';
import Login from './components/Login';
import AdminDashboard from './components/Admin/Dashboard';
import CreateExam from './components/Admin/CreateExam';
import LiveMonitor from './components/Admin/LiveMonitor';
import Reports from './components/Admin/Reports';
import AuditLogs from './components/Admin/AuditLogs';
import Settings from './components/Admin/Settings';
import StudentDashboard from './components/Student/Dashboard';
import { ExamProvider, useExam } from './context/ExamContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';


import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />; 
    }

    if (roles && !roles.includes(user.role)) {
        return <div className="view active"><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
    }

    return children;
};

// Protect Exam Route: Check streams + Auth
const ExamGuard = ({ children }) => {
  const { state } = useExam();
  if (!state.streams.webcam || !state.streams.screen) {
      return <Navigate to="/permission" replace />;
  }
  return children;
};


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-red-50 text-red-900 rounded-xl m-8 border border-red-200">
            <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
            <pre className="text-sm bg-white p-4 rounded text-left overflow-auto max-w-full shadow-sm">{this.state.error?.toString()}</pre>
            <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wraps page contents in a smooth framer-motion transition
const PageTransition = ({ children }) => {
    return (
        <ErrorBoundary>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
            >
                {children}
            </motion.div>
        </ErrorBoundary>
    );
};

const AnimatedRoutes = () => {
    return (
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/product" element={<Product />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/security" element={<Security />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/enterprise" element={<Enterprise />} />
                
                {/* Student Protected Routes */}
                <Route path="/student/dashboard" element={
                    <PrivateRoute roles={['student']}>
                        <StudentDashboard />
                    </PrivateRoute>
                } />

                <Route path="/landing/:examId" element={
                    <PrivateRoute roles={['student', 'admin', 'teacher']}>
                        <Landing />
                    </PrivateRoute>
                } />
                 <Route path="/landing" element={
                    <PrivateRoute roles={['student', 'admin', 'teacher']}>
                        <Landing />
                    </PrivateRoute>
                } />

                <Route path="/permission" element={
                    <PrivateRoute roles={['student']}>
                        <Permission />
                    </PrivateRoute>
                } />

                <Route path="/exam" element={
                  <PrivateRoute roles={['student']}>
                      <ExamGuard>
                          <Exam /> 
                      </ExamGuard>
                  </PrivateRoute>
                } />

                <Route path="/terminate" element={
                    <PrivateRoute roles={['student']}>
                        <Terminate />
                    </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />
                
                <Route path="/admin/create-exam" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <CreateExam />
                    </PrivateRoute>
                } />

                <Route path="/admin/monitor/:examId" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <LiveMonitor />
                    </PrivateRoute>
                } />

                <Route path="/admin/reports/exam/:examId" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <Reports />
                    </PrivateRoute>
                } />

                <Route path="/admin/audit" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <AuditLogs />
                    </PrivateRoute>
                } />

                <Route path="/admin/settings" element={
                    <PrivateRoute roles={['admin', 'teacher']}>
                        <Settings />
                    </PrivateRoute>
                } />

            </Routes>
    );
};


const App = () => {
  React.useEffect(() => {
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <ExamProvider>
        <Router>
          <div className="min-h-screen bg-background text-text-primary font-sans overflow-x-hidden">
            <CustomCursor />
            <Navbar />
            <AnimatedRoutes />
          </div>
        </Router>
      </ExamProvider>
    </AuthProvider>
  );
};

export default App;
