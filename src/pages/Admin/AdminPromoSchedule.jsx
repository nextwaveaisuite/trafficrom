import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Play, Pause, RefreshCw, CheckCircle, Zap, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const FREQUENCIES = [
  { value: 'weekly',      label: 'Weekly',       desc: 'Every 7 days' },
  { value: 'fortnightly', label: 'Fortnightly',   desc: 'Every 14 days' },
  { value: 'monthly',     label: 'Monthly',       desc: 'Every 30 days' },
];

const CREDIT_TYPES = [
  { value: 'general',     label: 'General Credits',    emoji: '⭐' },
  { value: 'banner_ads',  label: 'Banner Ad Credits',  emoji: '🖼️' },
  { value: 'solo_ads',    label: 'Solo Ad Credits',    emoji: '📢' },
  { value: 'email_sends', label: 'Email Send Credits', emoji: '📧' },
  { value: 'bonus',       label: 'Bonus Credits',      emoji: '🎁' },
];

const inputStyle = {
  background: '#151d30',
  border: '1px solid #1e2840',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#f0f4ff',
  fontFamily: 'DM Sans',
  outline: 'none',
  width: '100%',
};

const AdminPromoSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    label: '',
    credit_type: 'general',
    credits: 500,
    frequency: 'monthly',
    max_uses: '',
    expires_days: 30,
    auto_announce: true,
    is_active: true,
  });

  const fetchSchedules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('promo_schedules')
      .select('*')
      .order('created_at', { ascending: false });
    setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSchedules(); }, []);

  const saveSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('promo_schedules').insert({
      label: form.label || `${form.frequency} ${form.credit_type} code`,
      credit_type: form.credit_type,
      credits: parseInt(form.credits),
      frequency: form.frequency,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_days: parseInt(form.expires_days) || 30,
      auto_announce: form.auto_announce,
      is_active: form.is_active,
    });
    if (!error) {
      setMsg('Schedule created! Codes will auto-generate on your set frequency.');
      setShowForm(false);
      setForm({ label: '', credit_type: 'general', credits: 500, frequency: 'monthly', max_uses: '', expires_days: 30, auto_announce: true, is_active: true });
      fetchSchedules();
      setTimeout(() => setMsg(''), 4000);
    }
    setSaving(false);
  };

  const toggleSchedule = async (schedule) => {
    await supabase.from('promo_schedules').update({ is_active: !schedule.is_active }).eq('id', schedule.id);
    fetchSchedules();
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule? Previously generated codes will remain active.')) return;
    await supabase.from('promo_schedules').delete().eq('id', id);
    fetchSchedules();
  };

  const triggerNow = async (schedule) => {
    setTriggering(schedule.id);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const prefixes = { general: 'ROM', banner_ads: 'BANNER', solo_ads: 'SOLO', email_sends: 'MAIL', bonus: 'BONUS' };
    const prefix = prefixes[schedule.credit_type] || 'ROM';
    const month = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
    const random = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const newCode = `${prefix}${month}${random}`;
    const expiresAt = new Date(Date.now() + (schedule.expires_days || 30) * 24 * 60 * 60 * 1000);
    const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    await supabase.from('promo_codes').update({ is_active: false }).eq('schedule_id', schedule.id).eq('is_active', true);

    await supabase.from('promo_codes').insert({
      code: newCode,
      credits: schedule.credits,
      credit_type: schedule.credit_type,
      description: `${schedule.label} — ${monthLabel} (Auto)`,
      max_uses: schedule.max_uses || null,
      expires_at: expiresAt.toISOString(),
      is_active: true,
      schedule_id: schedule.id,
      uses_count: 0,
    });

    if (schedule.auto_announce) {
      await supabase.from('announcements').insert({
        title: `🎁 New Promo Code — ${monthLabel}!`,
        message: `Claim your free ${schedule.credits} credits!\n\nYour code: **${newCode}**\n\nGo to Dashboard → Credits → Enter promo code. Valid until ${expiresAt.toLocaleDateString()}.`,
        type: 'promo',
        promo_code: newCode,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    await supabase.from('promo_schedules').update({ last_run_at: new Date().toISOString(), last_code: newCode }).eq('id', schedule.id);

    setMsg(`✓ Code generated: ${newCode} (${schedule.credits} credits)${schedule.auto_announce ? ' — announced to members' : ''}`);
    setTriggering(null);
    fetchSchedules();
    setTimeout(() => setMsg(''), 5000);
  };

  const freqColor = (f) => ({ weekly: '#00d478', fortnightly: '#60a5fa', monthly: '#fbbf24' }[f] || '#8899bb');
  const typeInfo = (t) => CREDIT_TYPES.find(c => c.value === t) || CREDIT_TYPES[0];

  const nextRunDate = (schedule) => {
    if (!schedule.last_run_at) return 'Next run: immediately';
    const last = new Date(schedule.last_run_at);
    const days = { weekly: 7, fortnightly: 14, monthly: 30 }[schedule.frequency] || 30;
    const next = new Date(last.getTime() + days * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Due now';
    return `Next run: in ${diff} day${diff === 1 ? '' : 's'}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
            <Clock size={22} style={{ color: '#fbbf24' }} /> Promo Code Autopilot
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Set up automatic promo code generation on a schedule — runs itself, no manual work needed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSchedules} className="p-2 rounded-lg" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm"
            style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
            <Plus size={15} /> New Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 my-5">
        {[
          { icon: Calendar,     label: 'You set a schedule',    desc: 'Choose weekly, fortnightly or monthly' },
          { icon: Zap,          label: 'Auto-generates code',   desc: 'New code created at 9am UTC each cycle' },
          { icon: CheckCircle,  label: 'Members notified',      desc: 'Announcement posted in member dashboard' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="p-3 rounded-xl text-center" style={{ background: '#0f1525', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Icon size={18} className="mx-auto mb-1" style={{ color: '#fbbf24' }} />
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#f0f4ff' }}>{label}</p>
            <p className="text-xs" style={{ color: '#8899bb' }}>{desc}</p>
          </div>
        ))}
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          <CheckCircle size={14} /> {msg}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#0f1525', border: '1px solid rgba(251,191,36,0.3)' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
            <Clock size={14} style={{ color: '#fbbf24' }} /> New Auto Schedule
          </h2>
          <form onSubmit={saveSchedule} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Schedule Name</label>
                <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Monthly Banner Credits" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Credits to Award *</label>
                <input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))}
                  placeholder="500" style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Credit Type</label>
                <select value={form.credit_type} onChange={e => setForm(p => ({ ...p, credit_type: e.target.value }))} style={inputStyle}>
                  {CREDIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Frequency</label>
                <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} style={inputStyle}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Max Uses per Code (blank = unlimited)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                  placeholder="e.g. 1000" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>Code Valid For (days)</label>
                <input type="number" value={form.expires_days} onChange={e => setForm(p => ({ ...p, expires_days: e.target.value }))}
                  placeholder="30" style={inputStyle} />
              </div>
            </div>

            <div className="flex gap-4">
              {[
                { key: 'auto_announce', label: 'Auto-announce to members', desc: 'Posts announcement in member dashboard' },
                { key: 'is_active',     label: 'Active immediately',       desc: 'Start generating on next scheduled run' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg flex-1" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#8899bb' }}>{desc}</p>
                  </div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                    className="w-10 h-6 rounded-full transition-all relative ml-auto shrink-0"
                    style={{ background: form[key] ? '#00d478' : '#1e2840' }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form[key] ? '18px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
                {saving
                  ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
                  : <><Clock size={14} /> Save Schedule</>
                }
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #1e2840', color: '#8899bb' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="p-10 text-center" style={{ color: '#8899bb' }}>Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="p-10 text-center rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
            <Clock size={36} className="mx-auto mb-3" style={{ color: '#8899bb' }} />
            <p className="font-semibold mb-1" style={{ color: '#f0f4ff' }}>No schedules yet</p>
            <p className="text-sm mb-4" style={{ color: '#8899bb' }}>Create your first auto-schedule and promo codes will generate themselves.</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 mx-auto"
              style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne' }}>
              <Plus size={14} /> Create First Schedule
            </button>
          </div>
        ) : schedules.map(schedule => {
          const type = typeInfo(schedule.credit_type);
          const freq = FREQUENCIES.find(f => f.value === schedule.frequency);
          return (
            <div key={schedule.id} className="rounded-xl p-5"
              style={{ background: '#0f1525', border: '1px solid ' + (schedule.is_active ? 'rgba(251,191,36,0.25)' : '#1e2840'), opacity: schedule.is_active ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(251,191,36,0.1)' }}>
                    {type.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{schedule.label || `${freq?.label} ${type.label}`}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: freqColor(schedule.frequency) + '18', color: freqColor(schedule.frequency) }}>{freq?.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: schedule.is_active ? 'rgba(0,212,120,0.1)' : 'rgba(239,68,68,0.1)', color: schedule.is_active ? '#00d478' : '#f87171' }}>
                        {schedule.is_active ? '● Active' : '● Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: '#8899bb' }}>
                      <span><strong style={{ color: '#fbbf24' }}>{schedule.credits}</strong> credits per code</span>
                      <span>{schedule.max_uses ? `Max ${schedule.max_uses} uses` : 'Unlimited uses'}</span>
                      <span>Expires in {schedule.expires_days} days</span>
                      {schedule.auto_announce && <span style={{ color: '#00d478' }}>✓ Auto-announces</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-1 flex-wrap" style={{ color: '#8899bb' }}>
                      {schedule.last_run_at && <span>Last run: {timeAgo(schedule.last_run_at)}</span>}
                      {schedule.last_code && <span>Last code: <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{schedule.last_code}</strong></span>}
                      <span style={{ color: freqColor(schedule.frequency) }}>{nextRunDate(schedule)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => triggerNow(schedule)} disabled={triggering === schedule.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                    style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                    {triggering === schedule.id
                      ? <div className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }} />
                      : <><Zap size={11} /> Now</>
                    }
                  </button>
                  <button onClick={() => toggleSchedule(schedule)} className="p-1.5 rounded-lg"
                    style={{ color: schedule.is_active ? '#fbbf24' : '#00d478', border: '1px solid #1e2840' }}>
                    {schedule.is_active ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => deleteSchedule(schedule.id)} className="p-1.5 rounded-lg" style={{ color: '#f87171' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899bb' }}>⚙️ How the Autopilot Works</p>
        <div className="grid md:grid-cols-2 gap-3 text-xs" style={{ color: '#8899bb' }}>
          <div><p className="font-semibold mb-0.5" style={{ color: '#f0f4ff' }}>Automatic daily check</p>Runs every day at 9am UTC, checks all active schedules and generates new codes when due.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: '#f0f4ff' }}>Old codes deactivated</p>When a new code generates, the previous one for that schedule is automatically deactivated.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: '#f0f4ff' }}>Generate Now button</p>Use ⚡ Now to instantly generate a code outside the normal schedule for special events.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: '#f0f4ff' }}>Member announcements</p>With auto-announce on, members see a notification in their dashboard whenever a new code drops.</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoSchedule;
