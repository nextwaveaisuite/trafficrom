import { useEffect, useState } from 'react';
import { Users, Mail, MousePointer, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LiveStats = () => {
  const [stats, setStats] = useState({ members: 0, emailsToday: 0, clicksToday: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];
      const [
        { count: members },
        { count: emailsToday },
        { count: clicksToday },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', today),
        supabase.from('email_tracking').select('*', { count: 'exact', head: true }).gte('clicked_at', today),
      ]);
      setStats({ members: members || 0, emailsToday: emailsToday || 0, clicksToday: clicksToday || 0 });
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap px-4 py-2" style={{ background: 'rgba(0,212,120,0.06)', borderBottom: '1px solid rgba(0,212,120,0.12)' }}>
      <div className="flex items-center gap-1.5 px-3 py-1">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00d478' }} />
        <Users size={12} style={{ color: 'var(--brand-green)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stats.members.toLocaleString()}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>members</span>
      </div>
      <span style={{ color: 'var(--border)' }}>·</span>
      <div className="flex items-center gap-1.5 px-3 py-1">
        <Mail size={12} style={{ color: 'var(--brand-green)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stats.emailsToday.toLocaleString()}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>emails sent today</span>
      </div>
      <span style={{ color: 'var(--border)' }}>·</span>
      <div className="flex items-center gap-1.5 px-3 py-1">
        <MousePointer size={12} style={{ color: 'var(--brand-green)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stats.clicksToday.toLocaleString()}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>clicks today</span>
      </div>
      <span style={{ color: 'var(--border)' }}>·</span>
      <div className="flex items-center gap-1.5 px-3 py-1">
        <Zap size={12} fill="currentColor" style={{ color: 'var(--brand-green)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--brand-green)' }}>LIVE</span>
      </div>
    </div>
  );
};

export default LiveStats;
