import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { MEMBERSHIP_TIERS, CREDIT_PACKAGES } from '../utils/constants';

const Pricing = () => (
  <div style={{ background: 'var(--bg-primary)' }}>
    <Header />

    <div className="max-w-5xl mx-auto px-4 py-20 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: 'var(--brand-green)' }}>
          <Zap size={12} fill="currentColor" /> Transparent pricing, always        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Simple, Honest Pricing</h1>
        <p className="max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          No hidden fees. No bait-and-switch. Just affordable email traffic for marketers on a budget.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {Object.entries(MEMBERSHIP_TIERS).map(([key, info]) => {
          const highlighted = key === 'starter';
          return (
            <div key={key} className={`card p-7 flex flex-col ${highlighted ? 'glow' : ''}`}
              style={{ borderColor: highlighted ? 'rgba(0,212,120,0.4)' : 'var(--border)' }}>
              {highlighted && (
                <div className="text-center text-xs font-bold uppercase tracking-wider py-1 rounded-full mb-4" style={{ background: 'var(--brand-green)', color: '#0a0e1a' }}>
                  Best Value
                </div>
              )}
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{info.name}</h2>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-5xl font-bold" style={{ fontFamily: 'Syne', color: highlighted ? 'var(--brand-green)' : 'var(--text-primary)' }}>
                  {info.price === 0 ? 'Free' : `$${info.price}`}
                </span>
                {info.price > 0 && <span className="mb-2" style={{ color: 'var(--text-muted)' }}>/mo</span>}
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {info.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <CheckCircle size={15} style={{ color: 'var(--brand-green)', flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`text-center py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${highlighted ? 'btn-primary' : 'btn-outline'}`}
              >
                {info.price === 0 ? 'Get Started Free' : 'Start Now'} <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Credit packages */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Need More Credits?</h2>
        <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>Top up your account at any time with a one-time credit package.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="card p-5 text-center transition-all"
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,120,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{pkg.label}</p>
              <p className="text-3xl font-bold mb-0.5" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{pkg.credits.toLocaleString()}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>credits</p>
              <Link to="/register" className="btn-primary w-full block text-center text-sm py-2">${pkg.price} one-time</Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>FAQ</h2>
        <div className="space-y-4">
          {[
            ['What is a safelist?', 'A safelist is an email marketing community where members agree to receive promotional emails from each other. Everyone opts in, making it fully compliant and legitimate.'],
            ['How do credits work?', 'You earn credits by reading other members\' emails. You spend credits to send your own campaigns. The more you engage, the more you can send — for free.'],
            ['Can I cancel anytime?', 'Yes! All plans are month-to-month. Cancel from your dashboard at any time with no questions asked. Your free tier access remains.'],
            ['Will my emails reach real people?', 'Yes. All members are real affiliate marketers who opted in to receive promotional emails. We filter bots and inactive accounts regularly.'],
          ].map(([q, a]) => (
            <div key={q} className="card p-5">
              <p className="font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{q}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

export default Pricing;
