import { useEffect, useState } from 'react';
import { Mail, TrendingUp, Users, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatDate, openRateBadge } from '../../utils/helpers';

const CampaignHistory = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setCampaigns(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchCampaigns(); }, [user, page]);

  const statusColor = (status) => ({
    sent:      { bg: 'rgba(0,212,120,0.1)',     color: 'var(--brand-green)' },
    pending:   { bg: 'rgba(251,191,36,0.1)',    color: '#fbbf24' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',     color: '#f87171' },
  }[status] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)' });

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Campaign History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track performance of all your email campaigns</p>
        </div>
        <button onClick={fetchCampaigns} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: 'var(--brand-green)', borderTopColor: 'transparent' }} />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center">
            <Mail size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No campaigns yet</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your campaign history will appear here once you send your first email.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <div className="col-span-2">Subject</div>
              <div>Date</div>
              <div>Recipients</div>
              <div>Open Rate</div>
              <div>Status</div>
            </div>

            {campaigns.map((c) => {
              const s = statusColor(c.status);
              return (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                    {c.target_category && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.target_category}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    {formatDate(c.created_at)}
                  </div>
                  <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <Users size={12} style={{ color: 'var(--text-muted)' }} />
                    {c.recipients_count?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={12} style={{ color: 'var(--text-muted)' }} />
                    {openRateBadge(c.opens_count, c.recipients_count)}
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>← Previous</button>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {page + 1}</span>
              <button onClick={() => setPage(page + 1)} disabled={campaigns.length < PAGE_SIZE} className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
