import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiAward } from 'react-icons/fi';

const Leaderboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getLeaderboard().then(({ data }) => setUsers(data.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">🏆 Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Top performers ranked by average interview score</p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div key={u._id} className={`card p-5 flex items-center gap-4 transition-all ${u._id === user?._id ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <div className="w-10 text-center text-2xl flex-shrink-0">{i < 3 ? medals[i] : <span className="text-gray-400 font-bold text-lg">#{i + 1}</span>}</div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name} {u._id === user?._id && <span className="badge-primary ml-2">You</span>}</p>
                  <p className="text-xs text-gray-400">{u.stats?.totalInterviews || 0} interviews completed</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-black ${u.stats?.averageScore >= 80 ? 'text-green-500' : u.stats?.averageScore >= 60 ? 'text-accent-500' : 'text-yellow-500'}`}>
                    {u.stats?.averageScore || 0}%
                  </p>
                  <p className="text-xs text-gray-400">avg score</p>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="card p-16 text-center">
                <FiAward size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500">No leaderboard data yet. Be the first to complete an interview!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
