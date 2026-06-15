/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { codingAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiCode, FiCheckCircle } from 'react-icons/fi';

const diffColors = { Easy: 'badge-green', Medium: 'badge-yellow', Hard: 'badge-red' };

const CodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ difficulty: '', category: '' });

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data } = await codingAPI.getAll(filter);
      setChallenges(data.challenges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Coding Challenges</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Practice coding problems and get AI code reviews</p>
          </div>
          <div className="flex gap-3">
            <select value={filter.difficulty} onChange={e => setFilter(p => ({ ...p, difficulty: e.target.value }))}
              className="select-field w-36 py-2 text-sm">
              <option value="">All Levels</option>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[['Easy', 'text-green-500', challenges.filter(c => c.difficulty === 'Easy').length],
            ['Medium', 'text-yellow-500', challenges.filter(c => c.difficulty === 'Medium').length],
            ['Hard', 'text-red-500', challenges.filter(c => c.difficulty === 'Hard').length]].map(([d, color, count]) => (
            <div key={d} className="card p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{d}</p>
            </div>
          ))}
        </div>

        {loading ? <LoadingSpinner text="Loading challenges..." /> : (
          challenges.length === 0 ? (
            <div className="card p-16 text-center">
              <FiCode size={56} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Challenges Yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Challenges will be added by admins. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((c, i) => (
                <Link key={c._id} to={`/coding/${c._id}`}
                  className="card p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 group block">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-xl flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{c.title}</h3>
                      {c.solved && <span className="badge-green flex items-center gap-1"><FiCheckCircle size={10} />Solved</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={diffColors[c.difficulty]}>{c.difficulty}</span>
                      <span className="text-xs text-gray-400">{c.category}</span>
                      {c.tags?.slice(0, 2).map(t => <span key={t} className="text-xs badge bg-gray-100 dark:bg-dark-700 text-gray-500">{t}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.acceptanceRate}%</p>
                    <p className="text-xs text-gray-400">acceptance</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default CodingChallenges;
