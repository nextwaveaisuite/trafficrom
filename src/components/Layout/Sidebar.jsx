import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Send, Clock, Coins, Users, BarChart2,
  Settings, LogOut, Zap, ChevronRight, Inbox, Image, Trophy, Link2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/dashboard/compose',   icon: Send,            label: 'Send Email'   },
  { to: '/dashboard/inbox',     icon: Inbox,           label: 'Read & Earn'  },
  { to: '/dashboard/history',   icon: Clock,           label: 'Campaigns'    },
  { to: '/dashboard/credits',   icon: Coins,           label: 'Credits'      },
  { to: '/dashboard/links',     icon: Link2,           label: 'Link Cloaker' },
  { to: '/dashboard/banners',   icon: Image,           label: 'Banner Ads'   },
  { to: '/dashboard/leaderboard',icon: Trophy,         label: 'Leaderboard'  },
  { to: '/dashboard/referrals', icon: Users,           label: 'Referrals'    },
  { to: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics'    },
  { to: '/dashboard/settings',  icon: Settings,        label: 'Settings'     },
];

const Sidebar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const tier = profile?.membership_tier || 'free';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
          <Zap size={16} color="#0a0e1a" fill="#0a0e1a" />
        </div>
        <span className="font-bold text-base" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
      </div>

      {/* User badge */}
      {profile && (
        <div className="mx-3 mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--brand-green)', color: '#0a0e1a' }}>
              {(profile.first_name?.[0] || profile.username?.[0] || '?').toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{profile.first_name} {profile.last_name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase" style={{ background: 'rgba(0,212,120,0.15)', color: 'var(--brand-green)' }}>{tier}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--brand-green)' }}>{profile.credits?.toLocaleString()} credits</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'active-nav' : ''}`}
            style={({ isActive }) => ({ color: isActive ? 'var(--brand-green)' : 'var(--text-muted)', background: isActive ? 'rgba(0,212,120,0.1)' : 'transparent' })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade CTA */}
      {tier === 'free' && (
        <div className="mx-3 mb-4 p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(0,212,120,0.15), rgba(0,229,255,0.08))', border: '1px solid rgba(0,212,120,0.2)' }}>
          <p className="text-xs font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Upgrade to Starter</p>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Daily sends + 2,000 recipients for just $7/mo</p>
          <NavLink to="/pricing" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--brand-green)' }}>
            Upgrade now <ChevronRight size={12} />
          </NavLink>
        </div>
      )}

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
