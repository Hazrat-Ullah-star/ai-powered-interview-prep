/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from 'recharts';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [detailedRes, dashRes] = await Promise.all([
        analyticsAPI.getDetailed({ period }),
        analyticsAPI.getDashboard()
      ]);
      setData(detailedRes.data.data);
      setDashboard(dashRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [period]);

  const downloadPDF = async () => {
    const el = document.getElementById('reports-content');
    const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`interview-report-${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) return <DashboardLayout><LoadingSpinner text="Loading analytics..." /></DashboardLayout>;

  const radarData = [
    { subject: 'Technical', A: 75 }, { subject: 'Communication', A: 68 },
    { subject: 'Confidence', A: 80 }, { subject: 'Clarity', A: 72 },
    { subject: 'Relevance', A: 65 }, { subject: 'Grammar', A: 85 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in" id="reports-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Performance Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your interview progress and identify improvements</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl">
              {[['7', '7D'], ['30', '30D'], ['90', '90D']].map(([v, l]) => (
                <button key={v} onClick={() => setPeriod(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === v ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={downloadPDF} className="btn-secondary flex items-center gap-2 py-2">
              <FiDownload size={16} />Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Interviews', value: user?.stats?.totalInterviews || 0, icon: '🎯', color: 'from-primary-500 to-primary-600' },
            { label: 'Average Score', value: `${user?.stats?.averageScore || 0}%`, icon: '📊', color: 'from-green-500 to-emerald-600' },
            { label: 'Challenges Solved', value: user?.stats?.totalCodingChallenges || 0, icon: '💻', color: 'from-accent-500 to-cyan-600' },
            { label: 'Interviews in Period', value: data?.interviews?.length || 0, icon: '📅', color: 'from-purple-500 to-purple-600' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-lg`}>{icon}</div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trend */}
          <div className="card p-6">
            <h2 className="section-title mb-1">Score Trend</h2>
            <p className="section-subtitle mb-4 text-sm">Daily scores over {period} days</p>
            {dashboard?.weeklyScores?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dashboard.weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet. Complete interviews to see your trend.</div>}
          </div>

          {/* Category Breakdown */}
          <div className="card p-6">
            <h2 className="section-title mb-1">Category Scores</h2>
            <p className="section-subtitle mb-4 text-sm">Performance by interview category</p>
            {dashboard?.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis dataKey="_id" type="category" width={100} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="avgScore" name="Avg Score" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Complete more interviews to see breakdown.</div>}
          </div>

          {/* Skill Radar */}
          <div className="card p-6">
            <h2 className="section-title mb-1">Skill Analysis</h2>
            <p className="section-subtitle mb-4 text-sm">Multi-dimensional skill breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,102,241,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="card p-6">
            <h2 className="section-title mb-1">Score Distribution</h2>
            <p className="section-subtitle mb-4 text-sm">Interviews by score range</p>
            {data?.scoreDistribution ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Interviews" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                    {data.scoreDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet.</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
