import { Link } from 'react-router-dom';
import { FiMonitor, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-dark-900 text-gray-400 py-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            <FiMonitor className="text-white" size={16} />
          </div>
          <span className="font-bold text-white text-lg">AI Interview Prep</span>
        </div>
        <p className="text-sm leading-relaxed max-w-md">
          Ace your next interview with AI-powered practice sessions, real-time feedback, and comprehensive performance analytics.
        </p>
        <div className="flex gap-4 mt-6">
          {[FiGithub, FiLinkedin, FiTwitter].map((Icon, i) => (
            <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Platform</h4>
        <ul className="space-y-2 text-sm">
          {[['Dashboard', '/dashboard'], ['Interviews', '/interview/setup'], ['Coding', '/coding'], ['Analytics', '/reports']].map(([label, path]) => (
            <li key={path}><Link to={path} className="hover:text-primary-400 transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm">
          {[['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, path]) => (
            <li key={label}><Link to={path} className="hover:text-primary-400 transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-6 text-center text-sm">
      <p>© {new Date().getFullYear()} AI Interview Prep. All rights reserved. Built for FYP 🚀</p>
    </div>
  </footer>
);

export default Footer;
