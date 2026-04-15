import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { User, Mail, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle, Copy, Link } from 'lucide-react';

const AccountSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      username: profile?.username || '',
    }
  });

  const passwordForm = useForm();

  const showMessage = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const saveProfile = async (data) => {
    setSaving(true);
    // Check username not taken
    if (data.username !== profile?.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', data.username)
        .neq('id', user.id)
        .single();
      if (existing) {
        showMessage('Username is already taken. Please choose another.', 'error');
        setSaving(false);
        return;
      }
    }
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: data.first_name, last_name: data.last_name, username: data.username })
      .eq('id', user.id);
    setSaving(false);
    if (error) showMessage('Failed to save. Please try again.', 'error');
    else { showMessage('Profile updated successfully!'); refreshProfile(); }
  };

  const changePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    setSaving(false);
    if (error) showMessage(error.message, 'error');
    else { showMessage('Password changed successfully!'); passwordForm.reset(); }
  };

  const referralLink = `${window.location.origin}/register?ref=${profile?.username}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: 'profile',  label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'referral', label: 'Referral Link' },
    { id: 'account',  label: 'Account' },
  ];

  const inputStyle = 'input';

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Account Settings</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Manage your profile, password and preferences</p>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-5" style={{ background: msgType === 'success' ? 'rgba(0,212,120,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msgType === 'success' ? 'rgba(0,212,120,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          {msgType === 'success' ? <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> : <AlertCircle size={15} style={{ color: '#f87171' }} />}
          <p className="text-sm" style={{ color: msgType === 'success' ? 'var(--brand-green)' : '#f87171' }}>{msg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: activeTab === tab.id ? 'rgba(0,212,120,0.12)' : 'var(--bg-secondary)', color: activeTab === tab.id ? 'var(--brand-green)' : 'var(--text-muted)', border: `1px solid ${activeTab === tab.id ? 'rgba(0,212,120,0.4)' : 'var(--border)'}` }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'rgba(0,212,120,0.15)', color: 'var(--brand-green)' }}>
              {(profile?.first_name?.[0] || profile?.username?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <p className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{profile?.username} · {profile?.membership_tier} plan</p>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...profileForm.register('first_name', { required: 'Required' })} className={inputStyle} />
                {profileForm.formState.errors.first_name && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{profileForm.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...profileForm.register('last_name', { required: 'Required' })} className={inputStyle} />
                {profileForm.formState.errors.last_name && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{profileForm.formState.errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input {...profileForm.register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 characters' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and _ only' } })} className={`${inputStyle} pl-9`} />
              </div>
              {profileForm.formState.errors.username && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{profileForm.formState.errors.username.message}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your referral link uses your username.</p>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={user?.email || ''} readOnly className={`${inputStyle} pl-9 opacity-60 cursor-not-allowed`} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed. Contact support if needed.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
              {saving ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} /> : <><Save size={14} /> Save Profile</>}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {activeTab === 'password' && (
        <div className="card p-6">
          <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input {...passwordForm.register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showNewPass ? 'text' : 'password'} placeholder="Min 8 characters" className={`${inputStyle} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input {...passwordForm.register('confirmPassword', { required: 'Required' })}
                  type={showPass ? 'text' : 'password'} placeholder="Repeat new password" className={`${inputStyle} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
              {saving ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} /> : <><Lock size={14} /> Change Password</>}
            </button>
          </form>
        </div>
      )}

      {/* Referral link tab */}
      {activeTab === 'referral' && (
        <div className="card p-6">
          <h2 className="font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Your Referral Link</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Share this link and earn <strong style={{ color: 'var(--brand-green)' }}>50 bonus credits</strong> every time someone signs up using it.</p>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={referralLink} readOnly className={`${inputStyle} pl-9 text-sm`} onClick={e => e.target.select()} />
            </div>
            <button onClick={copyReferralLink} className="btn-primary flex items-center gap-2 text-sm py-2 px-4 shrink-0">
              {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[['50', 'Credits per signup'], ['Instant', 'Credited automatically'], ['Unlimited', 'Referrals allowed']].map(([val, label]) => (
              <div key={label} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{val}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Account Information</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Member ID', user?.id?.slice(0, 8) + '...'],
                ['Email', user?.email],
                ['Plan', profile?.membership_tier?.charAt(0).toUpperCase() + profile?.membership_tier?.slice(1)],
                ['Credits', profile?.credits?.toLocaleString()],
                ['Total Campaigns Sent', profile?.total_emails_sent?.toLocaleString() || '0'],
                ['Member Since', profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <h2 className="font-bold mb-1" style={{ fontFamily: 'Syne', color: '#f87171' }}>Danger Zone</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and all associated data. This cannot be undone.</p>
            <button onClick={() => window.confirm('Are you sure? This will permanently delete your account.') && alert('Please contact support@nextwaveaisuite.com to delete your account.')}
              className="text-sm px-4 py-2 rounded-lg font-semibold transition-all"
              style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', background: 'rgba(239,68,68,0.06)' }}>
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
