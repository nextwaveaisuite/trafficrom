import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Mail, Coins,
  Settings, LogOut, Shield, BarChart2,
  AlertTriangle, CreditCard, Bell, Tag, Image, Trophy
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Overview',       end: true },
  { to: '/admin/members',      icon: Users,           label: 'Members'               },
  { to: '/admin/campaigns',    icon: Mail,            label: 'Campaigns'             },
  { to: '/admin/credits',      icon: Coins,           label: 'Credits'               },
  { to: '/admin/promocodes',   icon: Tag,             label: 'Promo Codes'           },
  { to: '/admin/banners',      icon: Image,           label: 'Banner Ads'            },
  { to: '/admin/leaderboard',  icon: Trophy,          label: 'Leaderboard'           },
  { to: '/admin/revenue',      icon: CreditCard,      label: 'Revenue'               },
  { to: '/admin/analytics',    icon: BarChart2,       label: 'Analytics'             },
  { to: '/admin/reports',      icon: AlertTriangle,   label: 'Reports'               },
  { to: '/admin/broadcasts',   icon: Bell,            label: 'Broadcasts'            },
  { to: '/admin/settings',     icon: Settings,        label: 'Settings'              },
];

const AdminSidebar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0" style={{ background: '#0f1525', borderRight: '1px solid #1e2840', minHeight: '100vh' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16" style={{ borderBottom: '1px solid #1e2840' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#e11d48' }}>
          <Shield size={16} color="#fff" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Admin Console</p>
          <p className="text-xs mt-0.5" style={{ color: '#8899bb' }}>Traffic ROM</p>
        </div>
      </div>

      {/* Admin badge */}
      {profile && (
        <div className="mx-3 mt-4 p-3 rounded-lg" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#e11d48', color: '#fff' }}>
              {(profile.first_name?.[0] || 'A').toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: '#f0f4ff' }}>{profile.first_name} {profile.last_name}</p>
              <p className="text-xs" style={{ color: '#e11d48', fontWeight: 600 }}>● Super Admin</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={({ isActive }) => ({
              color: isActive ? '#e11d48' : '#8899bb',
              background: isActive ? 'rgba(225,29,72,0.1)' : 'transparent',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 pb-2">
        <NavLink to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all" style={{ color: '#8899bb' }}>
          <LayoutDashboard size={16} />
          Member Dashboard
        </NavLink>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors"
          style={{ color: '#8899bb' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#8899bb'}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
