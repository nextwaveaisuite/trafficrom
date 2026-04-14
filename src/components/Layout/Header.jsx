import { Link, useNavigate } from 'react-router-dom';
import { Zap, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
              <Zap size={16} color="#0a0e1a" fill="#0a0e1a" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Features</Link>
            <Link to="/pricing" className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Pricing</Link>
            {user ? (
              <div className="flex items-center gap-3">
                {profile && (
                  <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,212,120,0.1)', color: 'var(--brand-green)', border: '1px solid rgba(0,212,120,0.2)' }}>
                    {profile.credits?.toLocaleString()} credits
                  </span>
                )}
                <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard</Link>
                <button onClick={handleSignOut} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-outline text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </div>
            )}
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'var(--text-muted)' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <Link to="/features" className="block text-sm py-2" style={{ color: 'var(--text-muted)' }} onClick={() => setMobileOpen(false)}>Features</Link>
          <Link to="/pricing" className="block text-sm py-2" style={{ color: 'var(--text-muted)' }} onClick={() => setMobileOpen(false)}>Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block btn-primary text-center py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleSignOut} className="block w-full text-left text-sm py-2" style={{ color: 'var(--text-muted)' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block btn-outline text-center py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block btn-primary text-center py-2" onClick={() => setMobileOpen(false)}>Join Free</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
