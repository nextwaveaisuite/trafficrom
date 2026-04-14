import { Link } from 'react-router-dom';
import { Mail, Coins, BarChart2, Shield, Users, TrendingUp, Zap, ArrowRight, Target, RefreshCw } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Feature = ({ icon: Icon, title, desc, details }) => (
  <div className="card p-6">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,212,120,0.12)' }}>
        <Icon size={22} style={{ color: 'var(--brand-green)' }} />
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        <ul className="space-y-1.5">
          {details.map((d) => (
            <li key={d} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--brand-green)' }}>→</span> {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const Features = () => (
  <div style={{ background: 'var(--bg-primary)' }}>
    <Header />

    <div className="max-w-5xl mx-auto px-4 py-20 animate-fade-in">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: 'var(--brand-green)' }}>
          <Zap size={12} fill="currentColor" /> What's inside
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Platform Features</h1>
        <p className="max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Everything you need to run effective email traffic campaigns — without the enterprise price tag.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-14">
        <Feature
          icon={Mail}
          title="Safelist Email Campaigns"
          desc="Compose and send HTML or plain-text emails to thousands of opt-in affiliate marketers instantly."
          details={['HTML email support', 'Scheduled sending', 'Category / niche targeting', 'Subject line best practices guide']}
        />
        <Feature
          icon={Coins}
          title="Credit Economy"
          desc="A self-sustaining credits system that rewards engagement and reduces costs for active members."
          details={['Earn credits by reading emails', 'Purchase credit packs from $5', 'Referral bonus credits', 'Daily login reward']}
        />
        <Feature
          icon={BarChart2}
          title="Campaign Analytics"
          desc="See exactly how your campaigns perform with real-time stats in your member dashboard."
          details={['Open rate tracking', 'Click-through reporting', 'Recipient delivery stats', 'Campaign history archive']}
        />
        <Feature
          icon={Shield}
          title="Deliverability & Anti-Spam"
          desc="We keep list quality high so your emails actually arrive — not in the spam folder."
          details={['Opt-in member verification', 'Content quality filters', 'Bounce management', 'Spam complaint monitoring']}
        />
        <Feature
          icon={Users}
          title="Referral Program"
          desc="Refer new members and earn 50% of their monthly membership — recurring, forever."
          details={['Unique referral link', '50% recurring commissions', 'Real-time referral dashboard', 'Payout via PayPal or Stripe']}
        />
        <Feature
          icon={Target}
          title="Niche Targeting"
          desc="Send your campaigns only to marketers interested in your specific niche for better conversions."
          details={['10+ niche categories', 'Make Money Online, Crypto, Health & more', 'Filtered recipient lists', 'Higher engagement rates']}
        />
        <Feature
          icon={TrendingUp}
          title="Membership Tiers"
          desc="Upgrade your plan as you grow. Higher tiers unlock more daily sends and better credit ratios."
          details={['Free, Starter ($7/mo), Pro ($15/mo)', 'Upgrade or downgrade anytime', 'No contracts, no lock-in', 'Instant plan activation']}
        />
        <Feature
          icon={RefreshCw}
          title="Automated Credit Resets"
          desc="Credits and daily limits reset automatically so you always have a fresh slate each day."
          details={['Daily send count resets at midnight', 'Earned credits never expire', 'Real-time balance updates', 'Full transaction history']}
        />
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Ready to try it?</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Start with 100 free credits — no credit card needed.</p>
        <Link to="/register" className="btn-primary text-base py-3 px-8 inline-flex items-center gap-2">
          Create Free Account <ArrowRight size={16} />
        </Link>
      </div>
    </div>

    <Footer />
  </div>
);

export default Features;
