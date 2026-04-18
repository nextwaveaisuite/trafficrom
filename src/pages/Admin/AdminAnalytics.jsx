import { useEffect, useState } from 'react';
import { BarChart2, Users, Mail, Coins, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const last7  = new Date(now -  7 * 24 * 60 * 60 * 1000).toISOString();

    const [membersRes, campaignsRes, creditsRes, tierRes] = await Promise.all([
      supabase.from('profiles').select('id, created_at, membership_tier', { count: 'exact' }),
      supabase.from('email_campaigns').select('id, created_at, recipients_count', { count: 'exact' }),
      supabase.from('credit_transactions').select('amount, type').eq('type', 'earned'),
      supabase.from('profiles').select('membership_tier'),
    ]);

    const members  = membersRes.data  || [];
    const campaigns = campaignsRes.data || [];
    const credits  = creditsRes.data  || [];
    const tiers    = tierRes.data     || [];

    const newLast30 = members.filter(m => m.created_at >= last30).length;
    const newLast7  = members.filter(m => m.created_at >= last7).length;
    const campaignsMonth = campaigns.filter(c => c.created_at >= startOfMonth).length;
    const totalEmails = campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
    const totalCreditsEarned = credits.reduce((sum, c) => sum + (c.amount || 0), 0);
    const tierCounts = tiers.reduce((acc, p) => { acc[p.membership_tier] = (acc[p.membership_tier] || 0) + 1; return acc; }, {});

    setStats({ totalMembers: membersRes.count || 0, newLast30, newLast7, totalCampaigns: campaignsRes.count || 0, campaignsMonth, totalEmails, totalCreditsEarned, tierCounts });
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const TIER_COLORS = { free: '#8899bb', starter: '#00d478', pro: '#60a5fa', elite: '#fbbf24' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Platform Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Member growth, campaign activity and credit stats</p>
        </div>
        <button onClick={fetchStats} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Members',     value: stats.totalMembers.toLocaleString(),  icon: Users,      color: '#00d478' },
              { label: 'New (Last 7 days)', value: stats.newLast7,                        icon: TrendingUp, color: '#60a5fa' },
              { label: 'New (Last 30 days)',value: stats.newLast30,                       icon: TrendingUp, color: '#fbbf24' },
              { label: 'Total Campaigns',   value: stats.totalCampaigns.toLocaleString(), icon: Mail,       color: '#f472b6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
                <Mail size={16} style={{ color: '#60a5fa' }} /> Email Activity
              </h2>
              {[
                { label: 'Total emails delivered', value: stats.totalEmails.toLocaleString() },
                { label: 'Campaigns this month',   value: stats.campaignsMonth.toLocaleString() },
                { label: 'Avg recipients/campaign', value: stats.totalCampaigns > 0 ? Math.round(stats.totalEmails / stats.totalCampaigns).toLocaleString() : '0' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
                <Coins size={16} style={{ color: '#fbbf24' }} /> Credit Activity
              </h2>
              <div className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total credits earned</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalCreditsEarned.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
              <BarChart2 size={16} style={{ color: '#00d478' }} /> Membership Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['free', 'starter', 'pro', 'elite'].map(tier => {
                const count = stats.tierCounts[tier] || 0;
                const pct = stats.totalMembers > 0 ? Math.round((count / stats.totalMembers) * 100) : 0;
                return (
                  <div key={tier} className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: TIER_COLORS[tier] }}>{count}</p>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: TIER_COLORS[tier] }}>{tier}</p>
                    <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'var(--border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: TIER_COLORS[tier] }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
