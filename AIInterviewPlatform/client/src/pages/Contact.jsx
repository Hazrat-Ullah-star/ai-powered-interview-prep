import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import toast from 'react-hot-toast';
import { FiMail, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Message sent! We\'ll get back to you within 24 hours. 📬');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Get In <span className="gradient-text">Touch</span></h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">Have questions? We'd love to hear from you.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Info</h2>
              {[
                { icon: FiMail, title: 'Email', value: 'support@aiinterviewprep.com', color: 'from-primary-500 to-indigo-500' },
                { icon: FiUser, title: 'Developer', value: 'Rifet — FYP Student', color: 'from-green-500 to-teal-500' },
                { icon: FiMessageSquare, title: 'Response Time', value: 'Within 24 hours', color: 'from-accent-500 to-blue-500' },
              ].map(({ icon: Icon, title, value, color }) => (
                <div key={title} className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Your Name', field: 'name', icon: FiUser, placeholder: 'Full name', type: 'text' },
                { label: 'Email Address', field: 'email', icon: FiMail, placeholder: 'you@example.com', type: 'email' },
                { label: 'Subject', field: 'subject', icon: FiMessageSquare, placeholder: 'How can we help?', type: 'text' },
              ].map(({ label, field, icon: Icon, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder} required className="input-field pl-10" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={5} placeholder="Your message..." required className="input-field resize-none" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><FiSend size={16} />Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
