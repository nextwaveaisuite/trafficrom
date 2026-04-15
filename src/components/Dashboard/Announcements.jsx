import { useEffect, useState } from 'react';
import { Bell, Tag, X, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed_announcements') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    try { localStorage.setItem('dismissed_announcements', JSON.stringify(updated)); } catch {}
  };

  const visible = announcements.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const typeStyles = {
    promo:    { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', icon: Tag,  color: '#fbbf24' },
    general:  { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', icon: Bell, color: '#60a5fa' },
    reward:   { bg: 'rgba(0,212,120,0.08)',  border: 'rgba(0,212,120,0.25)',  icon: Gift, color: '#00d478' },
  };

  return (
    <div className="space-y-3 mb-6">
      {visible.map(a => {
        const s = typeStyles[a.type] || typeStyles.general;
        const Icon = s.icon;
        // Format message — convert **bold** to actual bold
        const formatted = a.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
        return (
          <div key={a.id} className="p-4 rounded-xl flex items-start gap-3 animate-fade-in"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + '20' }}>
              <Icon size={15} style={{ color: s.color }} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{a.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: formatted }} />
              {a.promo_code && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                  <Tag size={12} style={{ color: '#fbbf24' }} />
                  <span className="font-mono font-bold text-sm" style={{ color: '#fbbf24' }}>{a.promo_code}</span>
                  <button onClick={() => { navigator.clipboard.writeText(a.promo_code); }}
                    className="text-xs px-2 py-0.5 rounded font-semibold ml-1"
                    style={{ background: '#fbbf24', color: '#0a0e1a' }}>
                    Copy
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => dismiss(a.id)} className="p-1 rounded shrink-0" style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Announcements;
