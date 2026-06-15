/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/purity */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, answerAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiSend, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const FeedbackPanel = ({ feedback, onNext, isLast }) => {
  const scoreColor = (s) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-accent-500' : s >= 40 ? 'text-yellow-500' : 'text-red-500';
  const metrics = [
    { label: 'Grammar', key: 'grammar' }, { label: 'Technical', key: 'technicalCorrectness' },
    { label: 'Communication', key: 'communication' }, { label: 'Clarity', key: 'clarity' },
    { label: 'Relevance', key: 'relevance' }, { label: 'Confidence', key: 'confidence' },
  ];
  return (
    <div className="space-y-6 slide-in">
      {/* Overall Score */}
      <div className="card p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Overall Score</p>
        <div className={`text-6xl font-black ${scoreColor(feedback.score)}`}>{feedback.score}<span className="text-2xl text-gray-400">/100</span></div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed">{feedback.summary}</p>
      </div>

      {/* Metric Scores */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {metrics.map(({ label, key }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">{label}</span>
                <span className={`font-bold ${scoreColor(feedback[key] || 0)}`}>{feedback[key] || 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                  style={{ width: `${feedback[key] || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feedback.strengths?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">✅ Strengths</h3>
            <ul className="space-y-2">{feedback.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2"><span className="text-green-500 flex-shrink-0">•</span>{s}</li>)}</ul>
          </div>
        )}
        {feedback.improvements?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-orange-500 dark:text-orange-400 mb-3 flex items-center gap-2">💡 Improvements</h3>
            <ul className="space-y-2">{feedback.improvements.map((s, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2"><span className="text-orange-400 flex-shrink-0">•</span>{s}</li>)}</ul>
          </div>
        )}
      </div>

      {/* Suggested Answer */}
      {feedback.suggestedAnswer && (
        <div className="card p-5 border-l-4 border-primary-500">
          <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2">💡 Suggested Answer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feedback.suggestedAnswer}</p>
        </div>
      )}

      <button onClick={onNext} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
        {isLast ? (<><FiCheckCircle size={18} /> Complete Interview</>) : (<>Next Question <FiArrowRight size={18} /></>)}
      </button>
    </div>
  );
};

const TextInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
  const timerRef = useRef(null);

  const loadInterview = async () => {
    try {
      const { data } = await interviewAPI.getById(id);
      setInterview(data.interview);
      await interviewAPI.start(id);
    } catch {
      toast.error('Failed to load interview');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterview();
    timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [id]);

  const currentQ = interview?.questions?.[currentIdx];
  const isLast = currentIdx === (interview?.questions?.length || 1) - 1;

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Please write an answer before submitting');
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
      const { data } = await answerAPI.submit({
        interviewId: id,
        questionId: currentQ._id,
        questionText: currentQ.text,
        answerText: answer,
        mode: 'text',
        timeTaken
      });
      setFeedback(data.answer.feedback);
      setAnswers(prev => [...prev, data.answer]);
    } catch {
      toast.error('Failed to analyze answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isLast) {
      await completeInterview();
    } else {
      setCurrentIdx(i => i + 1);
      setAnswer('');
      setFeedback(null);
      setQuestionStartTime(Date.now());
    }
  };

  const completeInterview = async () => {
    const avgScore = answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.feedback.score, 0) / answers.length) : 0;
    try {
      await interviewAPI.complete(id, { overallScore: avgScore, duration: timeElapsed, feedback: { summary: 'Interview completed.' } });
      toast.success(`Interview complete! Score: ${avgScore}%`);
      navigate('/reports');
    } catch { toast.error('Failed to save results'); }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <DashboardLayout><LoadingSpinner text="Loading your interview..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in">
        {/* Header */}
        <div className="card p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">{interview?.title}</h2>
            <div className="flex gap-2 mt-1">
              <span className="badge-primary">{interview?.category?.split(' ')[0]}</span>
              <span className="badge-yellow">{interview?.difficulty}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-400">Question</p>
              <p className="font-bold text-gray-900 dark:text-white">{currentIdx + 1}/{interview?.questions?.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Time</p>
              <p className="font-bold text-accent-500 font-mono">{fmt(timeElapsed)}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + (feedback ? 1 : 0)) / interview?.questions?.length) * 100}%` }} />
        </div>

        {!feedback ? (
          <>
            {/* Question */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentIdx + 1}
                </div>
                <div>
                  <p className="text-xs text-primary-500 font-semibold mb-2">QUESTION {currentIdx + 1}</p>
                  <p className="text-gray-900 dark:text-white font-medium text-lg leading-relaxed">{currentQ?.text}</p>
                  {currentQ?.tags?.length > 0 && (
                    <div className="flex gap-2 mt-3">{currentQ.tags.map(t => <span key={t} className="badge bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400">{t}</span>)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="card p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Answer</label>
              <textarea
                value={answer} onChange={e => setAnswer(e.target.value)}
                rows={8} placeholder="Type your detailed answer here... Be as thorough as possible for better AI feedback."
                className="input-field resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">{answer.length} characters</p>
                <button onClick={handleSubmit} disabled={submitting || !answer.trim()} className="btn-primary flex items-center gap-2">
                  {submitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>) : (<><FiSend size={16} />Submit Answer</>)}
                </button>
              </div>
            </div>
          </>
        ) : (
          <FeedbackPanel feedback={feedback} onNext={handleNext} isLast={isLast} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TextInterview;
