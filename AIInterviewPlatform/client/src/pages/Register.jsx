/* eslint-disable react-hooks/incompatible-library */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiMonitor, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Register = () => {
  const { register: registerUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await registerUser(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Server is not reachable. Please make sure the backend is running and MongoDB is connected.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'AI-generated interview questions',
    'Instant feedback on answers',
    'Coding challenges with review',
    'Performance analytics dashboard',
    'Resume-based question generator',
    'Voice interview mode',
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-600 via-primary-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-float"
              style={{ width: `${60 + i * 50}px`, height: `${60 + i * 50}px`, right: `${5 + i * 12}%`, bottom: `${10 + i * 15}%`, animationDelay: `${i * 0.7}s` }} />
          ))}
        </div>
        <div className="relative text-white max-w-md">
          <h2 className="text-4xl font-black mb-4">Start Your Journey</h2>
          <p className="text-primary-200 text-lg leading-relaxed mb-10">Join thousands of developers who have already accelerated their interview success with AI-powered practice.</p>
          <div className="space-y-3">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-3">
                <FiCheckCircle className="text-green-400 flex-shrink-0" size={18} />
                <span className="text-primary-100 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto lg:max-w-lg">
        <div className="w-full max-w-md py-8">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <FiMonitor className="text-white" size={16} />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">AI Interview Prep</span>
            </Link>
            <button onClick={toggleTheme} className="btn-icon text-gray-500">
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  type="text" placeholder="Your full name" className="input-field pl-12" />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com" className="input-field pl-12" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="input-field pl-12 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('confirmPassword', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })}
                  type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" className="input-field pl-12" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Free Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
