import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { FiUpload, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF file');

    setUploading(true);
    setParsed(null);
    setQuestions([]);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await resumeAPI.upload(formData);
      setParsed(data.parsed);
      toast.success('Resume parsed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const { data } = await resumeAPI.generateQuestions();
      setQuestions(data.questions);
      toast.success(`Generated ${data.questions.length} personalized questions!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">📄 Resume-Based Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your resume to get personalized interview questions based on your skills</p>
        </div>

        {/* Upload Zone */}
        <div {...getRootProps()} className={`card p-12 border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
          <input {...getInputProps()} />
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDragActive ? 'bg-primary-500' : 'bg-gray-100 dark:bg-dark-700'}`}>
            {uploading ? <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /> :
              <FiUpload className={isDragActive ? 'text-white' : 'text-gray-400'} size={28} />}
          </div>
          {uploading ? <p className="font-semibold text-primary-600">Parsing your resume with AI...</p> : (
            <>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}</p>
              <p className="text-gray-400 text-sm">or click to browse • PDF only • Max 10MB</p>
            </>
          )}
        </div>

        {/* Parsed Results */}
        {parsed && (
          <div className="card p-6 space-y-5 slide-in">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-green-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume Analyzed!</h2>
            </div>

            {parsed.summary && <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-dark-700 p-4 rounded-xl">{parsed.summary}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: '💻 Technical Skills', items: parsed.technicalSkills },
                { label: '🛠️ Frameworks', items: parsed.frameworks },
                { label: '📝 Languages', items: parsed.programmingLanguages },
                { label: '🗄️ Databases', items: parsed.databases },
              ].filter(({ items }) => items?.length > 0).map(({ label, items }) => (
                <div key={label} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(s => <span key={s} className="badge-primary">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Experience Level</p>
                <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.experience || 'Not detected'}</p>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Suggested Role</p>
                <p className="font-bold text-gray-900 dark:text-white">{parsed.targetRole || 'Not detected'}</p>
              </div>
            </div>

            <button onClick={generateQuestions} disabled={generating} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {generating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</> : <><FiArrowRight size={18} />Generate Interview Questions</>}
            </button>
          </div>
        )}

        {/* Generated Questions */}
        {questions.length > 0 && (
          <div className="space-y-3 slide-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Your Personalized Questions ({questions.length})</h2>
            {questions.map((q, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white leading-relaxed">{q.text}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {q.skill && <span className="badge-accent">{q.skill}</span>}
                      {q.difficulty && <span className={q.difficulty === 'Beginner' ? 'badge-green' : q.difficulty === 'Advanced' ? 'badge-red' : 'badge-yellow'}>{q.difficulty}</span>}
                      {q.type && <span className="badge-primary">{q.type}</span>}
                    </div>
                    {q.expectedAnswer && (
                      <details className="mt-3">
                        <summary className="text-xs text-primary-500 cursor-pointer font-semibold">Show key points</summary>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{q.expectedAnswer}</p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeUpload;
