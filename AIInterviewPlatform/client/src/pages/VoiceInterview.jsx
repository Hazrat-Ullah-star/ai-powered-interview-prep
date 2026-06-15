import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI, answerAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { FiMic, FiMicOff, FiSkipForward, FiSquare, FiPlay } from 'react-icons/fi';

const VoiceInterview = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup | active | completed
  const [config, setConfig] = useState({ category: 'Frontend Development', difficulty: 'Intermediate', type: 'Technical', count: 5 });
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 min per question
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startInterview = async () => {
    setLoading(true);
    try {
      const { data } = await interviewAPI.generate({ ...config, mode: 'voice' });
      setInterview(data.interview);
      await interviewAPI.start(data.interview._id);
      setStep('active');
      setTimeLeft(120);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate interview');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error('Speech recognition not supported in this browser. Use Chrome.');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) setTranscript(prev => prev + final);
    };
    recognition.onerror = () => toast.error('Microphone error. Check permissions.');
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { stopAndSubmit(); return 120; }
        return t - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const stopAndSubmit = async () => {
    stopRecording();
    const q = interview?.questions?.[currentIdx];
    if (!q) return;
    try {
      const { data } = await answerAPI.submit({
        interviewId: interview._id, questionId: q._id, questionText: q.text,
        answerText: transcript || '[No answer recorded]', mode: 'voice', timeTaken: 120 - timeLeft
      });
      setAnswers(prev => [...prev, data.answer]);
      toast.success(`Answer scored: ${data.answer.feedback.score}/100`);
    } catch { toast.error('Failed to analyze answer'); }
    if (currentIdx + 1 >= interview.questions.length) {
      await completeInterview();
    } else {
      setCurrentIdx(i => i + 1);
      setTranscript('');
      setTimeLeft(120);
    }
  };

  const completeInterview = async () => {
    const avgScore = answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.feedback.score, 0) / answers.length) : 0;
    try {
      await interviewAPI.complete(interview._id, { overallScore: avgScore, duration: 0, feedback: { summary: 'Voice interview completed.' } });
      toast.success(`Voice interview done! Avg score: ${avgScore}%`);
      navigate('/reports');
    } catch { toast.error('Failed to save results'); }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pct = ((120 - timeLeft) / 120) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-in">
        {step === 'setup' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">🎤 Voice Interview</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Practice speaking your answers like a real interview</p>
            </div>
            <div className="card p-6 space-y-6">
              {[
                { label: 'Category', key: 'category', opts: ['Frontend Development', 'Backend Development', 'Data Science', 'HR Interview'] },
                { label: 'Difficulty', key: 'difficulty', opts: ['Beginner', 'Intermediate', 'Advanced'] },
                { label: 'Type', key: 'type', opts: ['Technical', 'HR', 'Mixed'] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  <div className="flex flex-wrap gap-2">
                    {opts.map(o => (
                      <button key={o} onClick={() => setConfig(p => ({ ...p, [key]: o }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${config[key] === o ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                ⚠️ Make sure your <strong>microphone is enabled</strong> in browser settings. Works best in Google Chrome.
              </div>
              <button onClick={startInterview} disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</> : <><FiMic size={20} />Start Voice Interview</>}
              </button>
            </div>
          </div>
        )}

        {step === 'active' && interview && (
          <div className="space-y-6">
            <div className="card p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{interview.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Question {currentIdx + 1} of {interview.questions.length}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-accent-500'}`}>{fmt(timeLeft)}</div>
                <p className="text-xs text-gray-400">remaining</p>
              </div>
            </div>

            {/* Timer Ring */}
            <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 30 ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                style={{ width: `${pct}%` }} />
            </div>

            {/* Question Card */}
            <div className="card p-6">
              <p className="text-xs text-primary-500 font-semibold mb-3">QUESTION {currentIdx + 1}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">{interview.questions[currentIdx]?.text}</p>
            </div>

            {/* Recording Area */}
            <div className="card p-8 text-center space-y-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-2xl shadow-red-500/50 animate-pulse' : 'bg-gray-100 dark:bg-dark-700'}`}>
                {isRecording ? <FiMic className="text-white" size={36} /> : <FiMicOff className="text-gray-400" size={36} />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{isRecording ? '🔴 Recording...' : 'Press to start recording'}</p>
                <p className="text-sm text-gray-500 mt-1">Speak clearly into your microphone</p>
              </div>
              {transcript && (
                <div className="text-left bg-gray-50 dark:bg-dark-700 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{transcript}"</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                {!isRecording ? (
                  <button onClick={startRecording} className="btn-primary flex items-center gap-2"><FiPlay size={16} />Start Recording</button>
                ) : (
                  <button onClick={stopRecording} className="btn-danger flex items-center gap-2"><FiSquare size={16} />Stop Recording</button>
                )}
                <button onClick={stopAndSubmit} className="btn-secondary flex items-center gap-2"><FiSkipForward size={16} />Submit & Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoiceInterview;
