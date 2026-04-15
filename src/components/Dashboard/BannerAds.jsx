import { useEffect, useState } from 'react';
import { Image, Plus, Trash2, CheckCircle, Clock, XCircle, Info, Coins } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const BANNER_PACKAGES = [
  { id: 'sm',  label: 'Starter',    impressions: 500,   credits: 50,  size: '468×60',   desc: 'Banner bar' },
  { id: 'md',  label: 'Growth',     impressions: 2000,  credits: 150, size: '300×250',  desc: 'Medium rectangle' },
  { id: 'lg',  label: 'Premium',    impressions: 5000,  credits: 300, size: '728×90',   desc: 'Leaderboard' },
  { id: 'xl',  label: 'Dominator',  impressions: 15000, credits: 750, size: '160×600',  desc: 'Wide skyscraper' },
];

const STATUS_STYLES = {
  pending:  { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24', label: 'Pending Review', icon: Clock },
  approved: { bg: 'rgba(0,212,120,0.1)',    color: '#00d478', label: 'Active',         icon: CheckCircle },
  rejected: { bg: 'rgba(239,68,68,0.1)',    color: '#f87171', label: 'Rejected',       icon: XCircle },
};

const BannerAds = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    image_url: '',
    destination_url: '',
    banner_size: '468×60',
    package_id: 'sm',
  });

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banner_ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchBanners(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPkg = BANNER_PACKAGES.find(p => p.id === form.package_id);
  const canAfford = (profile?.credits || 0) >= (selectedPkg?.credits || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAfford) return;
    setSubmitting(true);

    // Deduct credits
    await supabase.rpc('earn_credits', {
      p_user_id: user.id,
      p_amount: -selectedPkg.credits,
      p_description: `Banner ad: ${form.title} (${selectedPkg.label} package)`,
    });

    // Insert banner
    await supabase.from('banner_ads').insert({
      user_id: user.id,
      title: form.title,
      image_url: form.image_url,
      destination_url: form.destination_url,
      banner_size: form.banner_size,
      package_id: form.package_id,
      impressions_purchased: selectedPkg.impressions,
      impressions_remaining: selectedPkg.impressions,
      status: 'pending',
    });

    setMsg('Banner submitted for review! You will be notified once approved.');
    setShowForm(false);
    setForm({ title: '', image_url: '', destination_url: '', banner_size: '468×60', package_id: 'sm' });
    refreshProfile();
    fetchBanners();
    setSubmitting(false);
    setTimeout(() => setMsg(''), 5000);
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    await supabase.from('banner_ads').delete().eq('id', id);
    fetchBanners();
  };

  const inputStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', outline: 'none', width: '100%' };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Banner Ads</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={14} /> Create Banner
        </button>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Get your brand seen across the Traffic ROM platform. Banners rotate on the dashboard, inbox and member pages.</p>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-5" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.25)' }}>
          <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} />
          <p className="text-sm" style={{ color: 'var(--brand-green)' }}>{msg}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>New Banner Ad</h2>

          {/* Package selector */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Choose Package</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BANNER_PACKAGES.map(pkg => (
                <button key={pkg.id} type="button" onClick={() => setForm(p => ({ ...p, package_id: pkg.id, banner_size: pkg.size }))}
                  className="p-3 rounded-lg text-left transition-all"
                  style={{ border: '1px solid ' + (form.package_id === pkg.id ? 'var(--brand-green)' : 'var(--border)'), background: form.package_id === pkg.id ? 'rgba(0,212,120,0.08)' : 'var(--bg-secondary)' }}>
                  <p className="text-sm font-bold" style={{ fontFamily: 'Syne', color: form.package_id === pkg.id ? 'var(--brand-green)' : 'var(--text-primary)' }}>{pkg.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pkg.impressions.toLocaleString()} impressions</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.size} · {pkg.desc}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#fbbf24' }}>{pkg.credits} credits</p>
                </button>
              ))}
            </div>
            {!canAfford && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Info size={13} style={{ color: '#f87171' }} />
                <p className="text-xs" style={{ color: '#f87171' }}>Not enough credits. You need {selectedPkg?.credits} but have {profile?.credits || 0}.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Banner Title (internal reference) *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. My Affiliate Offer June" style={inputStyle} required />
            </div>
            <div>
              <label className="label">Banner Image URL *</label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://yourdomain.com/banner.jpg" style={inputStyle} required />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Host your banner on Imgur, Cloudinary, or your own server. Recommended size: {form.banner_size}px</p>
            </div>
            {form.image_url && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Preview</p>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <img src={form.image_url} alt="Banner preview" className="max-w-full rounded" style={{ maxHeight: 120 }} onError={e => e.target.style.display = 'none'} />
                </div>
              </div>
            )}
            <div>
              <label className="label">Destination URL (where clicks go) *</label>
              <input value={form.destination_url} onChange={e => setForm(p => ({ ...p, destination_url: e.target.value }))} placeholder="https://your-affiliate-link.com" style={inputStyle} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting || !canAfford} className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-50">
                {submitting ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} /> : <><Coins size={14} /> Submit for {selectedPkg?.credits} credits</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      <div className="space-y-4">
        {loading ? (
          <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="card p-10 text-center">
            <Image size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>No banners yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create your first banner ad to get exposure across the platform.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
              <Plus size={14} /> Create Banner
            </button>
          </div>
        ) : banners.map(b => {
          const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
          const Icon = s.icon;
          const pct = b.impressions_purchased ? Math.round(((b.impressions_purchased - (b.impressions_remaining || 0)) / b.impressions_purchased) * 100) : 0;
          return (
            <div key={b.id} className="card p-5">
              <div className="flex items-start gap-4">
                {/* Banner preview */}
                <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <Image size={20} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ background: s.bg, color: s.color }}>
                      <Icon size={10} /> {s.label}
                    </span>
                  </div>
                  <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{b.destination_url}</p>

                  {/* Impression progress */}
                  <div className="mb-1">
                    <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      <span>Impressions used: {(b.impressions_purchased - (b.impressions_remaining || 0)).toLocaleString()} / {b.impressions_purchased?.toLocaleString()}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: 'var(--brand-green)' }} />
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.banner_size} · Added {timeAgo(b.created_at)}</p>
                </div>

                <button onClick={() => deleteBanner(b.id)} className="p-1.5 rounded shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 size={14} />
                </button>
              </div>
              {b.status === 'rejected' && b.rejection_reason && (
                <div className="mt-3 p-2 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  Rejection reason: {b.rejection_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>How Banner Ads Work</p>
        <div className="grid md:grid-cols-3 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>1. Submit your banner</p>Upload an image and destination URL, choose your impression package.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>2. Admin review</p>Banners are reviewed within 24 hours to ensure quality and compliance.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>3. Go live</p>Once approved, your banner rotates across the platform until impressions run out.</div>
        </div>
      </div>
    </div>
  );
};

export default BannerAds;
