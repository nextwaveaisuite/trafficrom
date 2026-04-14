import { Link } from 'react-router-dom';
import { Zap, Shield, TrendingUp, Mail, Users, BarChart2, CheckCircle, ArrowRight, Star, Coins } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { MEMBERSHIP_TIERS } from '../utils/constants';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="card p-6 transition-all" style={{ transition: 'border-color 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,120,0.3)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,212,120,0.12)' }}>
      <Icon size={20} style={{ color: 'var(--brand-green)' }} />
    </div>
    <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </div>
);

const PricingCard = ({ tier, info, highlighted }) => (
  <div className={`card p-6 flex flex-col transition-all ${highlighted ? 'glow' : ''}`}
    style={{ borderColor: highlighted ? 'rgba(0,212,120,0.4)' : 'var(--border)' }}>
    {highlighted && (
      <div className="text-xs font-bold uppercase tracking-wider text-center py-1 rounded-full mb-4" style={{ background: 'var(--brand-green)', color: '#0a0e1a' }}>
        Most Popular
      </div>
    )}
    <p className="font-bold text-lg mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{info.name}</p>
    <div className="flex items-end gap-1 mb-4">
      <span className="text-4xl font-bold" style={{ fontFamily: 'Syne', color: highlighted ? 'var(--brand-green)' : 'var(--text-primary)' }}>
        {info.price === 0 ? 'Free' : `$${info.price}`}
      </span>
      {info.price > 0 && <span className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>/month</span>}
    </div>
    <ul className="space-y-2 mb-6 flex-1">
      {info.features.map((f) => (
        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <CheckCircle size={14} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
          {f}
        </li>
      ))}
    </ul>
    <Link to="/register" className={`text-center py-2.5 rounded-lg font-semibold text-sm transition-all ${highlighted ? 'btn-primary' : 'btn-outline'}`}>
      {info.price === 0 ? 'Start Free' : 'Get Started'}
    </Link>
  </div>
);

const Home = () => (
  <div style={{ background: 'var(--bg-primary)' }}>
    <Header />

    {/* Hero */}
    <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center">
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-[130px]" style={{ background: 'var(--brand-green)' }} />
      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: 'var(--brand-green)' }}>
          <Zap size={12} fill="currentColor" /> Real Opt-in Marketing
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          Real Opt-in Marketing.<br /><span className="gradient-text">Traffic That Wants You.</span>
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Traffic that actually wants to hear from you. Send promotional emails to thousands of verified opt-in marketers starting at just <strong style={{ color: 'var(--text-primary)' }}>$7/month</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary text-base py-3 px-8 inline-flex items-center justify-center gap-2">
            Start Free – No Card Needed <ArrowRight size={16} />
          </Link>
          <Link to="/pricing" className="btn-outline text-base py-3 px-8 inline-flex items-center justify-center">
            View Pricing
          </Link>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>✓ 100 free credits on signup &nbsp;·&nbsp; ✓ No hidden fees &nbsp;·&nbsp; ✓ Cancel anytime</p>
      </div>
    </section>

    {/* Stats bar */}
    <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: 'var(--border)' }}>
        {[
          ['10,000+', 'Opt-in Members'],
          ['2.4M+', 'Emails Delivered'],
          ['4.8★', 'User Rating'],
          ['$7/mo', 'Starting Price'],
        ].map(([val, label]) => (
          <div key={label} className="text-center px-6 py-5">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="px-4 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Everything you need to drive traffic</h2>
        <p style={{ color: 'var(--text-muted)' }}>No bloat. Just the tools that actually move the needle.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <FeatureCard icon={Mail} title="Safelist Email Marketing" desc="Send your promo emails to thousands of verified, opt-in affiliate marketers who are actively looking for opportunities." />
        <FeatureCard icon={Coins} title="Credit-Based System" desc="Earn credits by reading emails. Spend credits to send yours. Fair, transparent, and gamified for engagement." />
        <FeatureCard icon={BarChart2} title="Campaign Analytics" desc="Track open rates, clicks, and recipient counts in your real-time dashboard so you can optimize what works." />
        <FeatureCard icon={Shield} title="Anti-Spam Protection" desc="All members are opt-in. Advanced filters protect deliverability and your sender reputation." />
        <FeatureCard icon={Users} title="Referral Commissions" desc="Earn 50% recurring commissions when you refer new members. Your best traffic source pays you back." />
        <FeatureCard icon={TrendingUp} title="Niche Targeting" desc="Send to specific categories like Crypto, Health & Fitness, or MMO for higher open rates and conversions." />
      </div>
    </section>

    {/* Pricing */}
    <section className="px-4 py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Pricing built for the newbie</h2>
          <p style={{ color: 'var(--text-muted)' }}>Start free. Upgrade when you're ready. No surprises.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <PricingCard tier="free"    info={MEMBERSHIP_TIERS.free}    highlighted={false} />
          <PricingCard tier="starter" info={MEMBERSHIP_TIERS.starter} highlighted={true} />
          <PricingCard tier="pro"     info={MEMBERSHIP_TIERS.pro}     highlighted={false} />
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="px-4 py-20 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>What members say</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { name: 'Mike R.', text: "I tried 5 other safelists charging $47/month. Traffic ROM at $7 outperformed all of them. Incredible value.", stars: 5 },
          { name: 'Sarah T.', text: "As a newbie, the cost of traffic was killing me. This platform gave me my first real results without breaking the bank.", stars: 5 },
          { name: 'David K.', text: "The credit system is genius — I earn while others read my emails. Completely self-sustaining once you get going.", stars: 5 },
        ].map((t) => (
          <div key={t.name} className="card p-5">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} fill="#fbbf24" style={{ color: '#fbbf24' }} />)}
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>"{t.text}"</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="px-4 py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Ready for traffic that actually wants to hear from you?</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Join thousands of marketers using Traffic ROM — Real Opt-in Marketing — without the premium price tag.</p>
        <Link to="/register" className="btn-primary text-lg py-3 px-10 inline-flex items-center gap-2">
          Get Your 100 Free Credits <ArrowRight size={18} />
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;
