import { useState, useEffect } from 'react';
import { Megaphone, Send, Users, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const AdminBroadcasts = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all' });

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(20);
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendBroadcast = async () => {
    if (!form.title || !form.message) { showMsg('Title and message are required.', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({ title: form.title, message: form.message, type: form.type, target: form.target, is_active: true });
    setSaving(false);
    if (error) { showMsg('Failed to send broadcast.', 'error'); }
    else { showMsg('Broadcast sent!'); setForm({ title: '', message: '', type: 'info', target: 'all' }); fetchAnnouncements(); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
  };

  const toggleAnnouncement = async (id, isActive) => {
    await supabase.from('announcements').update({ is_active: !isActive }).eq('id', id);
    fetchAnnouncements();
  };

  const TYPE_COLORS = { info: '#60a5fa', success: '#00d478', warning: '#fbbf24', promo: '#f472b6' };
  const inputStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', outline: 'none', width: '100%' };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Member Broadcasts</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Send announcements to all members via the dashboard</p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-5"
          style={{ background: msgType === 'success' ? 'rgba(0,212,120,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msgType === 'success' ? 'rgba(0,212,120,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          {msgType === 'success' ? <CheckCircle size={15} style={{ color: 'var(--brand-green)' }} /> : <AlertCircle size={15} style={{ color: '#f87171' }} />}
          <p className="text-sm" style={{ color: msgType === 'success' ? 'var(--brand-green)' : '#f87171' }}>{msg}</p>
        </div>
      )}

      <div className="card p-5 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          <Megaphone size={16} style={{ color: 'var(--brand-green)' }} /> New Broadcast
        </h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                <option value="info">ℹ️ Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="promo">🎁 Promo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Target Audience</label>
              <select value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} style={inputStyle}>
                <option value="all">All Members</option>
                <option value="free">Free Members Only</option>
                <option value="paid">Paid Members Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. New feature available!" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Message *</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your announcement here..." rows={4}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button onClick={sendBroadcast} disabled={saving || !form.title || !form.message}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-60">
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
              : <><Send size={14} /> Send to {form.target === 'all' ? 'All Members' : form.target === 'free' ? 'Free Members' : 'Paid Members'}</>
            }
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Previous Broadcasts</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{announcements.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No broadcasts sent yet.</p>
          </div>
        ) : announcements.map(a => (
          <div key={a.id} className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', opacity: a.is_active ? 1 : 0.5 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                    style={{ background: (TYPE_COLORS[a.type] || '#60a5fa') + '20', color: TYPE_COLORS[a.type] || '#60a5fa' }}>
                    {a.type}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→ {a.target === 'all' ? 'All members' : a.target + ' members'}</span>
                  {!a.is_active && <span className="text-xs" style={{ color: '#f87171' }}>Hidden</span>}
                </div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{a.message}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(a.created_at)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleAnnouncement(a.id, a.is_active)} className="p-1.5 rounded"
                  style={{ color: a.is_active ? '#fbbf24' : 'var(--brand-green)' }}>
                  {a.is_active ? <Users size={14} /> : <CheckCircle size={14} />}
                </button>
                <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBroadcasts;
