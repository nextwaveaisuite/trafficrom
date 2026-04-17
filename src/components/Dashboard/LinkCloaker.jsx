import { useEffect, useState } from 'react';
import { Link2, Plus, Copy, Trash2, CheckCircle, ExternalLink, BarChart2, RefreshCw, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://trafficrom.netlify.app';

const LinkCloaker = () => {
  const { user, profile } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ title: '', destination_url: '', slug: '' });
  const [slugManual, setSlugManual] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cloaked_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLinks(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchLinks(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (val) => {
    setForm(p => ({ ...p, title: val }));
    if (!slugManual) {
      const slug = (profile?.username || 'link') + '-' + val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
      setForm(p => ({ ...p, title: val, slug }));
    }
  };

  const getCloakedUrl = (slug) => `${SITE_URL}/go/${slug}`;

  const copyLink = (slug) => {
    navigator.clipboard.writeText(getCloakedUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveLink = async (e) => {
    e.preventDefault();
    if (!form.destination_url || !form.slug) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('cloaked_links')
      .select('id')
      .eq('slug', form.slug)
      .single();

    if (existing) {
      setMsg('That slug is already taken. Try a different one.');
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    let url = form.destination_url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const { error } = await supabase.from('cloaked_links').insert({
      user_id: user.id,
      title: form.title || form.slug,
      destination_url: url,
      slug: form.slug,
      is_active: true,
      clicks: 0,
    });

    if (!error) {
      setMsg('Link created! Copy and use it anywhere.');
      setShowForm(false);
      setForm({ title: '', destination_url: '', slug: '' });
      setSlugManual(false);
      fetchLinks();
      setTimeout(() => setMsg(''), 4000);
    }
    setSaving(false);
  };

  const toggleLink = async (link) => {
    await supabase.from('cloaked_links').update({ is_active: !link.is_active }).eq('id', link.id);
    fetchLinks();
  };

  const deleteLink = async (id) => {
    if (!window.confirm('Delete this link? All click data will be lost.')) return;
    await supabase.from('cloaked_links').delete().eq('id', id);
    fetchLinks();
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontFamily: 'DM Sans',
    outline: 'none',
    width: '100%',
  };

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            <Link2 size={22} style={{ color: 'var(--brand-green)' }} /> Link Cloaker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Turn long affiliate URLs into clean, trackable short links</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLinks} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus size={14} /> Cloak a Link
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 my-5">
        {[
          { label: 'Total Links',  value: links.length,                           color: 'var(--brand-green)' },
          { label: 'Active Links', value: links.filter(l => l.is_active).length,  color: '#60a5fa' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(),            color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{ background: msg.includes('taken') ? 'rgba(239,68,68,0.08)' : 'rgba(0,212,120,0.08)', border: '1px solid ' + (msg.includes('taken') ? 'rgba(239,68,68,0.2)' : 'rgba(0,212,120,0.2)'), color: msg.includes('taken') ? '#f87171' : 'var(--brand-green)' }}>
          <CheckCircle size={14} /> {msg}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold mb-4 text-sm flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            <Zap size={14} style={{ color: 'var(--brand-green)' }} /> Create Cloaked Link
          </h2>
          <form onSubmit={saveLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Link Title (for your reference)</label>
              <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. My ClickBank Offer" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Destination URL (your affiliate link) *</label>
              <input value={form.destination_url} onChange={e => setForm(p => ({ ...p, destination_url: e.target.value }))}
                placeholder="https://your-affiliate-link.com/track?id=xyz123" style={inputStyle} required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Custom Slug *</label>
                <button type="button" onClick={() => setSlugManual(!slugManual)} className="text-xs" style={{ color: 'var(--brand-green)' }}>
                  {slugManual ? 'Auto-generate' : 'Edit manually'}
                </button>
              </div>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <span className="px-3 py-2 text-xs whitespace-nowrap" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}>
                  {SITE_URL}/go/
                </span>
                <input value={form.slug}
                  onChange={e => { setSlugManual(true); setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50) })); }}
                  placeholder="your-slug" required
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }} />
              </div>
              {form.slug && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--brand-green)' }}>
                  <CheckCircle size={10} /> Preview: {getCloakedUrl(form.slug)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving || !form.destination_url || !form.slug}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-50">
                {saving
                  ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
                  : <><Link2 size={14} /> Create Cloaked Link</>
                }
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm({ title: '', destination_url: '', slug: '' }); }}
                className="btn-outline text-sm py-2 px-5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: 'var(--brand-green)', borderTopColor: 'transparent' }} />
            Loading links...
          </div>
        ) : links.length === 0 ? (
          <div className="card p-10 text-center">
            <Link2 size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>No cloaked links yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create your first cloaked link to hide and track your affiliate URLs.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
              <Plus size={14} /> Cloak Your First Link
            </button>
          </div>
        ) : links.map(link => (
          <div key={link.id} className="card p-4" style={{ opacity: link.is_active ? 1 : 0.6 }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: link.is_active ? 'rgba(0,212,120,0.12)' : 'var(--bg-secondary)' }}>
                <Link2 size={16} style={{ color: link.is_active ? 'var(--brand-green)' : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{link.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: link.is_active ? 'rgba(0,212,120,0.1)' : 'rgba(239,68,68,0.1)', color: link.is_active ? 'var(--brand-green)' : '#f87171' }}>
                    {link.is_active ? '● Active' : '● Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-mono" style={{ color: 'var(--brand-green)' }}>{getCloakedUrl(link.slug)}</p>
                  <button onClick={() => copyLink(link.slug)} className="shrink-0 p-1 rounded"
                    style={{ color: copied === link.slug ? 'var(--brand-green)' : 'var(--text-muted)' }}>
                    {copied === link.slug ? <CheckCircle size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-xs truncate mb-1" style={{ color: 'var(--text-muted)' }}>→ {link.destination_url}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <BarChart2 size={11} />
                    <strong style={{ color: '#fbbf24' }}>{(link.clicks || 0).toLocaleString()}</strong> clicks
                  </span>
                  {link.last_clicked_at && <span>Last click: {timeAgo(link.last_clicked_at)}</span>}
                  <span>Created {timeAgo(link.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={link.destination_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded" style={{ color: 'var(--text-muted)' }} title="Visit destination">
                  <ExternalLink size={14} />
                </a>
                <button onClick={() => toggleLink(link)} className="p-1.5 rounded"
                  style={{ color: link.is_active ? '#fbbf24' : 'var(--brand-green)' }}>
                  {link.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-mono flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{getCloakedUrl(link.slug)}</p>
              <button onClick={() => copyLink(link.slug)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-semibold shrink-0"
                style={{ background: copied === link.slug ? 'rgba(0,212,120,0.15)' : 'var(--brand-green)', color: copied === link.slug ? 'var(--brand-green)' : '#0a0e1a', border: copied === link.slug ? '1px solid var(--brand-green)' : 'none' }}>
                {copied === link.slug ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy Link</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>💡 How to Use Link Cloaker</p>
        <div className="grid md:grid-cols-3 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>1. Paste your affiliate link</p>Add your long affiliate URL and give it a clean slug.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>2. Copy the clean link</p>Use your short link in emails, social posts and campaigns.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>3. Track your clicks</p>See exactly how many people clicked each link in real-time.</div>
        </div>
      </div>
    </div>
  );
};

export default LinkCloaker;
