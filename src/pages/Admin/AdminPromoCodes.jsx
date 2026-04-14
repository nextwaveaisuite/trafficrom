import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/helpers';

const CREDIT_TYPES = ['general', 'banner_ads', 'solo_ads', 'email_sends', 'bonus'];

const AdminPromoCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [form, setForm] = useState({
    code: '',
    credits: 500,
    credit_type: 'general',
    description: '',
    max_uses: '',
    expires_at: '',
  });

  const fetchCodes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('promo_codes')
      .select('*, promo_code_redemptions(count)')
      .order('created_at', { ascending: false });
    setCodes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const prefix = form.credit_type === 'banner_ads' ? 'BANNER' :
                   form.credit_type === 'solo_ads' ? 'SOLO' :
                   form.credit_type === 'email_sends' ? 'MAIL' : 'ROM';
    const random = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(prev => ({ ...prev, code: prefix + random }));
  };

  const createCode = async (e) => {
    e.preventDefault();
    if (!form.code || !form.credits || !form.description) return;

    const { error } = await supabase.from('promo_codes').insert({
      code: form.code.toUpperCase(),
      credits: parseInt(form.credits),
      credit_type: form.credit_type,
      description: form.description,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
      uses_count: 0,
    });

    if (!error) {
      setActionMsg('Promo code created successfully!');
      setShowForm(false);
      setForm({ code: '', credits: 500, credit_type: 'general', description: '', max_uses: '', expires_at: '' });
      fetchCodes();
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const toggleActive = async (code) => {
    await supabase.from('promo_codes').update({ is_active: !code.is_active }).eq('id', code.id);
    fetchCodes();
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    setActionMsg('Code deleted.');
    fetchCodes();
    setTimeout(() => setActionMsg(''), 3000);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const inputStyle = { background: '#151d30', border: '1px solid #1e2840', borderRadius: 8, padding: '8px 12px', color: '#f0f4ff', fontFamily: 'DM Sans', outline: 'none' };
  const typeColor = (t) => ({ general: '#60a5fa', banner_ads: '#a78bfa', solo_ads: '#fbbf24', email_sends: '#00d478', bonus: '#f87171' }[t] || '#8899bb');

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Promo Codes</h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Create and manage promotional credit codes for members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCodes} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm"
            style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
            <Plus size={15} /> Create Code
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          <CheckCircle size={14} /> {actionMsg}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#0f1525', border: '1px solid rgba(251,191,36,0.3)' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
            <Tag size={15} style={{ color: '#fbbf24' }} /> New Promo Code
          </h2>
          <form onSubmit={createCode} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Code *</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BANNER500" className="flex-1" style={{ ...inputStyle }} required />
                  <button type="button" onClick={generateCode} className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: '#1e2840', color: '#8899bb' }}>
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Credits to Award *</label>
                <input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))}
                  placeholder="500" style={{ ...inputStyle, width: '100%' }} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Credit Type *</label>
                <select value={form.credit_type} onChange={e => setForm(p => ({ ...p, credit_type: e.target.value }))}
                  style={{ ...inputStyle, width: '100%' }}>
                  {CREDIT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Description *</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. 500 Banner Ad Credits — April 2026" style={{ ...inputStyle, width: '100%' }} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Max Uses (blank = unlimited)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                  placeholder="e.g. 1000" style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Expires At (optional)</label>
                <input type="datetime-local" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                  style={{ ...inputStyle, width: '100%' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Member-facing message</label>
              <p className="text-xs p-2 rounded-lg" style={{ background: '#151d30', color: '#00d478', border: '1px solid #1e2840' }}>
                Preview: "+{form.credits} credits added! — {form.description || 'Promo code redeemed'}"
              </p>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
                Create Code
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes list */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid #1e2840', color: '#8899bb' }}>
          <div>Code</div>
          <div>Credits</div>
          <div>Type</div>
          <div>Uses</div>
          <div>Expires</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>Loading codes...</div>
        ) : codes.length === 0 ? (
          <div className="p-10 text-center">
            <Tag size={32} className="mx-auto mb-3" style={{ color: '#8899bb' }} />
            <p style={{ color: '#8899bb' }}>No promo codes yet. Create your first one!</p>
          </div>
        ) : codes.map((c) => (
          <div key={c.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid #1e2840', opacity: c.is_active ? 1 : 0.5 }}>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm" style={{ color: '#fbbf24' }}>{c.code}</span>
              <button onClick={() => copyCode(c.code)} style={{ color: '#8899bb' }}>
                {copied === c.code ? <CheckCircle size={12} style={{ color: '#00d478' }} /> : <Copy size={12} />}
              </button>
            </div>
            <div className="font-bold text-sm" style={{ color: '#f0f4ff' }}>+{c.credits?.toLocaleString()}</div>
            <div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: typeColor(c.credit_type) + '18', color: typeColor(c.credit_type) }}>
                {c.credit_type?.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm" style={{ color: '#8899bb' }}>
              {c.uses_count || 0}{c.max_uses ? `/${c.max_uses}` : ' used'}
            </div>
            <div className="text-xs" style={{ color: '#8899bb' }}>
              {c.expires_at ? formatDate(c.expires_at) : 'Never'}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(c)}
                className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
                style={{ background: c.is_active ? 'rgba(0,212,120,0.1)' : 'rgba(239,68,68,0.1)', color: c.is_active ? '#00d478' : '#f87171', border: '1px solid ' + (c.is_active ? 'rgba(0,212,120,0.3)' : 'rgba(239,68,68,0.3)') }}>
                {c.is_active ? 'Active' : 'Paused'}
              </button>
              <button onClick={() => deleteCode(c.id)} style={{ color: '#f87171' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>💡 Promo Code Strategy Tips</p>
        <div className="grid md:grid-cols-3 gap-3 text-xs" style={{ color: '#8899bb' }}>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#f0f4ff' }}>Monthly Codes</p>
            Post a new code in your newsletter each month. Members who stay subscribed get rewarded.
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#f0f4ff' }}>Social Media Codes</p>
            Share exclusive codes on Facebook groups or Twitter to drive new signups.
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#f0f4ff' }}>Targeted Credit Types</p>
            Use "banner_ads" or "solo_ads" type codes to encourage members to try premium features.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoCodes;
