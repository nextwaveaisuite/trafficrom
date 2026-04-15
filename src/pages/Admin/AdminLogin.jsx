import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    const { data: authData, error } = await signIn({ email: data.email, password: data.password });
    if (error) {
      setServerError('Invalid credentials.');
      setIsLoading(false);
      return;
    }

    // Verify admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setServerError('Access denied. Admin privileges required.');
      setIsLoading(false);
      return;
    }

    navigate('/admin');
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
          <p style={{ color: '#8899bb' }}>Traffic ROM — NextWave AI Suite</p>
        </div>

        <div className="p-8 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
          {serverError && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                <input {...register('email', { required: 'Required' })} type="email" placeholder="admin@nextwaveaisuite.com" className="input pl-10" />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
                <input {...register('password', { required: 'Required' })} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all" style={{ background: '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
              {isLoading
                ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                : <><Shield size={16} /> Access Admin Console</>
              }
            </button>
          </form>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: '#8899bb' }}>Restricted access. Authorised personnel only.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
