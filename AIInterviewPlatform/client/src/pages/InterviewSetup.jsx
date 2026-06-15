import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { FiMonitor, FiArrowRight } from 'react-icons/fi';

const categories = ['Frontend Development', 'Backend Development', 'Full Stack Development', 'Cybersecurity', 'Data Science', 'HR Interview'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const types = ['Technical', 'HR', 'Mixed'];
const modes = [
  { value: 'text', label: '📝 Text Mode', desc: 'Type your answers and receive instant AI feedback' },
  { value: 'voice', label: '🎤 Voice Mode', desc: 'Speak your answers using your microphone' },
];
const counts = [5, 8, 10, 15];

const SelectGroup = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${value === opt
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
            : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    category: 'Frontend Development',
    difficulty: 'Intermediate',
    type: 'Technical',
    mode: 'text',
    count: 10,
  });

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await interviewAPI.generate(config);
      toast.success('Interview generated! Good luck 🚀');
      if (config.mode === 'voice') {
        navigate(`/interview/voice/${data.interview._id}`);
      } else {
        navigate(`/interview/text/${data.interview._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate interview. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Setup Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your AI-powered interview session</p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Category */}
          <SelectGroup label="📁 Interview Category" options={categories} value={config.category} onChange={v => set('category', v)} />

          {/* Difficulty */}
          <SelectGroup label="📊 Difficulty Level" options={difficulties} value={config.difficulty} onChange={v => set('difficulty', v)} />

          {/* Type */}
          <SelectGroup label="🎯 Interview Type" options={types} value={config.type} onChange={v => set('type', v)} />

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🔢 Number of Questions</label>
            <div className="flex gap-2">
              {counts.map(c => (
                <button key={c} type="button" onClick={() => set('count', c)}
                  className={`w-14 h-14 rounded-xl text-sm font-bold transition-all duration-200 ${config.count === c
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🖥️ Interview Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modes.map(({ value, label, desc }) => (
                <button key={value} type="button" onClick={() => set('mode', value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${config.mode === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'}`}>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-800 dark:text-primary-300 mb-3 text-sm">📋 Interview Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[['Category', config.category], ['Difficulty', config.difficulty], ['Type', config.type], ['Questions', config.count], ['Mode', config.mode]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{k}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg">
            {loading ? (
              <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating with AI...</>
            ) : (
              <><FiMonitor size={20} /> Start Interview <FiArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewSetup;
