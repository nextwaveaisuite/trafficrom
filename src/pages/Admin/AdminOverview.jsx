import { useEffect, useState } from 'react';
import { Users, Mail, Coins, TrendingUp, UserCheck, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="p-5 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{value}</p>
    <p className="text-sm" style={{ color: '#8899bb' }}>{label}</p>
    {sub && <p className="text-xs mt-1 font-semibold" style={{ color }}>{sub}</p>}
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState({ totalMembers: 0, freeMembers: 0, starterMembers: 0, proMembers: 0, totalCampaigns: 0, todayCampaigns: 0, totalCreditsInCirculation: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: totalMembers },
        { count: freeMembers },
        { count: starterMembers },
        { count: proMembers },
        { count: totalCampaigns },
        { data: members },
        { data: campaigns },
        { data: creditData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_tier', 'free'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_tier', 'starter'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_tier', 'pro'),
        supabase.from('email_campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, username, first_name, last_name, membership_tier, credits, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('email_campaigns').select('id, subject, recipients_count, status, created_at, user_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('credits'),
      ]);

      const totalCredits = creditData?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0;

      setStats({ totalMembers, freeMembers, starterMembers, proMembers, totalCampaigns, totalCreditsInCirculation: totalCredits });
      setRecentMembers(members || []);
      setRecentCampaigns(campaigns || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const tierColor = (tier) => ({ free: '#8899bb', starter: '#00d478', pro: '#60a5fa' }[tier] || '#8899bb');

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Platform Overview</h1>
        <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Real-time snapshot of Traffic ROM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}     label="Total Members"           value={stats.totalMembers?.toLocaleString() || '0'}               color="#60a5fa" />
        <StatCard icon={UserCheck} label="Paid Members"            value={((stats.starterMembers || 0) + (stats.proMembers || 0)).toLocaleString()} sub={`$${(((stats.starterMembers || 0) * 7) + ((stats.proMembers || 0) * 15)).toLocaleString()}/mo MRR`} color="#00d478" />
        <StatCard icon={Mail}      label="Total Campaigns"         value={stats.totalCampaigns?.toLocaleString() || '0'}              color="#a78bfa" />
        <StatCard icon={Coins}     label="Credits in Circulation"  value={stats.totalCreditsInCirculation?.toLocaleString() || '0'}   color="#fbbf24" />
      </div>

      {/* Tier breakdown */}
      <div className="p-5 rounded-xl mb-6" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Membership Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Free',    count: stats.freeMembers,    color: '#8899bb', price: '$0' },
            { label: 'Starter', count: stats.starterMembers, color: '#00d478', price: '$7/mo' },
            { label: 'Pro',     count: stats.proMembers,     color: '#60a5fa', price: '$15/mo' },
          ].map((t) => {
            const total = stats.totalMembers || 1;
            const pct = Math.round(((t.count || 0) / total) * 100);
            return (
              <div key={t.label} className="text-center p-4 rounded-lg" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: t.color }}>{t.count?.toLocaleString() || '0'}</p>
                <p className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>{t.label}</p>
                <p className="text-xs" style={{ color: '#8899bb' }}>{t.price} · {pct}%</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2840' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: t.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent Members */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1e2840' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Recent Signups</h2>
            <Activity size={16} style={{ color: '#8899bb' }} />
          </div>
          {loading ? (
            <div className="p-6 text-center" style={{ color: '#8899bb' }}>Loading...</div>
          ) : recentMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1e2840' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
                  {(m.first_name?.[0] || m.username?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f0f4ff' }}>{m.first_name} {m.last_name}</p>
                  <p className="text-xs" style={{ color: '#8899bb' }}>@{m.username} · {timeAgo(m.created_at)}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tierColor(m.membership_tier) + '18', color: tierColor(m.membership_tier) }}>
                {m.membership_tier}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Campaigns */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1e2840' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Recent Campaigns</h2>
            <TrendingUp size={16} style={{ color: '#8899bb' }} />
          </div>
          {loading ? (
            <div className="p-6 text-center" style={{ color: '#8899bb' }}>Loading...</div>
          ) : recentCampaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1e2840' }}>
              <div className="overflow-hidden mr-3">
                <p className="text-sm font-medium truncate" style={{ color: '#f0f4ff' }}>{c.subject}</p>
                <p className="text-xs" style={{ color: '#8899bb' }}>{c.recipients_count?.toLocaleString()} recipients · {timeAgo(c.created_at)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: c.status === 'sent' ? 'rgba(0,212,120,0.1)' : 'rgba(251,191,36,0.1)', color: c.status === 'sent' ? '#00d478' : '#fbbf24' }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
