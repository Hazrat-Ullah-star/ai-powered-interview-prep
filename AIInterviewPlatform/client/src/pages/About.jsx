import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FiMonitor, FiTarget, FiUsers, FiAward } from 'react-icons/fi';

const About = () => (
  <div className="min-h-screen bg-white dark:bg-dark-900">
    <Navbar />
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">
      <div className="text-center">
        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">About <span className="gradient-text">AI Interview Prep</span></h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">A final-year project built to democratize interview preparation using cutting-edge AI technology.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: FiMonitor, title: 'AI-Powered Questions', desc: 'Generate 10,000+ unique questions using Google Gemini AI, tailored to your specific role, experience level, and interview type.', color: 'from-primary-500 to-indigo-500' },
          { icon: FiTarget, title: 'Real-time Feedback', desc: 'Get instant, detailed feedback on grammar, technical accuracy, communication quality, and confidence scores after every answer.', color: 'from-green-500 to-teal-500' },
          { icon: FiUsers, title: 'Community Driven', desc: 'Learn alongside thousands of developers. Compare your performance on the leaderboard and celebrate achievements together.', color: 'from-accent-500 to-blue-500' },
          { icon: FiAward, title: 'Track Progress', desc: 'See your improvement over time with detailed analytics, skill radar charts, and personalized AI career suggestions.', color: 'from-orange-500 to-red-500' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card p-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Icon className="text-white" size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Built As Final Year Project 🎓</h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
          This platform was built using the MERN Stack (MongoDB, Express, React, Node.js) with Google Gemini AI integration, JWT authentication, and modern UI/UX design principles. It demonstrates full-stack development skills including REST API design, real-time features, file uploads, and data visualization.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'Google Gemini AI', 'JWT Auth', 'Recharts', 'Monaco Editor'].map(t => (
            <span key={t} className="badge-primary">{t}</span>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
