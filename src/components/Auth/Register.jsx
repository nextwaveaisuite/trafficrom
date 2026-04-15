import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Eye, EyeOff, Zap, Gift } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { referrerCode: searchParams.get('ref') || '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      referrerCode: data.referrerCode,
    });
    setIsLoading(false);
    if (error) {
      setServerError(error.message);
    } else {
      navigate('/dashboard?welcome=1');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--brand-green)' }} />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
              <Zap size={18} color="#0a0e1a" fill="#0a0e1a" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Join free today</h1>
          <p style={{ color: 'var(--text-muted)' }}>Get 100 bonus credits on signup. No card needed.</p>
        </div>

        {/* Bonus banner */}
        <div className="flex items-center gap-3 p-3 rounded-lg mb-5" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)' }}>
          <Gift size={18} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--brand-green)' }}>🎁 Free members start with <strong>100 credits</strong> — enough to send your first campaign today!</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input {...register('firstName', { required: 'Required' })} placeholder="Jane" className="input" />
                {errors.firstName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last name</label>
                <input {...register('lastName', { required: 'Required' })} placeholder="Smith" className="input" />
                {errors.lastName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 characters' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and _ only' } })}
                  placeholder="janesmith99"
                  className="input pl-10"
                />
              </div>
              {errors.username && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Referral code (optional)</label>
              <input {...register('referrerCode')} placeholder="Enter referral code" className="input" />
              {watch('referrerCode') && (
                <p className="text-xs mt-1" style={{ color: 'var(--brand-green)' }}>✓ Referral code applied – you'll both earn bonus credits!</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {isLoading
                ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
                : 'Create Free Account →'
              }
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              By registering you agree to our <a href="/terms" style={{ color: 'var(--brand-green)' }}>Terms of Service</a> and <a href="/privacy" style={{ color: 'var(--brand-green)' }}>Privacy Policy</a>.
            </p>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-green)' }} className="font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
