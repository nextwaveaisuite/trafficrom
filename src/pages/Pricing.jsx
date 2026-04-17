import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Star, Crown, ArrowRight, Infinity, Lock } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { MEMBERSHIP_TIERS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const PRICE_IDS = {
  starter: { monthly: process.env.REACT_APP_STRIPE_STARTER_PRICE_ID,          lifetime: process.env.REACT_APP_STRIPE_STARTER_LIFETIME_PRICE_ID },
  pro:     { monthly: process.env.REACT_APP_STRIPE_PRO_PRICE_ID,              lifetime: process.env.REACT_APP_STRIPE_PRO_LIFETIME_PRICE_ID },
  elite:   { monthly: process.env.REACT_APP_STRIPE_ELITE_PRICE_ID,            lifetime: process.env.REACT_APP_STRIPE_ELITE_LIFETIME_PRICE_ID },
};

const TIER_ICONS  = { free: Zap, starter: Star, pro: Crown, elite: Infinity };
const TIER_COLORS = { free: '#8899bb', starter: '#00d478', pro: '#60a5fa', elite: '#fbbf24' };

const PricingPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [error, setError]     = useState('');

  const handleCheckout = async (tierKey) => {
    if (!user) { navigate('/register'); return; }
    const priceId = PRICE_IDS[tierKey]?.[billing];
    if (!priceId) return;
    setLoading(tierKey);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || 'Checkout failed. Please try again.'); }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(null);
  };

  const tiers = Object.entries(MEMBERSHIP_TIERS);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <section className="px-4 pt-20 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--brand-green)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Simple, Transparent Pricing</h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Start free. Upgrade when you're ready. <strong style={{ color: 'var(--text-primary)' }}>No hidden fees. No surprises.</strong>
          </p>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <button onClick={() => setBilling('monthly')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: billing === 'monthly' ? 'var(--brand-green)' : 'transparent', color: billing === 'monthly' ? '#0a0e1a' : 'var(--text-muted)' }}>
              Monthly
            </button>
            <button onClick={() => setBilling('lifetime')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              style={{ background: billing === 'lifetime' ? '#fbbf24' : 'transparent', color: billing === 'lifetime' ? '#0a0e1a' : 'var(--text-muted)' }}>
              Lifetime
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: billing === 'lifetime' ? 'rgba(0,0,0,0.2)' : 'rgba(251,191,36,0.2)', color: billing === 'lifetime' ? '#0a0e1a' : '#fbbf24' }}>
                SAVE 70%
              </span>
            </button>
          </div>
          {billing === 'lifetime' && (
            <p className="text-sm mt-3" style={{ color: '#fbbf24' }}>🎉 Pay once, send forever. No monthly bills. Ever.</p>
          )}
        </div>
      </section>

      {error && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <div className="p-3 rounded-lg text-sm text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        </div>
      )}

      <section className="px-4 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-5">
          {tiers.map(([key, tier]) => {
            const Icon = TIER_ICONS[key];
            const color = TIER_COLORS[key];
            const isElite = key === 'elite';
            const isPro = key === 'pro';
            const isFree = key === 'free';
            const price = billing === 'lifetime' ? tier.lifetimePrice : tier.price;
            const isCurrentPlan = profile?.membership_tier === key;

            return (
              <div key={key} className="card p-6 flex flex-col relative"
                style={{ borderColor: isElite ? 'rgba(251,191,36,0.4)' : isPro ? 'rgba(0,212,120,0.4)' : 'var(--border)' }}>
                {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: 'var(--brand-green)', color: '#0a0e1a' }}>Most Popular</div>}
                {isElite && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#fbbf24', color: '#0a0e1a' }}>⚡ Best Value</div>}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '20', border: '1px solid ' + color + '40' }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <p className="font-bold text-lg" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{tier.name}</p>
                </div>

                <div className="mb-5">
                  {price === 0 ? (
                    <p className="text-4xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Free</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold" style={{ fontFamily: 'Syne', color }}>${price}</span>
                        <span className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>{billing === 'lifetime' ? 'one-time' : '/month'}</span>
                      </div>
                      {billing === 'lifetime' && tier.price > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          vs ${tier.price * 12}/year monthly — save ${(tier.price * 12) - tier.lifetimePrice}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="p-3 rounded-lg mb-4 space-y-1.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Emails/day</span>
                    <span className="font-bold" style={{ color }}>{tier.emailsPerDay >= 999 ? 'Unlimited' : tier.emailsPerDay === 2 ? '2/week' : tier.emailsPerDay}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Max recipients</span>
                    <span className="font-bold" style={{ color }}>{tier.maxRecipients >= 999999 ? 'Full database' : tier.maxRecipients.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Credit multiplier</span>
                    <span className="font-bold" style={{ color }}>{tier.creditRatio}x</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color }} />{f}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="text-center py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: 'rgba(0,212,120,0.1)', color: 'var(--brand-green)', border: '1px solid rgba(0,212,120,0.3)' }}>
                    <CheckCircle size={14} /> Current Plan
                  </div>
                ) : isFree ? (
                  <Link to="/register" className="btn-outline text-center py-2.5 rounded-lg font-semibold text-sm block">
                    Start Free
                  </Link>
                ) : (
                  <button onClick={() => handleCheckout(key)} disabled={loading === key}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 transition-all"
                    style={isElite
                      ? { background: loading === key ? 'transparent' : '#fbbf24', color: loading === key ? '#fbbf24' : '#0a0e1a', border: loading === key ? '1px solid #fbbf24' : 'none' }
                      : { background: loading === key ? 'transparent' : isPro ? 'var(--brand-green)' : 'var(--bg-secondary)', color: loading === key ? 'var(--brand-green)' : isPro ? '#0a0e1a' : 'var(--text-primary)', border: loading === key ? '1px solid var(--brand-green)' : '1px solid var(--border)' }
                    }>
                    {loading === key
                      ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: isElite ? '#fbbf24' : 'var(--brand-green)', borderTopColor: 'transparent' }} />
                      : <><Lock size={13} /> {billing === 'lifetime' ? 'Get Lifetime Access' : 'Get Started'}</>
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-5 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Lock size={11} /> Payments processed securely by Stripe. Cancel anytime.
        </p>

        <div className="mt-8 p-5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.04))', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="font-bold mb-1" style={{ fontFamily: 'Syne', color: '#fbbf24' }}>🌟 Founding Member Special</p>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            First 500 members get Pro access <strong style={{ color: 'var(--text-primary)' }}>FREE for 90 days</strong>, then locked at $7/month forever.
          </p>
          <Link to="/founding-members" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            <Star size={13} fill="currentColor" /> Claim Founding Member Spot <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      <section className="px-4 py-16" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Full Feature Comparison</h2>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 text-xs font-bold uppercase tracking-wider"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              <div>Feature</div>
              {['Free','Starter','Pro','Elite'].map(n => (
                <div key={n} className="text-center" style={{ color: TIER_COLORS[n.toLowerCase()] }}>{n}</div>
              ))}
            </div>
            {[
              ['Emails per day',      '2/week', '1',     '3',      'Unlimited'],
              ['Max recipients',      '500',    '2,000', '10,000', 'Full DB'],
              ['Credit multiplier',   '1x',     '1.5x',  '2x',     '3x'],
              ['AI email composer',   '✓',      '✓',     '✓',      '✓'],
              ['Link cloaker',        '✓',      '✓',     '✓',      '✓'],
              ['Banner ads',          '✓',      '✓',     '✓',      '✓'],
              ['Monthly leaderboard', '✓',      '✓',     '✓',      '✓'],
              ['Priority delivery',   '—',      '✓',     '✓',      '✓'],
              ['Advanced analytics',  '—',      '—',     '✓',      '✓'],
              ['Fastest delivery',    '—',      '—',     '✓',      '✓'],
              ['VIP support',         '—',      '—',     '—',      '✓'],
              ['Lifetime option',     '—',      '$47',   '$97',    '$197'],
            ].map(([feature, ...vals]) => (
              <div key={feature} className="grid grid-cols-5 px-5 py-3 items-center text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)' }}>{feature}</div>
                {vals.map((v, i) => {
                  const tKey = ['free','starter','pro','elite'][i];
                  return (
                    <div key={i} className="text-center text-xs font-semibold"
                      style={{ color: v === '—' ? 'var(--border)' : v === '✓' ? TIER_COLORS[tKey] : 'var(--text-primary)' }}>
                      {v}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What happens when I run out of credits?',    a: 'Earn more free credits by reading emails in the inbox, or top up instantly from $5 in the Credits section.' },
            { q: 'Can I upgrade or downgrade anytime?',        a: 'Yes. Upgrade instantly. Downgrading takes effect at the end of your billing period.' },
            { q: 'What does "full database" mean for Elite?',  a: 'Elite members send to every active member in Traffic ROM — no caps. As the platform grows, so does your reach.' },
            { q: 'What is a lifetime membership?',             a: 'Pay once and keep that plan forever with no monthly charges. As the member database grows, your reach grows too.' },
            { q: 'Is there a free trial for paid plans?',      a: 'Check out our Founding Member offer — first 500 members get Pro free for 90 days, then locked at $7/month forever.' },
            { q: 'Do credits expire?',                         a: 'Never. Your credits are yours to keep and use whenever you want.' },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <p className="font-semibold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{q}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 text-center" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Start free today</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>No credit card. 100 free credits. Your first campaign live in 5 minutes.</p>
          <Link to="/register" className="btn-primary text-lg py-3 px-10 inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
