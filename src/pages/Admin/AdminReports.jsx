import { useEffect, useState } from 'react';
import { Flag, RefreshCw, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const AdminReports = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('email_campaigns')
      .select('*, profiles(username, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    setCampaigns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const flagCampaign = async (id, flagged) => {
    await supabase.from('email_campaigns').update({ is_flagged: flagged }).eq('id', id);
    fetchCampaigns();
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    await supabase.from('email_campaigns').delete().eq('id', id);
    fetchCampaigns();
  };

  const filtered = filter === 'flagged' ? campaigns.filter(c => c.is_flagged) : campaigns;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Reports & Flags</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Review and moderate member campaigns</p>
        </div>
        <button onClick={fetchCampaigns} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'flagged'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize"
            style={{ background: filter === f ? 'rgba(239,68,68,0.12)' : 'var(--bg-secondary)', color: filter === f ? '#f87171' : 'var(--text-muted)', border: `1px solid ${filter === f ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
            {f === 'all' ? 'All Campaigns' : '🚩 Flagged Only'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-5 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <div className="col-span-2">Campaign</div>
          <div>Member</div>
          <div>Sent</div>
          <div className="text-right">Actions</div>
        </div>
        {loading ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Flag size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No campaigns to review.</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="grid grid-cols-5 px-5 py-3 items-center text-sm" style={{ borderBottom: '1px solid var(--border)', background: c.is_flagged ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
            <div className="col-span-2">
              <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.recipients_count?.toLocaleString()} recipients</p>
              {c.is_flagged && <span className="text-xs font-bold" style={{ color: '#f87171' }}>🚩 Flagged</span>}
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.profiles?.first_name} {c.profiles?.last_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{c.profiles?.username}</p>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => flagCampaign(c.id, !c.is_flagged)} className="p-1.5 rounded"
                style={{ color: c.is_flagged ? 'var(--brand-green)' : '#f87171' }}>
                {c.is_flagged ? <CheckCircle size={14} /> : <Flag size={14} />}
              </button>
              <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
