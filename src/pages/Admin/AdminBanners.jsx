import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Trash2, RefreshCw, Image, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [preview, setPreview] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    let query = supabase
      .from('banner_ads')
      .select('*, profiles(username, first_name, last_name)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (banner) => {
    await supabase.from('banner_ads').update({ status: 'approved' }).eq('id', banner.id);
    setActionMsg(`Banner "${banner.title}" approved and now live!`);
    fetchBanners();
    setTimeout(() => setActionMsg(''), 3000);
  };

  const reject = async (banner) => {
    await supabase.from('banner_ads').update({ status: 'rejected', rejection_reason: rejectReason || 'Does not meet guidelines.' }).eq('id', banner.id);
    setActionMsg(`Banner "${banner.title}" rejected.`);
    setRejectingId(null);
    setRejectReason('');
    fetchBanners();
    setTimeout(() => setActionMsg(''), 3000);
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    await supabase.from('banner_ads').delete().eq('id', id);
    fetchBanners();
  };

  const statusStyle = (s) => ({
    pending:  { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
    approved: { bg: 'rgba(0,212,120,0.1)',  color: '#00d478' },
    rejected: { bg: 'rgba(239,68,68,0.1)',  color: '#f87171' },
  }[s] || { bg: '#1e2840', color: '#8899bb' });

  const pendingCount = banners.filter(b => b.status === 'pending').length;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
            Banner Ad Manager
            {pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Review, approve and manage member banner ads</p>
        </div>
        <button onClick={fetchBanners} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          <CheckCircle size={14} /> {actionMsg}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider capitalize transition-all"
            style={{ background: filter === tab ? '#e11d48' : '#0f1525', color: filter === tab ? '#fff' : '#8899bb', border: '1px solid ' + (filter === tab ? '#e11d48' : '#1e2840') }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center">
            <Image size={32} className="mx-auto mb-3" style={{ color: '#8899bb' }} />
            <p style={{ color: '#8899bb' }}>No {filter !== 'all' ? filter : ''} banners found.</p>
          </div>
        ) : banners.map(b => {
          const s = statusStyle(b.status);
          return (
            <div key={b.id}>
              <div className="flex items-start gap-4 px-5 py-4" style={{ borderBottom: '1px solid #1e2840' }}>
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <Image size={18} style={{ color: '#8899bb' }} />
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm" style={{ color: '#f0f4ff' }}>{b.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{b.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e2840', color: '#8899bb' }}>{b.banner_size}</span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: '#8899bb' }}>
                    By @{b.profiles?.username} · {timeAgo(b.created_at)}
                  </p>
                  <p className="text-xs mb-2 flex items-center gap-1 truncate" style={{ color: '#8899bb' }}>
                    <ExternalLink size={10} /> {b.destination_url}
                  </p>
                  <p className="text-xs" style={{ color: '#8899bb' }}>
                    {(b.impressions_purchased - (b.impressions_remaining || 0)).toLocaleString()} / {b.impressions_purchased?.toLocaleString()} impressions used
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setPreview(preview?.id === b.id ? null : b)} className="p-1.5 rounded" style={{ color: '#8899bb' }} title="Preview">
                    <Eye size={14} />
                  </button>
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => approve(b)} className="p-1.5 rounded" style={{ color: '#00d478' }} title="Approve">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => setRejectingId(rejectingId === b.id ? null : b.id)} className="p-1.5 rounded" style={{ color: '#f87171' }} title="Reject">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {b.status === 'approved' && (
                    <button onClick={() => supabase.from('banner_ads').update({ status: 'pending' }).eq('id', b.id).then(fetchBanners)}
                      className="text-xs px-2 py-1 rounded" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
                      Pause
                    </button>
                  )}
                  <button onClick={() => deleteBanner(b.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              {preview?.id === b.id && (
                <div className="px-5 py-4" style={{ background: '#151d30', borderBottom: '1px solid #1e2840' }}>
                  <img src={b.image_url} alt={b.title} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #1e2840' }} />
                </div>
              )}

              {/* Reject form */}
              {rejectingId === b.id && (
                <div className="px-5 py-4 space-y-3" style={{ background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid #1e2840' }}>
                  <p className="text-xs font-bold" style={{ color: '#f87171' }}>Rejection reason (shown to member):</p>
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Image does not meet size requirements or contains prohibited content."
                    style={{ background: '#0f1525', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', color: '#f0f4ff', fontFamily: 'DM Sans', outline: 'none', width: '100%', fontSize: 13 }} />
                  <div className="flex gap-2">
                    <button onClick={() => reject(b)} className="px-4 py-1.5 rounded-lg text-sm font-semibold" style={{ background: '#e11d48', color: '#fff' }}>Confirm Reject</button>
                    <button onClick={() => setRejectingId(null)} className="px-4 py-1.5 rounded-lg text-sm" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminBanners;
