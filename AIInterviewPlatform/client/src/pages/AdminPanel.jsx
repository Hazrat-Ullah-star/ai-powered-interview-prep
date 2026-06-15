/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUsers, FiTrash2, FiShield, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';

const AdminPanel = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const { data } = await adminAPI.getUsers({ search });
        setUsers(data.users);
      } else {
        const { data } = await adminAPI.getAnalytics();
        setStats(data);
      }
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const toggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to toggle user'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const promoteUser = async (id) => {
    if (!window.confirm('Promote this user to admin?')) return;
    try {
      await adminAPI.promoteUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: 'admin' } : u));
      toast.success('User promoted to admin');
    } catch { toast.error('Failed to promote user'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">🛡️ Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and view platform analytics</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['Total Users', stats.stats.totalUsers, '👥', 'from-primary-500 to-primary-600'],
              ['Total Interviews', stats.stats.totalInterviews, '🎯', 'from-green-500 to-emerald-600'],
              ['Challenges', stats.stats.totalChallenges, '💻', 'from-accent-500 to-cyan-600'],
              ['Submissions', stats.stats.totalSubmissions, '📤', 'from-purple-500 to-purple-600'],
              ['New This Week', stats.stats.newUsersThisWeek, '🆕', 'from-orange-500 to-amber-600'],
              ['Platform Avg', `${stats.stats.platformAvgScore}%`, '📊', 'from-red-500 to-rose-600'],
            ].map(([label, value, emoji, color]) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-xl mb-3`}>{emoji}</div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit">
          {[['users', '👥 Users'], ['analytics', '📊 Analytics']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
                  placeholder="Search users by name or email..." className="input-field pl-10 py-2.5 text-sm" />
              </div>
              <button onClick={fetchData} className="btn-secondary py-2.5 px-4 text-sm">Search</button>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-700">
                      <tr>
                        {['User', 'Role', 'Interviews', 'Avg Score', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={u.role === 'admin' ? 'badge-red' : 'badge-primary'}>{u.role}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{u.stats?.totalInterviews || 0}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{u.stats?.averageScore || 0}%</td>
                          <td className="px-5 py-4">
                            <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => toggleUser(u._id)} title="Toggle status"
                                className="btn-icon text-gray-400 hover:text-primary-500">
                                {u.isActive ? <FiToggleRight size={18} className="text-green-500" /> : <FiToggleLeft size={18} />}
                              </button>
                              {u.role !== 'admin' && (
                                <button onClick={() => promoteUser(u._id)} title="Promote to admin"
                                  className="btn-icon text-gray-400 hover:text-primary-500"><FiShield size={16} /></button>
                              )}
                              <button onClick={() => deleteUser(u._id, u.name)} title="Delete user"
                                className="btn-icon text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <FiUsers size={40} className="mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          loading ? <LoadingSpinner /> : (
            <div className="card p-6">
              <h2 className="section-title mb-4">Recent Interviews Platform-wide</h2>
              {stats?.recentInterviews?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentInterviews.map(i => (
                    <div key={i._id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{i.title}</p>
                        <p className="text-xs text-gray-400">{i.user?.name} • {i.user?.email}</p>
                      </div>
                      <span className={`badge ${i.difficulty === 'Beginner' ? 'badge-green' : i.difficulty === 'Advanced' ? 'badge-red' : 'badge-yellow'}`}>{i.difficulty}</span>
                      <span className={`text-lg font-black ${i.overallScore >= 70 ? 'text-green-500' : i.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{i.overallScore}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-8">No interview data yet.</p>}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
