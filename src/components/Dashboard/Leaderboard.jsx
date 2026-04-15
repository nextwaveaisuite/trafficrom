import { useEffect, useState } from 'react';
import { Trophy, Users, Mail, BookOpen, Crown, Medal, Award, RefreshCw, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { id: 'referrers', label: 'Top Referrers',  icon: Users,    color: '#fbbf24', desc: 'Most new members referred this month' },
  { id: 'mailers',   label: 'Top Mailers',    icon: Mail,     color: '#60a5fa', desc: 'Most email campaigns sent this month' },
  { id: 'readers',   label: 'Top Readers',    icon: BookOpen, color: '#00d478', desc: 'Most credits earned by reading emails' },
];

const PRIZES = {
  referrers: [500, 250, 100],
  mailers:   [400, 200, 75],
  readers:   [300, 150, 50],
};

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown size={18} style={{ color: '#fbbf24' }} />;
  if (rank === 2) return <Medal size={18} style={{ color: '#94a3b8' }} />;
  if (rank === 3) return <Award size={18} style={{ color: '#cd7f32' }} />;
  return <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--text-muted)' }}>{rank}</span>;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('referrers');
  const [boards, setBoards] = useState({ referrers: [], mailers: [], readers: [] });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = endOfMonth - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [referrersRes, mailersRes, readersRes] = await Promise.all([
      supabase.from('referrals').select('referrer_id, profiles!referrals_referrer_id_fkey(username, first_name, last_name)').gte('created_at', startOfMonth).limit(100),
      supabase.from('email_campaigns').select('user_id, profiles(username, first_name, last_name)').eq('status', 'sent').gte('created_at', startOfMonth).limit(100),
      supabase.from('credit_transactions').select('user_id, amount, profiles(username, first_name, last_name)').eq('type', 'earned').gte('created_at', startOfMonth).limit(500),
    ]);
    const refCounts = {};
    (referrersRes.data || []).forEach(r => { const id = r.referrer_id; if (!refCounts[id]) refCounts[id] = { count: 0, profile: r.profiles }; refCounts[id].count++; });
    const referrers = Object.entries(refCounts).map(([id, v]) => ({ id, count: v.count, profile: v.profile })).sort((a, b) => b.count - a.count).slice(0, 10);
    const mailCounts = {};
    (mailersRes.data || []).forEach(r => { const id = r.user_id; if (!mailCounts[id]) mailCounts[id] = { count: 0, profile: r.profiles }; mailCounts[id].count++; });
    const mailers = Object.entries(mailCounts).map(([id, v]) => ({ id, count: v.count, profile: v.profile })).sort((a, b) => b.count - a.count).slice(0, 10);
    const readCounts = {};
    (readersRes.data || []).forEach(r => { const id = r.user_id; if (!readCounts[id]) readCounts[id] = { total: 0, profile: r.profiles }; readCounts[id].total += r.amount; });
    const readers = Object.entries(readCounts).map(([id, v]) => ({ id, count: v.total, profile: v.profile })).sort((a, b) => b.count - a.count).slice(0, 10);
    setBoards({ referrers, mailers, readers });
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboards(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentTab = TABS.find(t => t.id === activeTab);
  const data = boards[activeTab] || [];
  const prizes = PRIZES[activeTab];
  const myRank = data.findIndex(d => d.id === user?.id) + 1;

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          <Trophy size={22} style={{ color: '#fbbf24' }} /> Monthly Leaderboard
        </h1>
        <button onClick={fetchLeaderboards} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>
      <p className="text-sm mb-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Calendar size={13} /> Resets in <strong style={{ color: 'var(--text-primary)' }}>{timeLeft}</strong> — top performers win bonus credits!
      </p>
      <div className="p-4 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))', border: '1px solid rgba(251,191,36,0.25)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#fbbf24' }}>🏆 This Month's Prizes — {currentTab?.label}</p>
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(rank => (
            <div key={rank} className="text-center p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <RankBadge rank={rank} />
              <p className="text-lg font-bold mt-1" style={{ fontFamily: 'Syne', color: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : '#cd7f32' }}>{prizes[rank - 1].toLocaleString()}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>credits</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tab => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: activeTab === tab.id ? tab.color + '20' : 'var(--bg-secondary)', color: activeTab === tab.id ? tab.color : 'var(--text-muted)', border: '1px solid ' + (activeTab === tab.id ? tab.color + '50' : 'var(--border)') }}>
            <Icon size={14} /> {tab.label}
          </button>
        );})}
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{currentTab?.desc}</p>
      {myRank > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)' }}>
          <Trophy size={15} style={{ color: 'var(--brand-green)' }} />
          <p className="text-sm" style={{ color: 'var(--brand-green)' }}>You are ranked <strong>#{myRank}</strong> this month! {myRank <= 3 ? '🎉 You are in the prizes!' : 'Keep going!'}</p>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="hidden md:grid grid-cols-4 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <div>Rank</div><div className="col-span-2">Member</div>
          <div className="text-right">{activeTab === 'readers' ? 'Credits Earned' : activeTab === 'mailers' ? 'Campaigns Sent' : 'Members Referred'}</div>
        </div>
        {loading ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }} />
            Loading leaderboard...
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center">
            <Trophy size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No entries yet this month</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Be the first! {activeTab === 'referrers' ? 'Refer a friend.' : activeTab === 'mailers' ? 'Send a campaign.' : 'Read some emails.'}</p>
          </div>
        ) : data.map((entry, i) => {
          const rank = i + 1;
          const isMe = entry.id === user?.id;
          const name = entry.profile ? `${entry.profile.first_name || ''} ${entry.profile.last_name || ''}`.trim() || entry.profile.username : 'Member';
          const username = entry.profile?.username || '...';
          return (
            <div key={entry.id} className="grid grid-cols-4 gap-3 px-5 py-3 items-center"
              style={{ borderBottom: '1px solid var(--border)', background: isMe ? 'rgba(0,212,120,0.04)' : rank <= 3 ? 'rgba(251,191,36,0.02)' : 'transparent' }}>
              <div className="flex items-center justify-center w-8"><RankBadge rank={rank} /></div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: isMe ? 'rgba(0,212,120,0.2)' : 'var(--bg-secondary)', color: isMe ? 'var(--brand-green)' : 'var(--text-muted)' }}>
                  {(name[0] || username[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: isMe ? 'var(--brand-green)' : 'var(--text-primary)' }}>{name} {isMe && <span className="text-xs">(You)</span>}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : 'var(--text-primary)' }}>{entry.count?.toLocaleString()}</p>
                {rank <= 3 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{prizes[rank - 1]} cr prize</p>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        Leaderboard updates in real-time. Prizes are awarded automatically on the 1st of each month.
      </p>
    </div>
  );
};

export default Leaderboard;
