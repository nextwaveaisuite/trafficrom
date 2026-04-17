import { Link } from 'react-router-dom';
import {
  Zap, Shield, TrendingUp, Mail, Users, BarChart2,
  CheckCircle, ArrowRight, Star, Coins, Link2, Image,
  Trophy, Sparkles, Clock, Tag, Bot
} from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import LiveStats from '../components/LiveStats';
import { MEMBERSHIP_TIERS } from '../utils/constants';

const FeatureCard = ({ icon: Icon, title, desc, badge }) => (
  <div className="card p-6 transition-all relative"
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,120,0.3)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
    {badge && (
      <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-bold"
        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
        {badge}
      </span>
    )}
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,212,120,0.12)' }}>
      <Icon size={20} style={{ color: 'var(--brand-green)' }} />
    </div>
    <h3 className="font-bold text-base mb-2 pr-12" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </div>
);

const PricingCard = ({ info, highlighted }) => (
  <div className={`card p-6 flex flex-col transition-all ${highlighted ? 'glow' : ''}`}
    style={{ borderColor: highlighted ? 'rgba(0,212,120,0.4)' : 'var(--border)' }}>
    {highlighted && (
      <div className="text-xs font-bold uppercase tracking-wider text-center py-1 rounded-full mb-4"
        style={{ background: 'var(--brand-green)', color: '#0a0e1a' }}>
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
    <LiveStats />

    {/* Hero */}
    <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center">
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-[130px]" style={{ background: 'var(--brand-green)' }} />
      <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: 'var(--brand-green)' }}>
          <Zap size={12} fill="currentColor" /> Real Opt-in Marketing — Now with AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          The Complete<br /><span className="gradient-text">Affiliate Traffic Platform</span>
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          AI email writing, link cloaking, banner ads, safelist marketing and more — everything an affiliate marketer needs, starting at just <strong style={{ color: 'var(--text-primary)' }}>$7/month</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary text-base py-3 px-8 inline-flex items-center justify-center gap-2">
            Start Free – No Card Needed <ArrowRight size={16} />
          </Link>
          <Link to="/founding-members" className="btn-outline text-base py-3 px-8 inline-flex items-center justify-center gap-2"
            style={{ borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            <Star size={14} fill="currentColor" /> Founding Member Offer
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
          ['2.4M+',   'Emails Delivered'],
          ['4.8★',    'User Rating'],
          ['$7/mo',   'Starting Price'],
        ].map(([val, label]) => (
          <div key={label} className="text-center px-6 py-5">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{val}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* All Features */}
    <section className="px-4 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Everything you need to drive traffic</h2>
        <p style={{ color: 'var(--text-muted)' }}>One platform. Every tool. No bloat.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <FeatureCard icon={Sparkles} badge="AI Powered" title="AI Email Composer"
          desc="Pick your niche and tone — Claude AI writes your entire promotional email with 3 subject line variations in seconds. No copywriting skills needed." />
        <FeatureCard icon={Mail} title="Safelist Email Marketing"
          desc="Send your promo emails to thousands of verified, opt-in affiliate marketers who are actively looking for opportunities." />
        <FeatureCard icon={Coins} title="Read & Earn Credits"
          desc="Earn credits by reading other members' emails. Spend credits to send yours. Fair, self-sustaining and gamified for maximum engagement." />
        <FeatureCard icon={Link2} badge="New" title="Link Cloaker"
          desc="Turn ugly affiliate URLs into clean branded short links. Track every click in real-time and see exactly which campaigns are converting." />
        <FeatureCard icon={Image} title="Banner Advertising"
          desc="Get your brand seen across the platform. Upload your banner, choose your impression package and reach members every time they log in." />
        <FeatureCard icon={Trophy} title="Monthly Leaderboard"
          desc="Compete for top referrer, top mailer and top reader every month. Winners earn bonus credits automatically on the 1st of each month." />
        <FeatureCard icon={Tag} title="Promo Code Autopilot"
          desc="Auto-generate promo codes on a weekly, fortnightly or monthly schedule. Members get notified automatically — zero manual work." />
        <FeatureCard icon={BarChart2} title="Campaign Analytics"
          desc="Track open rates, clicks and recipient counts in your real-time dashboard so you can optimise what works and cut what doesn't." />
        <FeatureCard icon={Users} title="Referral Program"
          desc="Earn recurring commissions when you refer new members. Your best traffic source pays you back every single month." />
        <FeatureCard icon={Bot} badge="Coming Soon" title="Autopilot Traffic"
          desc="Our upcoming AI-powered lead generation tool finds affiliate marketers and drives them to your offers automatically while you sleep." />
        <FeatureCard icon={Shield} title="Anti-Spam Protection"
          desc="All members are verified opt-in. Advanced filters protect your deliverability and keep your sender reputation clean." />
        <FeatureCard icon={Clock} title="Email Personalisation"
          desc="Use [FIRST_NAME] tags in your campaigns to automatically personalise every email with each reader's name for higher engagement." />
      </div>
    </section>

    {/* How it works */}
    <section className="px-4 py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>How Traffic ROM Works</h2>
        <p className="text-center mb-12" style={{ color: 'var(--text-muted)' }}>Get your first campaign live in under 5 minutes</p>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { step: '01', title: 'Sign Up Free',       desc: 'Create your account in 60 seconds. Get 100 free credits instantly. No credit card needed.' },
            { step: '02', title: 'Generate Your Email', desc: 'Pick your niche, pick your tone, click Generate. The AI writes a complete campaign in seconds.' },
            { step: '03', title: 'Cloak Your Link',    desc: 'Turn your affiliate URL into a clean branded link that tracks every click automatically.' },
            { step: '04', title: 'Send & Earn',        desc: 'Send to thousands of opt-in marketers. Read emails to earn more credits. Repeat daily.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.2)' }}>
                <span className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{step}</span>
              </div>
              <h3 className="font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* AI Composer Spotlight */}
    <section className="px-4 py-20 max-w-5xl mx-auto">
      <div className="rounded-2xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(0,212,120,0.08), rgba(0,229,255,0.04))', border: '1px solid rgba(0,212,120,0.2)' }}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(0,212,120,0.15)', border: '1px solid rgba(0,212,120,0.3)', color: 'var(--brand-green)' }}>
              <Sparkles size={11} /> Powered by Claude AI
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Stop Writing Emails Manually</h2>
            <p className="mb-5" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Our built-in AI email generator creates conversion-optimised promotional emails for any niche in seconds. Choose from 4 tones, get 3 subject line variations, and personalise every email with the reader's first name automatically.
            </p>
            <div className="space-y-2">
              {[
                '10 niches — MMO, Crypto, Health, E-commerce and more',
                '4 tones — Urgent, Professional, Casual, Story-driven',
                'Personalise with [FIRST_NAME] merge tags',
                'Regenerate as many times as you want',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <CheckCircle size={13} style={{ color: 'var(--brand-green)', flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
                <Sparkles size={12} color="#0a0e1a" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>AI Email Generator</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,120,0.15)', color: 'var(--brand-green)' }}>Live Preview</span>
            </div>
            <div className="space-y-2 text-xs p-3 rounded-lg mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Niche: <strong style={{ color: 'var(--text-primary)' }}>Make Money Online</strong></p>
              <p style={{ color: 'var(--text-muted)' }}>Tone: <strong style={{ color: 'var(--text-primary)' }}>Urgent 🔥</strong></p>
            </div>
            <div className="p-3 rounded-lg text-xs space-y-2" style={{ background: 'rgba(0,212,120,0.06)', border: '1px solid rgba(0,212,120,0.2)' }}>
              <p className="font-bold" style={{ color: 'var(--brand-green)' }}>Subject: Hey [FIRST_NAME], This Window Is Closing Fast...</p>
              <p style={{ color: 'var(--text-muted)' }}>Hey [FIRST_NAME],</p>
              <p style={{ color: 'var(--text-muted)' }}>I don't usually send emails like this, but I'd be doing you a disservice if I didn't share what I just discovered...</p>
              <p style={{ color: 'var(--text-muted)' }}>A completely automated system is generating $200-$500/day for regular people — and the barrier to entry has never been lower...</p>
              <p className="font-semibold" style={{ color: 'var(--brand-green)' }}>[YOUR LINK HERE] ← See it before it's gone</p>
            </div>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>Generated in 8 seconds ⚡</p>
          </div>
        </div>
      </div>
    </section>

    {/* Link Cloaker Spotlight */}
    <section className="px-4 py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>
          <Link2 size={11} /> Built-in Link Cloaker
        </div>
        <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Clean Links. More Clicks. Full Tracking.</h2>
        <p className="max-w-xl mx-auto mb-10" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Turn ugly affiliate URLs into clean branded short links hosted on your Traffic ROM domain. Track every click in real-time and see exactly which campaigns are converting.
        </p>
        <div className="grid md:grid-cols-3 gap-5 text-left">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Before → After</p>
            <p className="text-xs mb-2 break-all" style={{ color: '#f87171', fontFamily: 'monospace' }}>https://hop.clickbank.net/?affiliate=yourname&vendor=product&tid=campaign123</p>
            <p className="text-xs" style={{ color: 'var(--brand-green)', fontFamily: 'monospace' }}>trafficrom.netlify.app/go/my-offer</p>
          </div>
          <div className="card p-5">
            <BarChart2 size={18} className="mb-3" style={{ color: 'var(--brand-green)' }} />
            <p className="font-bold text-sm mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Real-time click tracking</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>See total clicks, last click time, and which links are performing best.</p>
          </div>
          <div className="card p-5">
            <Shield size={18} className="mb-3" style={{ color: 'var(--brand-green)' }} />
            <p className="font-bold text-sm mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Pause or delete anytime</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Instantly disable any link without breaking your campaigns.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Pricing built for the newbie</h2>
          <p style={{ color: 'var(--text-muted)' }}>Start free. Upgrade when you're ready. No surprises.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <PricingCard info={MEMBERSHIP_TIERS.free}    highlighted={false} />
          <PricingCard info={MEMBERSHIP_TIERS.starter} highlighted={true} />
          <PricingCard info={MEMBERSHIP_TIERS.pro}     highlighted={false} />
        </div>
        <div className="text-center mt-8">
          <Link to="/founding-members" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
            <Star size={13} fill="currentColor" /> Founding Member Deal — Pro FREE for 90 days, then $7/mo locked forever
          </Link>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="px-4 py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>What members say</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: 'Mike R.',  text: "I tried 5 other safelists charging $47/month. Traffic ROM at $7 outperformed all of them. The AI email writer is a game changer.", stars: 5 },
            { name: 'Sarah T.', text: "As a newbie, the cost of traffic was killing me. The link cloaker and AI composer together gave me my first real results.", stars: 5 },
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
      </div>
    </section>

    {/* Final CTA */}
    <section className="px-4 py-20" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Ready to start driving real traffic?</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of affiliate marketers using Traffic ROM — AI emails, link cloaking, banner ads and safelist marketing in one platform for $7/month.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary text-lg py-3 px-10 inline-flex items-center gap-2">
            Get Your 100 Free Credits <ArrowRight size={18} />
          </Link>
          <Link to="/founding-members" className="btn-outline text-lg py-3 px-8 inline-flex items-center gap-2"
            style={{ borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            <Star size={15} fill="currentColor" /> Founding Member Deal
          </Link>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>✓ No credit card &nbsp;·&nbsp; ✓ Free forever plan &nbsp;·&nbsp; ✓ Cancel anytime</p>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;
