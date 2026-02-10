import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import LandingPage from './components/LandingPage';
import { Product, Security, Pricing, Enterprise } from './components/PublicPages';
import Permission from './components/Permission';
import Exam from './components/Exam';
import Terminate from './components/Terminate';
import Login from './components/Login';
import AdminDashboard from './components/Admin/Dashboard';
import CreateExam from './components/Admin/CreateExam';
import LiveMonitor from './components/Admin/LiveMonitor';
import Reports from './components/Admin/Reports';
import AuditLogs from './components/Admin/AuditLogs';
import StudentDashboard from './components/Student/Dashboard';
import { ExamProvider, useExam } from './context/ExamContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';


const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />; // Redirect to login, not landing
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

const App = () => {
  return (
    <AuthProvider>
      <ExamProvider>
        <Router>
          <div className="min-h-screen bg-[var(--rf-bg-canvas)] text-[var(--rf-text-pure)] font-sans">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route path="/product" element={<Product />} />
              <Route path="/security" element={<Security />} />
              <Route path="/pricing" element={<Pricing />} />
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

            </Routes>
          </div>
        </Router>
      </ExamProvider>
    </AuthProvider>
  );
};

export default App;
