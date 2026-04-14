import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    const { error } = await signIn({ email: data.email, password: data.password });
    setIsLoading(false);
    if (error) {
      setServerError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--brand-green)' }} />
      <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full opacity-5 blur-[100px]" style={{ background: '#00e5ff' }} />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
              <Zap size={18} color="#0a0e1a" fill="#0a0e1a" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {serverError && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" style={{ accentColor: 'var(--brand-green)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm" style={{ color: 'var(--brand-green)' }}>Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--brand-green)' }} className="font-semibold">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
