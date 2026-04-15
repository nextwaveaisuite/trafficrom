import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Mail, Lock, Eye, EyeOff, User, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onLogin = async (data) => {
    setIsLoading(true);
    setServerError('');
    const { data: authData, error } = await signIn({ email: data.email, password: data.password });
    if (error) {
      setServerError('Invalid email or password.');
      setIsLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();
    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setServerError('Access denied. This account does not have admin privileges.');
      setIsLoading(false);
      return;
    }
    navigate('/admin');
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    setServerError('');
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    if (error) {
      setServerError(error.message);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setTab('created');
  };

  const inputStyle = {
    background: '#151d30',
    border: '1px solid #1e2840',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#f0f4ff',
    fontFamily: 'DM Sans',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0a0e1a' }}>
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: '#e11d48' }} />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
            <Shield size={26} style={{ color: '#e11d48' }} />
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Admin Console</h1>
          <p style={{ color: '#8899bb', fontSize: 13 }}>Traffic ROM — NextWave AI Suite</p>
        </div>

        {tab !== 'created' && (
          <div className="flex mb-5 rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
            <button onClick={() => { setTab('login'); setServerError(''); reset(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
              style={{ background: tab === 'login' ? '#e11d48' : 'transparent', color: tab === 'login' ? '#fff' : '#8899bb', fontFamily: 'Syne' }}>
              <LogIn size={14} /> Sign In
            </button>
            <button onClick={() => { setTab('register'); setServerError(''); reset(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
              style={{ background: tab === 'register' ? '#e11d48' : 'transparent', color: tab === 'register' ? '#fff' : '#8899bb', fontFamily: 'Syne' }}>
              <UserPlus size={14} /> Create Account
            </button>
          </div>
        )}

        <div className="p-8 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>

          {/* Account Created */}
          {tab === 'created' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,212,120,0.15)' }}>
                <Shield size={26} style={{ color: '#00d478' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Account Created! ✅</h2>
              <p className="text-sm mb-4" style={{ color: '#8899bb' }}>
                One final step — run this in <strong style={{ color: '#f0f4ff' }}>Supabase → SQL Editor</strong> to grant admin access:
              </p>
              <div className="p-3 rounded-lg text-left mb-4" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
                <code className="text-xs" style={{ color: '#00d478', fontFamily: 'monospace' }}>
                  UPDATE public.profiles<br />
                  SET is_admin = true<br />
                  WHERE id = (<br />
                  &nbsp;&nbsp;SELECT id FROM auth.users<br />
                  &nbsp;&nbsp;WHERE email = 'your@email.com'<br />
                  );
                </code>
              </div>
              <p className="text-xs mb-5" style={{ color: '#8899bb' }}>
                Replace <strong style={{ color: '#f0f4ff' }}>your@email.com</strong> with the email you just registered.
              </p>
              <button onClick={() => setTab('login')}
                className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
                <LogIn size={14} /> Go to Sign In
              </button>
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <>
              {serverError && (
                <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {serverError}
                </div>
              )}
              <form onSubmit={handleSubmit(onLogin)} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Admin Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                    <input {...register('email', { required: 'Required' })} type="email"
                      placeholder="admin@yourdomain.com" style={{ ...inputStyle, paddingLeft: 38 }} autoComplete="new-email" />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                    <input {...register('password', { required: 'Required' })} type={showPass ? 'text' : 'password'}
                      placeholder="••••••••" style={{ ...inputStyle, paddingLeft: 38, paddingRight: 38 }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm disabled:opacity-50"
                  style={{ background: '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
                  {isLoading
                    ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                    : <><Shield size={15} /> Access Admin Console</>
                  }
                </button>
              </form>
            </>
          )}

          {/* Register */}
          {tab === 'register' && (
            <>
              {serverError && (
                <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {serverError}
                </div>
              )}
              <form onSubmit={handleSubmit(onRegister)} className="space-y-4" autoComplete="off">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>First Name</label>
                    <input {...register('firstName', { required: 'Required' })} placeholder="Craig" style={inputStyle} />
                    {errors.firstName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Last Name</label>
                    <input {...register('lastName', { required: 'Required' })} placeholder="Smith" style={inputStyle} />
                    {errors.lastName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Username</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                    <input {...register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
                      placeholder="admin_username" style={{ ...inputStyle, paddingLeft: 38 }} />
                  </div>
                  {errors.username && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.username.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                    <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                      type="email" placeholder="you@yourdomain.com" style={{ ...inputStyle, paddingLeft: 38 }} />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                    <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                      type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                      style={{ ...inputStyle, paddingLeft: 38, paddingRight: 38 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm disabled:opacity-50"
                  style={{ background: '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
                  {isLoading
                    ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                    : <><UserPlus size={15} /> Create Admin Account</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: '#8899bb' }}>Restricted access. Authorised personnel only.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
