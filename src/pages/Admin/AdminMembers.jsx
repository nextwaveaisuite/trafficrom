import { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, Coins, ChevronDown, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/helpers';

const TIERS = ['all', 'free', 'starter', 'pro'];
const tierColor = (tier) => ({ free: '#8899bb', starter: '#00d478', pro: '#60a5fa' }[tier] || '#8899bb');

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const PAGE_SIZE = 15;

  const fetchMembers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('id, username, first_name, last_name, membership_tier, credits, emails_sent_today, total_emails_sent, is_active, is_admin, created_at, subscription_expires')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (tierFilter !== 'all') query = query.eq('membership_tier', tierFilter);
    if (search) query = query.or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

    const { data } = await query;
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [page, tierFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchMembers();
  };

  const toggleActive = async (member) => {
    setActionLoading(true);
    await supabase.from('profiles').update({ is_active: !member.is_active }).eq('id', member.id);
    setActionMsg(`Member ${member.is_active ? 'suspended' : 'reactivated'} successfully.`);
    fetchMembers();
    setSelectedMember(null);
    setActionLoading(false);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const adjustCredits = async (member, type) => {
    if (!creditAmount || isNaN(creditAmount)) return;
    setActionLoading(true);
    const amount = parseInt(creditAmount);
    const newCredits = type === 'add' ? member.credits + amount : Math.max(0, member.credits - amount);
    await supabase.from('profiles').update({ credits: newCredits }).eq('id', member.id);
    await supabase.from('credit_transactions').insert({
      user_id: member.id,
      type: type === 'add' ? 'bonus' : 'spent',
      amount,
      description: creditNote || (type === 'add' ? 'Admin credit grant' : 'Admin credit deduction'),
    });
    setActionMsg(`${type === 'add' ? 'Added' : 'Deducted'} ${amount} credits ${type === 'add' ? 'to' : 'from'} @${member.username}.`);
    fetchMembers();
    setSelectedMember(null);
    setCreditAmount('');
    setCreditNote('');
    setActionLoading(false);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const upgradeTier = async (member, tier) => {
    setActionLoading(true);
    await supabase.from('profiles').update({ membership_tier: tier }).eq('id', member.id);
    setActionMsg(`@${member.username} upgraded to ${tier}.`);
    fetchMembers();
    setSelectedMember(null);
    setActionLoading(false);
    setTimeout(() => setActionMsg(''), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Member Management</h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>View, manage and moderate all platform members</p>
        </div>
        <button onClick={fetchMembers} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          ✓ {actionMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or username..." className="input pl-9 text-sm" style={{ background: '#0f1525' }} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#e11d48', color: '#fff' }}>Search</button>
        </form>
        <div className="flex gap-2">
          {TIERS.map(t => (
            <button key={t} onClick={() => { setTierFilter(t); setPage(0); }}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{ background: tierFilter === t ? '#e11d48' : '#0f1525', color: tierFilter === t ? '#fff' : '#8899bb', border: '1px solid ' + (tierFilter === t ? '#e11d48' : '#1e2840') }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid #1e2840', color: '#8899bb' }}>
          <div className="col-span-2">Member</div>
          <div>Plan</div>
          <div>Credits</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: '#e11d48', borderTopColor: 'transparent' }} />
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>No members found.</div>
        ) : members.map((m) => (
          <div key={m.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid #1e2840' }}>
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: m.is_active ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.1)', color: m.is_active ? '#60a5fa' : '#f87171' }}>
                {(m.first_name?.[0] || m.username?.[0] || '?').toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f4ff' }}>{m.first_name} {m.last_name}</p>
                  {m.is_admin && <Shield size={10} style={{ color: '#e11d48', flexShrink: 0 }} />}
                </div>
                <p className="text-xs truncate" style={{ color: '#8899bb' }}>@{m.username}</p>
              </div>
            </div>
            <div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tierColor(m.membership_tier) + '18', color: tierColor(m.membership_tier) }}>
                {m.membership_tier}
              </span>
            </div>
            <div className="text-sm font-semibold" style={{ color: '#fbbf24' }}>{m.credits?.toLocaleString()}</div>
            <div className="text-xs" style={{ color: '#8899bb' }}>{formatDate(m.created_at)}</div>
            <div>
              <button onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                style={{ border: '1px solid #1e2840', color: '#8899bb', background: selectedMember?.id === m.id ? '#1e2840' : 'transparent' }}>
                Manage <ChevronDown size={10} />
              </button>
            </div>

            {/* Expanded manage panel */}
            {selectedMember?.id === m.id && (
              <div className="col-span-6 mt-1 p-4 rounded-xl space-y-4" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>Account Status</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: m.is_active ? 'rgba(0,212,120,0.1)' : 'rgba(239,68,68,0.1)', color: m.is_active ? '#00d478' : '#f87171' }}>
                        {m.is_active ? '● Active' : '● Suspended'}
                      </span>
                    </div>
                    <button onClick={() => toggleActive(m)} disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                      style={{ background: m.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,120,0.1)', color: m.is_active ? '#f87171' : '#00d478', border: '1px solid ' + (m.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,120,0.3)') }}>
                      {m.is_active ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Reactivate</>}
                    </button>
                  </div>

                  {/* Credits */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>Adjust Credits</p>
                    <input value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="Amount" className="input text-sm mb-2" style={{ background: '#0f1525' }} />
                    <input value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="Note (optional)" className="input text-sm mb-2" style={{ background: '#0f1525' }} />
                    <div className="flex gap-2">
                      <button onClick={() => adjustCredits(m, 'add')} disabled={actionLoading}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1"
                        style={{ background: 'rgba(0,212,120,0.1)', color: '#00d478', border: '1px solid rgba(0,212,120,0.3)' }}>
                        <Coins size={10} /> Add
                      </button>
                      <button onClick={() => adjustCredits(m, 'deduct')} disabled={actionLoading}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <Coins size={10} /> Deduct
                      </button>
                    </div>
                  </div>

                  {/* Tier */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>Change Plan</p>
                    <div className="space-y-2">
                      {['free', 'starter', 'pro'].map(tier => (
                        <button key={tier} onClick={() => upgradeTier(m, tier)} disabled={actionLoading || m.membership_tier === tier}
                          className="w-full text-xs py-1.5 rounded-lg font-semibold capitalize transition-all disabled:opacity-40"
                          style={{ background: tierColor(tier) + '15', color: tierColor(tier), border: '1px solid ' + tierColor(tier) + '40' }}>
                          {m.membership_tier === tier ? '✓ ' : ''}{tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>← Prev</button>
          <span className="text-xs" style={{ color: '#8899bb' }}>Page {page + 1}</span>
          <button onClick={() => setPage(page + 1)} disabled={members.length < PAGE_SIZE} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>Next →</button>
        </div>
      </div>
    </div>
  );
};

export default AdminMembers;
