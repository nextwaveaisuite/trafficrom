import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, Mail, TrendingUp, Users, Coins, ChevronRight, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { MEMBERSHIP_TIERS } from '../../utils/constants';
import { formatDate, timeAgo } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accent ? 'rgba(0,212,120,0.15)' : 'var(--bg-secondary)' }}>
        <Icon size={18} style={{ color: accent ? 'var(--brand-green)' : 'var(--text-muted)' }} />
      </div>
    </div>
    <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--brand-green)' }}>{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const tier = profile?.membership_tier || 'free';
  const tierInfo = MEMBERSHIP_TIERS[tier];

  useEffect(() => {
    if (!user) return;
    supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecentCampaigns(data || []);
        setLoading(false);
      });
  }, [user]);

  const emailsRemaining = tierInfo
    ? (tier === 'free'
        ? tierInfo.emailsPerWeek - (profile?.emails_sent_today || 0)
        : tierInfo.emailsPerDay - (profile?.emails_sent_today || 0))
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Welcome banner */}
      {isWelcome && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)' }}>
          <Gift size={20} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
          <div>
            <p className="font-semibold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Welcome to Traffic ROM! 🎉</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You've received 100 bonus credits. Start sending your first campaign right now!</p>
          </div>
          <Link to="/dashboard/compose" className="btn-primary text-sm py-1.5 px-4 ml-auto shrink-0">Send Now →</Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          Good to see you, {profile?.first_name || 'Marketer'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Here's your traffic overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Coins} label="Credits balance" value={profile?.credits?.toLocaleString() || '0'} sub="Earn more by reading emails" accent />
        <StatCard icon={Send} label="Emails sent today" value={profile?.emails_sent_today || 0} sub={`${Math.max(0, emailsRemaining)} sends remaining`} />
        <StatCard icon={Mail} label="Total campaigns" value={profile?.total_emails_sent || 0} />
        <StatCard icon={TrendingUp} label="Plan" value={tier.charAt(0).toUpperCase() + tier.slice(1)} sub={tier !== 'pro' ? 'Upgrade for more sends' : '✓ Max tier'} />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Quick Send</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Compose and send your promotional email to thousands of opt-in marketers.</p>
          <Link to="/dashboard/compose" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
            <Send size={14} /> Compose Email
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Earn More Credits</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Read members' emails to earn credits. Higher plan = higher earn rate.</p>
          <Link to="/dashboard/credits" className="btn-outline inline-flex items-center gap-2 text-sm py-2 px-4">
            <Coins size={14} /> Manage Credits
          </Link>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="card">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Recent Campaigns</h2>
          <Link to="/dashboard/history" className="text-sm flex items-center gap-1" style={{ color: 'var(--brand-green)' }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : recentCampaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Mail size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No campaigns yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Send your first campaign and start driving traffic.</p>
            <Link to="/dashboard/compose" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
              Send First Email <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="overflow-hidden mr-4">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Recipients</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.recipients_count?.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold`}
                    style={{
                      background: c.status === 'sent' ? 'rgba(0,212,120,0.1)' : 'rgba(251,191,36,0.1)',
                      color: c.status === 'sent' ? 'var(--brand-green)' : '#fbbf24'
                    }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
