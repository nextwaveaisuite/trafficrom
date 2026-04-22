import { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, Coins, ChevronDown, RefreshCw, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/helpers';

const TIERS = ['all', 'free', 'starter', 'pro', 'elite'];
const TIER_COLORS = { free: '#8899bb', starter: '#00d478', pro: '#60a5fa', elite: '#fbbf24' };
const tierColor = (tier) => TIER_COLORS[tier] || '#8899bb';

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
  const [actionMsgType, setActionMsgType] = useState('success');
  const PAGE_SIZE = 15;

  const showMsg = (text, type = 'success') => {
    setActionMsg(text); setActionMsgType(type);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const fetchMembers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('id, username, first_name, last_name, membership_tier, subscription_status, credits, emails_sent_today, total_emails_sent, is_active, is_admin, is_owner, created_at')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (tierFilter !== 'all') query = query.eq('membership_tier', tierFilter);
    if (search) query = query.or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) showMsg('Failed to load members: ' + error.message, 'error');
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [page, tierFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => { e.preventDefault(); setPage(0); fetchMembers(); };

  const toggleActive = async (member) => {
    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({ is_active: !member.is_active }).eq('id', member.id);
    if (error) { showMsg('Failed: ' + error.message, 'error'); }
    else { showMsg(`@${member.username} ${member.is_active ? 'suspended' : 'reactivated'}.`); }
    fetchMembers(); setSelectedMember(null); setActionLoading(false);
  };

  const adjustCredits = async (member, type) => {
    const amount = parseInt(creditAmount);
    if (!creditAmount || isNaN(amount) || amount <= 0) { showMsg('Please enter a valid credit amount.', 'error'); return; }
    setActionLoading(true);
    const newCredits = type === 'add' ? (member.credits || 0) + amount : Math.max(0, (member.credits || 0) - amount);
    const { error } = await supabase.from('profiles').update({ credits: newCredits }).eq('id', member.id);
    if (error) { showMsg('Failed: ' + error.message, 'error'); setActionLoading(false); return; }
    await supabase.from('credit_transactions').insert({ user_id: member.id, type: type === 'add' ? 'bonus' : 'spent', amount, description: creditNote || (type === 'add' ? 'Admin credit grant' : 'Admin credit deduction') });
    showMsg(`${type === 'add' ? 'Added' : 'Deducted'} ${amount.toLocaleString()} credits ${type === 'add' ? 'to' : 'from'} @${member.username}. New balance: ${newCredits.toLocaleString()}`);
    fetchMembers(); setSelectedMember(null); setCreditAmount(''); setCreditNote(''); setActionLoading(false);
  };

  const changeTier = async (member, tier) => {
    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({
      membership_tier: tier,
      subscription_status: tier === 'free' ? 'free' : 'active',
    }).eq('id', member.id);
    if (error) { showMsg('Failed to change plan: ' + error.message, 'error'); }
    else { showMsg(`@${member.username} moved to ${tier.toUpperCase()} plan.`); }
    fetchMembers(); setSelectedMember(null); setActionLoading(false);
  };

  const quickAddCredits = async (member, amount) => {
    setActionLoading(true);
    const newCredits = (member.credits || 0) + amount;
    const { error } = await supabase.from('profiles').update({ credits: newCredits }).eq('id', member.id);
    if (!error) {
      await supabase.from('credit_transactions').insert({ user_id: member.id, type: 'bonus', amount, description: `Admin quick grant: ${amount} credits` });
      showMsg(`Added ${amount.toLocaleString()} credits to @${member.username}.`);
    } else { showMsg('Failed: ' + error.message, 'error'); }
    fetchMembers(); setActionLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Member Management</h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Manage plans, credits and access for all members</p>
        </div>
        <button onClick={fetchMembers} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2"
          style={{ background: actionMsgType === 'success' ? 'rgba(0,212,120,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid ' + (actionMsgType === 'success' ? 'rgba(0,212,120,0.25)' : 'rgba(239,68,68,0.25)'), color: actionMsgType === 'success' ? '#00d478' : '#f87171' }}>
          {actionMsgType === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {actionMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or username..."
              className="input pl-9 text-sm" style={{ background: '#0f1525' }} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#e11d48', color: '#fff' }}>Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {TIERS.map(t => (
            <button key={t} onClick={() => { setTierFilter(t); setPage(0); }}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
              style={{ background: tierFilter === t ? (TIER_COLORS[t] || '#e11d48') : '#0f1525', color: tierFilter === t ? '#0a0e1a' : '#8899bb', border: '1px solid ' + (tierFilter === t ? (TIER_COLORS[t] || '#e11d48') : '#1e2840') }}>
              {t}
            </button>
          ))}
        </div>
      </div>

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
          <div key={m.id}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid #1e2840' }}>
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: m.is_active ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.1)', color: m.is_active ? '#60a5fa' : '#f87171' }}>
                  {(m.first_name?.[0] || m.username?.[0] || '?').toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f4ff' }}>{m.first_name} {m.last_name}</p>
                    {m.is_admin && <Shield size={10} style={{ color: '#e11d48', flexShrink: 0 }} />}
                    {m.is_owner && <span className="text-xs px-1 rounded font-bold" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0a0e1a', fontSize: 8 }}>OWNER</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#8899bb' }}>@{m.username}</p>
                </div>
              </div>
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tierColor(m.membership_tier) + '20', color: tierColor(m.membership_tier) }}>
                  {m.membership_tier}
                </span>
                {m.subscription_status && m.subscription_status !== 'free' && (
                  <p className="text-xs mt-0.5" style={{ color: '#8899bb' }}>{m.subscription_status}</p>
                )}
              </div>
              <div className="text-sm font-semibold" style={{ color: '#fbbf24' }}>{(m.credits || 0).toLocaleString()}</div>
              <div className="text-xs" style={{ color: '#8899bb' }}>{formatDate(m.created_at)}</div>
              <div>
                <button onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                  className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                  style={{ border: '1px solid ' + (selectedMember?.id === m.id ? '#e11d48' : '#1e2840'), color: selectedMember?.id === m.id ? '#e11d48' : '#8899bb', background: selectedMember?.id === m.id ? 'rgba(225,29,72,0.1)' : 'transparent' }}>
                  Manage <ChevronDown size={10} style={{ transform: selectedMember?.id === m.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>

            {selectedMember?.id === m.id && (
              <div className="px-5 pb-5 pt-3" style={{ borderBottom: '1px solid #1e2840', background: '#0b1120' }}>
                <div className="grid md:grid-cols-3 gap-5">

                  {/* Plan */}
                  <div className="p-4 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8899bb' }}>Change Plan</p>
                    <p className="text-xs mb-3" style={{ color: '#8899bb' }}>Current: <strong style={{ color: tierColor(m.membership_tier) }}>{m.membership_tier}</strong></p>
                    <div className="space-y-2">
                      {['free', 'starter', 'pro', 'elite'].map(tier => (
                        <button key={tier} onClick={() => changeTier(m, tier)}
                          disabled={actionLoading || m.membership_tier === tier}
                          className="w-full text-xs py-2 rounded-lg font-semibold capitalize flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: m.membership_tier === tier ? tierColor(tier) + '30' : tierColor(tier) + '15', color: tierColor(tier), border: '1px solid ' + tierColor(tier) + (m.membership_tier === tier ? '60' : '40') }}>
                          {m.membership_tier === tier ? <><CheckCircle size={11} /> Current Plan</> : `Set to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="p-4 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8899bb' }}>Adjust Credits</p>
                    <p className="text-xs mb-3" style={{ color: '#8899bb' }}>Balance: <strong style={{ color: '#fbbf24' }}>{(m.credits || 0).toLocaleString()}</strong></p>
                    <p className="text-xs mb-1.5" style={{ color: '#8899bb' }}>Quick add:</p>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[100, 500, 1000, 2000, 5000, 10000].map(amt => (
                        <button key={amt} onClick={() => quickAddCredits(m, amt)} disabled={actionLoading}
                          className="text-xs py-1.5 rounded-lg font-semibold disabled:opacity-50"
                          style={{ background: 'rgba(0,212,120,0.1)', color: '#00d478', border: '1px solid rgba(0,212,120,0.25)' }}>
                          +{amt >= 1000 ? (amt / 1000) + 'k' : amt}
                        </button>
                      ))}
                    </div>
                    <input value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                      placeholder="Custom amount" type="number" min="1"
                      className="input text-sm mb-2" style={{ background: '#0a0e1a' }} />
                    <input value={creditNote} onChange={e => setCreditNote(e.target.value)}
                      placeholder="Note (optional)" className="input text-sm mb-2" style={{ background: '#0a0e1a' }} />
                    <div className="flex gap-2">
                      <button onClick={() => adjustCredits(m, 'add')} disabled={actionLoading || !creditAmount}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                        style={{ background: 'rgba(0,212,120,0.1)', color: '#00d478', border: '1px solid rgba(0,212,120,0.3)' }}>
                        <Coins size={10} /> Add
                      </button>
                      <button onClick={() => adjustCredits(m, 'deduct')} disabled={actionLoading || !creditAmount}
                        className="flex-1 text-xs py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <Coins size={10} /> Deduct
                      </button>
                    </div>
                  </div>

                  {/* Account */}
                  <div className="p-4 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8899bb' }}>Account Status</p>
                    <div className="space-y-2 text-xs mb-4">
                      {[
                        ['Status',     m.is_active ? '● Active' : '● Suspended'],
                        ['Sub Status', m.subscription_status || 'free'],
                        ['Campaigns',  (m.total_emails_sent || 0) + ' sent'],
                        ['Today',      (m.emails_sent_today || 0) + ' sent'],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between" style={{ borderBottom: '1px solid #1e2840', paddingBottom: 4 }}>
                          <span style={{ color: '#8899bb' }}>{label}</span>
                          <span style={{ color: '#f0f4ff' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => toggleActive(m)} disabled={actionLoading}
                      className="w-full text-xs px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                      style={{ background: m.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,120,0.1)', color: m.is_active ? '#f87171' : '#00d478', border: '1px solid ' + (m.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,120,0.3)') }}>
                      {m.is_active ? <><UserX size={12} /> Suspend Member</> : <><UserCheck size={12} /> Reactivate Member</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

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
