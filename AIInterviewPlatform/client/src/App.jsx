import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import TextInterview from './pages/TextInterview';
import VoiceInterview from './pages/VoiceInterview';
import CodingChallenges from './pages/CodingChallenges';
import CodingChallenge from './pages/CodingChallenge';
import ResumeUpload from './pages/ResumeUpload';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

const App = () => {
  return (
    <ThemeProvider>
      <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #1e1b4b)',
                color: '#e2e8f0',
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.3)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
            <Route path="/interview/text/:id" element={<ProtectedRoute><TextInterview /></ProtectedRoute>} />
            <Route path="/interview/voice" element={<ProtectedRoute><VoiceInterview /></ProtectedRoute>} />
            <Route path="/interview/voice/:id" element={<ProtectedRoute><VoiceInterview /></ProtectedRoute>} />
            <Route path="/coding" element={<ProtectedRoute><CodingChallenges /></ProtectedRoute>} />
            <Route path="/coding/:id" element={<ProtectedRoute><CodingChallenge /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
    </ThemeProvider>
  );
};

export default App;
