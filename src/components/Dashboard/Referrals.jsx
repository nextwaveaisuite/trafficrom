import { useEffect, useState } from 'react';
import { Users, Copy, CheckCircle, Link, Gift, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/helpers';

const Referrals = () => {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, creditsEarned: 0 });

  const referralLink = `${window.location.origin}/register?ref=${profile?.username}`;

  useEffect(() => {
    if (!user) return;
    const fetchReferrals = async () => {
      setLoading(true);
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [{ data: allRefs }, { data: monthRefs }, { data: credits }] = await Promise.all([
        supabase.from('referrals').select('*, profiles!referrals_referred_id_fkey(username, first_name, last_name, membership_tier, created_at)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('referrals').select('id').eq('referrer_id', user.id).gte('created_at', startOfMonth),
        supabase.from('credit_transactions').select('amount').eq('user_id', user.id).ilike('description', '%Referral bonus%'),
      ]);

      setReferrals(allRefs || []);
      setStats({
        total: allRefs?.length || 0,
        thisMonth: monthRefs?.length || 0,
        creditsEarned: credits?.reduce((s, c) => s + c.amount, 0) || 0,
      });
      setLoading(false);
    };
    fetchReferrals();
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tierColor = (tier) => ({ free: '#8899bb', starter: '#00d478', pro: '#60a5fa' }[tier] || '#8899bb');

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Referral Program</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Earn 50 bonus credits for every member you refer. No limit!</p>

      {/* Referral link box */}
      <div className="card p-5 mb-6" style={{ border: '1px solid rgba(0,212,120,0.25)', background: 'rgba(0,212,120,0.03)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--brand-green)' }}>Your Referral Link</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={referralLink} readOnly className="input pl-9 text-sm" onClick={e => e.target.select()} />
          </div>
          <button onClick={copyLink} className="btn-primary flex items-center gap-2 text-sm py-2 px-4 shrink-0">
            {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Share this link on social media, forums, email or your website. Credits are awarded instantly when someone signs up.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users,     label: 'Total Referrals',  value: stats.total,                    color: '#60a5fa' },
          { icon: TrendingUp,label: 'This Month',        value: stats.thisMonth,                color: '#a78bfa' },
          { icon: Gift,      label: 'Credits Earned',   value: stats.creditsEarned.toLocaleString(), color: '#00d478' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: color + '18' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Post your referral link anywhere — social media, email, forums, your website.' },
            { step: '2', title: 'They sign up', desc: 'When someone registers using your link, they are automatically linked to your account.' },
            { step: '3', title: 'You both earn', desc: 'You receive 50 bonus credits instantly. They also get their 100 signup bonus credits.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: 'rgba(0,212,120,0.15)', color: 'var(--brand-green)' }}>{item.step}</div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div className="card">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Your Referrals</h2>
          {loading && <RefreshCw size={15} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No referrals yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Share your referral link to start earning bonus credits.</p>
            <button onClick={copyLink} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
              <Copy size={14} /> Copy Referral Link
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-4 gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <div className="col-span-2">Member</div>
              <div>Plan</div>
              <div>Joined</div>
            </div>
            {referrals.map(r => {
              const p = r.profiles;
              const name = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username : 'Unknown';
              return (
                <div key={r.id} className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
                      {(name[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{p?.username}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: tierColor(p?.membership_tier) + '18', color: tierColor(p?.membership_tier) }}>
                      {p?.membership_tier || 'free'}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p?.created_at ? formatDate(p.created_at) : '—'}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Referrals;
