/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { codingAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { FiPlay, FiRefreshCw } from 'react-icons/fi';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];

const CodingChallenge = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchChallenge = async () => {
    try {
      const { data } = await codingAPI.getById(id);
      setChallenge(data.challenge);
      setCode(data.challenge.starterCode?.[language] || '// Write your solution here\n');
    } catch {
      toast.error('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(challenge?.starterCode?.[lang] || `// Write your ${lang} solution here\n`);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!code.trim() || code.includes('Write your solution')) return toast.error('Please write your solution first');
    setSubmitting(true);
    try {
      const { data } = await codingAPI.submit(id, { code, language });
      setResult(data.submission);
      toast.success(`Submission analyzed! Score: ${data.submission.aiReview?.score}/100`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner text="Loading challenge..." /></DashboardLayout>;

  const diffColor = challenge?.difficulty === 'Easy' ? 'badge-green' : challenge?.difficulty === 'Medium' ? 'badge-yellow' : 'badge-red';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in">
        {/* Header */}
        <div className="card p-4 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-bold text-gray-900 dark:text-white">{challenge?.title}</h1>
              <span className={diffColor}>{challenge?.difficulty}</span>
            </div>
            <div className="flex gap-2 mt-1">{challenge?.tags?.map(t => <span key={t} className="badge bg-gray-100 dark:bg-dark-700 text-gray-500 text-xs">{t}</span>)}</div>
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => handleLanguageChange(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === l ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Problem Description */}
          <div className="card p-6 overflow-y-auto">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Problem Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-6">{challenge?.description}</p>

            {challenge?.examples?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Examples</h3>
                {challenge.examples.map((ex, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 mb-3 font-mono text-sm">
                    <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold text-primary-600">Input:</span> {ex.input}</p>
                    <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold text-green-600">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-gray-500 mt-1 text-xs">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {challenge?.constraints?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Constraints</h3>
                <ul className="space-y-1">{challenge.constraints.map((c, i) => <li key={i} className="text-sm text-gray-500 dark:text-gray-400 font-mono">• {c}</li>)}</ul>
              </div>
            )}

            {/* Test Cases */}
            {challenge?.testCases?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Cases</h3>
                {challenge.testCases.map((tc, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 mb-2 text-xs font-mono">
                    <span className="text-primary-600">Input:</span> {tc.input} → <span className="text-green-600">Expected:</span> {tc.expectedOutput}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor + Results */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Monaco Editor */}
            <div className="flex-1 card overflow-hidden min-h-0" style={{ minHeight: result ? '300px' : '400px' }}>
              <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-dark-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Solution — {language}</span>
                <button onClick={() => { setCode(challenge?.starterCode?.[language] || ''); setResult(null); }}
                  className="btn-icon text-gray-400 hover:text-gray-600"><FiRefreshCw size={14} /></button>
              </div>
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={setCode}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, fontFamily: 'JetBrains Mono, Fira Code, monospace', padding: { top: 16 } }}
              />
            </div>

            {/* Submit */}
            <div className="card p-4 flex-shrink-0">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI Reviewing...</> : <><FiPlay size={16} />Submit & Get AI Review</>}
              </button>
            </div>

            {/* AI Review Result */}
            {result?.aiReview && (
              <div className="card p-5 flex-shrink-0 space-y-3 overflow-y-auto max-h-64">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Code Review</h3>
                  <div className={`text-2xl font-black ${result.aiReview.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>{result.aiReview.score}/100</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-2">⏱ Time: <span className="font-semibold">{result.aiReview.timeComplexity}</span></div>
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-2">💾 Space: <span className="font-semibold">{result.aiReview.spaceComplexity}</span></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{result.aiReview.summary}</p>
                {result.aiReview.suggestions?.length > 0 && (
                  <ul className="space-y-1">{result.aiReview.suggestions.map((s, i) => <li key={i} className="text-xs text-gray-500 flex gap-2"><span className="text-primary-500">→</span>{s}</li>)}</ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CodingChallenge;
