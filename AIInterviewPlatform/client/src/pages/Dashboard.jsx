/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiMonitor, FiCode, FiBarChart2, FiTrendingUp, FiArrowRight, FiPlus, FiAward, FiClock } from 'react-icons/fi';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ScoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-accent-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <DashboardLayout><LoadingSpinner text="Loading dashboard..." /></DashboardLayout>;

  const statsCards = [
    { label: 'Total Interviews', value: user?.stats?.totalInterviews || 0, icon: FiMonitor, color: 'from-primary-500 to-primary-600', sub: 'Completed sessions' },
    { label: 'Average Score', value: `${user?.stats?.averageScore || 0}%`, icon: FiTrendingUp, color: 'from-green-500 to-emerald-600', sub: 'Overall performance' },
    { label: 'Coding Challenges', value: user?.stats?.totalCodingChallenges || 0, icon: FiCode, color: 'from-accent-500 to-cyan-600', sub: 'Problems solved' },
    { label: 'Day Streak', value: user?.stats?.streak || 0, icon: FiAward, color: 'from-orange-500 to-amber-600', sub: 'Consecutive days' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to practice today? Your next interview could be your dream job.</p>
          </div>
          <Link to="/interview/setup" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <FiPlus size={18} /> New Interview
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statsCards.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Score Trend */}
          <div className="xl:col-span-2 card p-6">
            <h2 className="section-title mb-1">Score Trend</h2>
            <p className="section-subtitle mb-6 text-sm">Your performance over time</p>
            {data?.weeklyScores?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-400 flex-col gap-3">
                <FiBarChart2 size={40} className="opacity-30" />
                <p className="text-sm">Complete your first interview to see trends</p>
                <Link to="/interview/setup" className="btn-primary py-2 px-4 text-sm">Start Interview</Link>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="card p-6">
            <h2 className="section-title mb-1">By Category</h2>
            <p className="section-subtitle mb-6 text-sm">Interview distribution</p>
            {data?.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    dataKey="count" nameKey="_id" paddingAngle={3}>
                    {data.categoryBreakdown.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-400 flex-col gap-2">
                <FiBarChart2 size={40} className="opacity-30" />
                <p className="text-sm text-center">No data yet. Complete interviews to see breakdown.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Recent */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Quick Start</h2>
            <div className="space-y-3">
              {[
                { label: 'Text Interview', sub: 'Type your answers', path: '/interview/setup', icon: FiMonitor, color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
                { label: 'Voice Interview', sub: 'Speak your answers', path: '/interview/voice', icon: '🎤', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
                { label: 'Coding Challenge', sub: 'Solve problems', path: '/coding', icon: FiCode, color: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400' },
                { label: 'Resume Upload', sub: 'Generate custom Q&A', path: '/resume', icon: '📄', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
              ].map(({ label, sub, path, icon: Icon, color }) => (
                <Link key={label} to={path} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
                    {typeof Icon === 'string' ? Icon : <Icon size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <FiArrowRight className="text-gray-400 group-hover:text-primary-500 transition-colors" size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Interviews */}
          <div className="xl:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Interviews</h2>
              <Link to="/reports" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">View all</Link>
            </div>
            {data?.recentInterviews?.length > 0 ? (
              <div className="space-y-3">
                {data.recentInterviews.map((interview) => (
                  <div key={interview._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiMonitor className="text-white" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{interview.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="badge-primary text-xs">{interview.category?.split(' ')[0]}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock size={11} /> {interview.duration ? `${Math.round(interview.duration / 60)}m` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className={`text-xl font-black ${ScoreColor(interview.overallScore)}`}>
                      {interview.overallScore}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiMonitor size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No interviews yet</p>
                <p className="text-gray-400 text-sm mb-4">Start your first interview to track progress</p>
                <Link to="/interview/setup" className="btn-primary py-2 px-4 text-sm">Start Now</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
