import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, Award, Gift, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PRIZES_DEFAULT = { referrers: [500, 250, 100], mailers: [400, 200, 75], readers: [300, 150, 50] };

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown size={16} style={{ color: '#fbbf24' }} />;
  if (rank === 2) return <Medal size={16} style={{ color: '#94a3b8' }} />;
  if (rank === 3) return <Award size={16} style={{ color: '#cd7f32' }} />;
  return <span className="text-sm font-bold" style={{ color: '#8899bb' }}>{rank}</span>;
};

const AdminLeaderboard = () => {
  const [boards, setBoards] = useState({ referrers: [], mailers: [], readers: [] });
  const [prizes, setPrizes] = useState(PRIZES_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('referrers');
  const [awarding, setAwarding] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBoards = async () => {
    setLoading(true);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [refRes, mailRes, readRes] = await Promise.all([
      supabase.from('referrals').select('referrer_id, profiles!referrals_referrer_id_fkey(username, first_name, last_name)').gte('created_at', startOfMonth).limit(200),
      supabase.from('email_campaigns').select('user_id, profiles(username, first_name, last_name)').eq('status', 'sent').gte('created_at', startOfMonth).limit(500),
      supabase.from('credit_transactions').select('user_id, amount, profiles(username, first_name, last_name)').eq('type', 'earned').gte('created_at', startOfMonth).limit(1000),
    ]);

    const tally = (data, keyFn, valFn, profileFn) => {
      const map = {};
      (data || []).forEach(r => {
        const id = keyFn(r);
        if (!map[id]) map[id] = { count: 0, profile: profileFn(r) };
        map[id].count += valFn(r);
      });
      return Object.entries(map).map(([id, v]) => ({ id, count: v.count, profile: v.profile })).sort((a, b) => b.count - a.count).slice(0, 10);
    };

    setBoards({
      referrers: tally(refRes.data, r => r.referrer_id, () => 1, r => r.profiles),
      mailers:   tally(mailRes.data, r => r.user_id, () => 1, r => r.profiles),
      readers:   tally(readRes.data, r => r.user_id, r => r.amount, r => r.profiles),
    });
    setLoading(false);
  };

  useEffect(() => { fetchBoards(); }, []);

  const awardPrizes = async () => {
    setAwarding(true);
    const data = boards[activeTab];
    const prizeList = prizes[activeTab];
    let awarded = 0;

    for (let i = 0; i < Math.min(3, data.length); i++) {
      const winner = data[i];
      const amount = prizeList[i];
      await supabase.rpc('earn_credits', {
        p_user_id: winner.id,
        p_amount: amount,
        p_description: `🏆 Leaderboard prize — ${activeTab} rank #${i + 1} — ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      });
      awarded += amount;
    }

    setMsg(`Prizes awarded! ${awarded.toLocaleString()} total credits distributed to top 3 ${activeTab}.`);
    setAwarding(false);
    setTimeout(() => setMsg(''), 5000);
  };

  const tabs = [
    { id: 'referrers', label: 'Referrers',  metric: 'Referrals' },
    { id: 'mailers',   label: 'Mailers',    metric: 'Campaigns' },
    { id: 'readers',   label: 'Readers',    metric: 'Credits Earned' },
  ];

  const data = boards[activeTab] || [];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
            <Trophy size={22} style={{ color: '#fbbf24' }} /> Leaderboard Manager
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>View rankings and award monthly prizes to top performers</p>
        </div>
        <button onClick={fetchBoards} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          <CheckCircle size={14} /> {msg}
        </div>
      )}

      {/* Prize config */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#0f1525', border: '1px solid rgba(251,191,36,0.25)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#fbbf24' }}>Configure Prize Amounts (credits)</p>
        <div className="grid md:grid-cols-3 gap-5">
          {tabs.map(tab => (
            <div key={tab.id}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f0f4ff' }}>{tab.label}</p>
              <div className="space-y-2">
                {[0,1,2].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <RankIcon rank={i + 1} />
                    <input type="number" value={prizes[tab.id][i]}
                      onChange={e => {
                        const updated = [...prizes[tab.id]];
                        updated[i] = parseInt(e.target.value) || 0;
                        setPrizes(prev => ({ ...prev, [tab.id]: updated }));
                      }}
                      style={{ background: '#151d30', border: '1px solid #1e2840', borderRadius: 6, padding: '5px 10px', color: '#f0f4ff', fontFamily: 'DM Sans', outline: 'none', width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
            style={{ background: activeTab === tab.id ? '#e11d48' : '#0f1525', color: activeTab === tab.id ? '#fff' : '#8899bb', border: '1px solid ' + (activeTab === tab.id ? '#e11d48' : '#1e2840') }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <div className="hidden md:grid grid-cols-4 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid #1e2840', color: '#8899bb' }}>
          <div>Rank</div>
          <div className="col-span-2">Member</div>
          <div className="text-right">{tabs.find(t => t.id === activeTab)?.metric}</div>
        </div>

        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>No data for this category yet this month.</div>
        ) : data.map((entry, i) => {
          const rank = i + 1;
          const name = entry.profile ? `${entry.profile.first_name || ''} ${entry.profile.last_name || ''}`.trim() || entry.profile.username : 'Member';
          return (
            <div key={entry.id} className="grid grid-cols-4 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid #1e2840', background: rank <= 3 ? 'rgba(251,191,36,0.02)' : 'transparent' }}>
              <div className="flex items-center justify-center w-8">
                <RankIcon rank={rank} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#1e2840', color: '#8899bb' }}>
                  {(name[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f0f4ff' }}>{name}</p>
                  <p className="text-xs" style={{ color: '#8899bb' }}>@{entry.profile?.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : '#f0f4ff' }}>
                  {entry.count?.toLocaleString()}
                </p>
                {rank <= 3 && <p className="text-xs" style={{ color: '#8899bb' }}>Prize: {prizes[activeTab][rank - 1]} cr</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Award button */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
        <div>
          <p className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Award {tabs.find(t => t.id === activeTab)?.label} Prizes</p>
          <p className="text-xs mt-0.5" style={{ color: '#8899bb' }}>
            This will award {prizes[activeTab].slice(0, Math.min(3, data.length)).join(' + ')} credits to the top {Math.min(3, data.length)} {activeTab}.
          </p>
        </div>
        <button onClick={awardPrizes} disabled={awarding || data.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40"
          style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
          {awarding
            ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
            : <><Gift size={15} /> Award Prizes</>
          }
        </button>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
