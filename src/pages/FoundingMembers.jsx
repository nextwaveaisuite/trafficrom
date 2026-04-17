import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle, Users, Mail, Coins, Trophy, ArrowRight, Star, Clock } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const FOUNDING_SPOTS = 500;
const SPOTS_TAKEN = 47;

const Countdown = () => {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    const tick = () => {
      const now = new Date();
      const diff = deadline - now;
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const box = (val, label) => (
    <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,120,0.2)', minWidth: 70 }}>
      <p className="text-3xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{String(val).padStart(2, '0')}</p>
      <p className="text-xs uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {box(time.days, 'Days')}
      {box(time.hours, 'Hours')}
      {box(time.mins, 'Mins')}
      {box(time.secs, 'Secs')}
    </div>
  );
};

const FoundingMembers = () => {
  const spotsLeft = FOUNDING_SPOTS - SPOTS_TAKEN;
  const pctTaken = Math.round((SPOTS_TAKEN / FOUNDING_SPOTS) * 100);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 text-center">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-15 blur-[130px]" style={{ background: 'var(--brand-green)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            <Star size={14} fill="currentColor" /> FOUNDING MEMBER OFFER — LIMITED TO 500 SPOTS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            Join Traffic ROM<br /><span className="gradient-text">Before Everyone Else Does</span>
          </h1>
          <p className="text-lg mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            The first 500 members get <strong style={{ color: 'var(--text-primary)' }}>Pro access FREE for 90 days</strong>, permanently locked in at $7/month after, plus exclusive Founding Member perks — never available again.
          </p>

          {/* Spots progress */}
          <div className="max-w-sm mx-auto mb-6">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span><strong style={{ color: '#fbbf24' }}>{SPOTS_TAKEN}</strong> spots claimed</span>
              <span><strong style={{ color: 'var(--brand-green)' }}>{spotsLeft}</strong> remaining</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: pctTaken + '%', background: 'linear-gradient(90deg, var(--brand-green), #00e5ff)' }} />
            </div>
            <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>{pctTaken}% of founding spots claimed</p>
          </div>

          {/* Countdown */}
          <div className="mb-8">
            <p className="text-sm mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>⏰ Founding member offer closes in:</p>
            <Countdown />
          </div>

          <Link to="/register" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Claim My Founding Member Spot <ArrowRight size={18} />
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>✓ No credit card needed &nbsp;·&nbsp; ✓ Free for 90 days &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* Perks */}
      <section className="px-4 py-16" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Founding Member Perks</h2>
          <p className="text-center mb-10" style={{ color: 'var(--text-muted)' }}>Everything in Pro — free for 90 days. Then locked in at $7/month forever.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Zap,     title: 'Pro Access FREE for 90 Days',     desc: 'Full Pro features — 3 emails/day, 10,000 recipients, fastest delivery. Free for your first 90 days.' },
              { icon: Coins,   title: '500 Bonus Credits on Signup',      desc: '5x more than regular free members. Enough to send your first 5 campaigns immediately.' },
              { icon: Star,    title: 'Founding Member Badge',            desc: 'A permanent badge on your profile showing you were one of the first 500. Respected in the community.' },
              { icon: Trophy,  title: 'Locked In at $7/Month Forever',    desc: 'After your 90 days, you pay $7/month — not the regular Pro price of $15. Locked in for life.' },
              { icon: Mail,    title: 'AI Email Generator Unlimited',     desc: 'Generate as many AI-written emails as you want. Every niche, every tone, unlimited regenerations.' },
              { icon: Users,   title: 'Hall of Fame Listing',             desc: 'Your name listed permanently on our Founding Members page. Part of Traffic ROM history.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,212,120,0.12)' }}>
                  <Icon size={18} style={{ color: 'var(--brand-green)' }} />
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Founding Member vs Regular</h2>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <div>Feature</div>
            <div className="text-center" style={{ color: '#fbbf24' }}>Founding Member</div>
            <div className="text-center">Regular Free</div>
          </div>
          {[
            ['First 90 days',        'Pro (FREE)',      'Free plan only'],
            ['Monthly price after',  '$7/mo locked',   '$0–15/mo'],
            ['Signup credits',       '500 credits',    '100 credits'],
            ['Daily sends',          '3/day (Pro)',    '2/week'],
            ['Max recipients',       '10,000',         '500'],
            ['Founding badge',       '✓ Yes',          '✗ No'],
            ['Hall of Fame',         '✓ Yes',          '✗ No'],
            ['AI email generator',   '✓ Unlimited',    '✓ Unlimited'],
          ].map(([feature, founding, regular]) => (
            <div key={feature} className="grid grid-cols-3 px-5 py-3 items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature}</p>
              <p className="text-sm font-bold text-center" style={{ color: 'var(--brand-green)' }}>{founding}</p>
              <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{regular}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Early Members Say</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Sarah M.', text: 'Finally a safelist that looks like it was built in this decade. The AI email writer alone is worth 10x the price.' },
              { name: 'Dave K.',  text: 'Got my first 200 clicks in 48 hours. Free. The credit system just works once you get going.' },
              { name: 'Lisa R.',  text: 'I was sceptical about safelists but Traffic ROM changed my mind. Clean, fast, and actually affordable.' },
            ].map(t => (
              <div key={t.name} className="card p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#fbbf24" style={{ color: '#fbbf24' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>"{t.text}"</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            <Clock size={14} /> Only {spotsLeft} founding spots remaining
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            Don't Miss Your Founding Member Spot
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            This offer disappears when the 500 spots fill up. No exceptions. No waitlist. Once it's gone, it's gone.
          </p>
          <Link to="/register" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Claim My Spot Now — It's Free <ArrowRight size={18} />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: 'var(--brand-green)' }} /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: 'var(--brand-green)' }} /> 90 days free Pro</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: 'var(--brand-green)' }} /> Cancel anytime</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FoundingMembers;
