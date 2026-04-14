import { useEffect, useState } from 'react';
import { Mail, Search, Trash2, Eye, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, openRateBadge } from '../../utils/helpers';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const PAGE_SIZE = 15;

  const fetchCampaigns = async () => {
    setLoading(true);
    let query = supabase
      .from('email_campaigns')
      .select('id, subject, message, target_category, recipients_count, opens_count, clicks_count, credits_used, status, created_at, user_id, profiles(username, first_name, last_name)')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) query = query.ilike('subject', '%' + search + '%');
    const { data } = await query;
    setCampaigns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign permanently?')) return;
    await supabase.from('email_campaigns').delete().eq('id', id);
    setActionMsg('Campaign deleted.');
    fetchCampaigns();
    setTimeout(() => setActionMsg(''), 3000);
  };

  const statusStyle = (status) => ({
    sent:      { bg: 'rgba(0,212,120,0.1)',    color: '#00d478' },
    pending:   { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',    color: '#f87171' },
  }[status] || { bg: '#1e2840', color: '#8899bb' });

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Campaign Management</h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Monitor and moderate all email campaigns</p>
        </div>
        <button onClick={fetchCampaigns} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>✓ {actionMsg}</div>
      )}

      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); setPage(0); fetchCampaigns(); }} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8899bb' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject..." className="input pl-9 text-sm" style={{ background: '#0f1525' }} />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#e11d48', color: '#fff' }}>Search</button>
      </form>

      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <div className="hidden md:grid grid-cols-7 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid #1e2840', color: '#8899bb' }}>
          <div className="col-span-2">Subject</div>
          <div>Sender</div>
          <div>Recipients</div>
          <div>Open Rate</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center">
            <Mail size={32} className="mx-auto mb-3" style={{ color: '#8899bb' }} />
            <p style={{ color: '#8899bb' }}>No campaigns found.</p>
          </div>
        ) : campaigns.map((c) => {
          const s = statusStyle(c.status);
          return (
            <div key={c.id}>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid #1e2840' }}>
                <div className="col-span-2 overflow-hidden">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f4ff' }}>{c.subject}</p>
                  <p className="text-xs" style={{ color: '#8899bb' }}>{c.target_category} · {formatDate(c.created_at)}</p>
                </div>
                <div className="text-xs" style={{ color: '#8899bb' }}>
                  {c.profiles ? `@${c.profiles.username}` : 'Unknown'}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>{c.recipients_count?.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm" style={{ color: '#f0f4ff' }}>
                  <TrendingUp size={12} style={{ color: '#8899bb' }} />
                  {openRateBadge(c.opens_count, c.recipients_count)}
                </div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{c.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(preview?.id === c.id ? null : c)} className="p-1.5 rounded" style={{ color: '#8899bb' }} title="Preview">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded" style={{ color: '#f87171' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Preview panel */}
              {preview?.id === c.id && (
                <div className="px-5 py-4" style={{ background: '#151d30', borderBottom: '1px solid #1e2840' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>Email Preview</p>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#f0f4ff' }}>Subject: {c.subject}</p>
                  <div className="text-sm p-4 rounded-lg whitespace-pre-wrap" style={{ background: '#0f1525', color: '#8899bb', border: '1px solid #1e2840', maxHeight: 300, overflowY: 'auto' }}>
                    {c.message}
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#8899bb' }}>Credits used: {c.credits_used?.toLocaleString()}</p>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>← Prev</button>
          <span className="text-xs" style={{ color: '#8899bb' }}>Page {page + 1}</span>
          <button onClick={() => setPage(page + 1)} disabled={campaigns.length < PAGE_SIZE} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>Next →</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;
