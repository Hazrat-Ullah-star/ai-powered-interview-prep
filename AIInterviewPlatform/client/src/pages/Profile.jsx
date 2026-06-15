import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { FiUser, FiCamera, FiLock, FiSave } from 'react-icons/fi';

const SKILLS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'SQL', 'Docker', 'AWS', 'GraphQL', 'Vue.js', 'Angular', 'Java', 'C++', 'Go', 'Redis', 'Kubernetes'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({ fullName: '', bio: '', targetRole: '', experience: 'fresher', skills: [] });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => setForm({ fullName: user.fullName || '', bio: user.bio || '', targetRole: user.targetRole || '', experience: user.experience || 'fresher', skills: user.skills || [] }));
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await userAPI.uploadAvatar(formData);
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const payload = { ...form, skills: JSON.stringify(form.skills) };
      const { data } = await userAPI.updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const toggleSkill = (skill) => {
    setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }));
  };

  const avatarSrc = avatarPreview || (user?.avatar ? `http://localhost:5000${user.avatar}` : null);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Profile</h1>

        {/* Avatar Section */}
        <div className="card p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg">
              {avatarSrc ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" /> : user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
              <FiCamera className="text-white" size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-red' : 'badge-primary'}`}>{user?.role}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[['Interviews', user?.stats?.totalInterviews || 0, '🎯'], ['Avg Score', `${user?.stats?.averageScore || 0}%`, '📊'], ['Challenges', user?.stats?.totalCodingChallenges || 0, '💻']].map(([l, v, e]) => (
            <div key={l} className="card p-4 text-center">
              <div className="text-2xl mb-1">{e}</div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{v}</div>
              <div className="text-xs text-gray-400">{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl">
          {[['profile', '👤 Profile', FiUser], ['security', '🔒 Security', FiLock]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card p-6 space-y-5 slide-in">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
              <input value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} className="input-field" placeholder="e.g. Full Stack Developer" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
              <select value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} className="select-field">
                {['fresher', 'junior', 'mid', 'senior', 'lead'].map(e => <option key={e} value={e} className="capitalize">{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Skills (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.skills.includes(s) ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><FiSave size={16} />Save Changes</>}
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="card p-6 space-y-5 slide-in">
            <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm Password'}
                </label>
                <input type="password" value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))} className="input-field" />
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : <><FiLock size={16} />Update Password</>}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
