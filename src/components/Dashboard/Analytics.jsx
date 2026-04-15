import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Mail, Users, Coins, Eye, MousePointer, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/helpers';

const StatBox = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: color + '18' }}>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    {sub && <p className="text-xs mt-1 font-semibold" style={{ color }}>{sub}</p>}
  </div>
);

const Analytics = () => {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const start = period === 'week'
        ? new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
        : period === 'month'
        ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        : new Date(now.getFullYear(), 0, 1).toISOString();

      const { data } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'sent')
        .gte('created_at', start)
        .order('created_at', { ascending: false });

      setCampaigns(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user, period]);

  const totalRecipients = campaigns.reduce((s, c) => s + (c.recipients_count || 0), 0);
  const totalOpens = campaigns.reduce((s, c) => s + (c.opens_count || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks_count || 0), 0);
  const totalCreditsSpent = campaigns.reduce((s, c) => s + (c.credits_used || 0), 0);
  const avgOpenRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : '0.0';
  const avgClickRate = totalRecipients > 0 ? ((totalClicks / totalRecipients) * 100).toFixed(1) : '0.0';

  // Group campaigns by category
  const byCategory = campaigns.reduce((acc, c) => {
    const cat = c.target_category || 'General';
    if (!acc[cat]) acc[cat] = { count: 0, recipients: 0, opens: 0 };
    acc[cat].count++;
    acc[cat].recipients += c.recipients_count || 0;
    acc[cat].opens += c.opens_count || 0;
    return acc;
  }, {});

  const categoryData = Object.entries(byCategory)
    .map(([cat, data]) => ({ cat, ...data, openRate: data.recipients > 0 ? ((data.opens / data.recipients) * 100).toFixed(1) : '0.0' }))
    .sort((a, b) => b.recipients - a.recipients);

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track your campaign performance over time</p>
        </div>
        <div className="flex gap-2">
          {[['week', '7 Days'], ['month', 'This Month'], ['year', 'This Year']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: period === val ? 'rgba(0,212,120,0.12)' : 'var(--bg-secondary)', color: period === val ? 'var(--brand-green)' : 'var(--text-muted)', border: `1px solid ${period === val ? 'rgba(0,212,120,0.4)' : 'var(--border)'}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatBox icon={Mail}        label="Campaigns Sent"    value={campaigns.length}                    color="#60a5fa" />
        <StatBox icon={Users}       label="Total Recipients"  value={totalRecipients.toLocaleString()}    color="#a78bfa" />
        <StatBox icon={Eye}         label="Total Opens"       value={totalOpens.toLocaleString()}         sub={`${avgOpenRate}% open rate`} color="#00d478" />
        <StatBox icon={MousePointer}label="Total Clicks"      value={totalClicks.toLocaleString()}        sub={`${avgClickRate}% click rate`} color="#fbbf24" />
        <StatBox icon={Coins}       label="Credits Spent"     value={totalCreditsSpent.toLocaleString()}  color="#f87171" />
        <StatBox icon={TrendingUp}  label="All-time Campaigns" value={profile?.total_emails_sent || 0}   color="#00d478" />
      </div>

      {/* Recent campaigns table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Campaign Performance</h2>
          {loading && <RefreshCw size={15} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading data...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart2 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No campaigns in this period. Send your first campaign!</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <div className="col-span-2">Subject</div>
              <div>Date</div>
              <div>Recipients</div>
              <div>Opens</div>
              <div>Open Rate</div>
            </div>
            {campaigns.slice(0, 10).map(c => {
              const openRate = c.recipients_count > 0 ? ((c.opens_count / c.recipients_count) * 100).toFixed(1) : '0.0';
              const rateColor = parseFloat(openRate) >= 20 ? 'var(--brand-green)' : parseFloat(openRate) >= 10 ? '#fbbf24' : 'var(--text-muted)';
              return (
                <div key={c.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="col-span-2 overflow-hidden">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.target_category}</p>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.recipients_count?.toLocaleString()}</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.opens_count?.toLocaleString()}</div>
                  <div className="text-sm font-bold" style={{ color: rateColor }}>{openRate}%</div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* By category */}
      {categoryData.length > 0 && (
        <div className="card">
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Performance by Niche</h2>
          </div>
          {categoryData.map(item => {
            const maxRecipients = Math.max(...categoryData.map(d => d.recipients));
            const pct = maxRecipients > 0 ? (item.recipients / maxRecipients) * 100 : 0;
            return (
              <div key={item.cat} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 140, flexShrink: 0 }}>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.cat}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.count} campaign{item.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: pct + '%', background: 'var(--brand-green)' }} />
                  </div>
                </div>
                <div className="text-right shrink-0" style={{ width: 100 }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.recipients.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.openRate}% opens</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Analytics;
