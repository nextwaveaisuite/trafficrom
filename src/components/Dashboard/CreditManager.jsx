import { useEffect, useState } from 'react';
import { Coins, TrendingUp, ShoppingCart, ArrowDownRight, ArrowUpRight, Gift, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { CREDIT_PACKAGES } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import PromoCode from './PromoCode';

const CREDIT_PRICE_IDS = {
  credits_500:  process.env.REACT_APP_STRIPE_CREDITS_500_PRICE_ID,
  credits_2000: process.env.REACT_APP_STRIPE_CREDITS_2000_PRICE_ID,
  credits_5000: process.env.REACT_APP_STRIPE_CREDITS_5000_PRICE_ID,
};

const CreditManager = () => {
  const { user, profile } = useAuth();
  const { fetchTransactions } = useCredits();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  useEffect(() => {
    fetchTransactions(20).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && params.get('type') === 'credits') {
      setCheckoutSuccess('Payment successful! Your credits have been added to your account.');
      setTimeout(() => setCheckoutSuccess(''), 6000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const txIcon = (type) => ({
    earned:    { icon: ArrowDownRight, color: 'var(--brand-green)' },
    purchased: { icon: ShoppingCart,   color: '#60a5fa' },
    spent:     { icon: ArrowUpRight,   color: '#f87171' },
    bonus:     { icon: Gift,           color: '#fbbf24' },
  }[type] || { icon: Coins, color: 'var(--text-muted)' });

  const handleBuyCredits = async (pkg) => {
    const priceId = CREDIT_PRICE_IDS[pkg.id];
    if (!priceId) { setCheckoutError('Payment not configured yet.'); return; }
    setCheckoutLoading(pkg.id);
    setCheckoutError('');
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setCheckoutError(data.error || 'Checkout failed. Please try again.'); }
    } catch (err) {
      setCheckoutError('Something went wrong. Please try again.');
    }
    setCheckoutLoading(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Credits</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Purchase, earn, and manage your sending credits</p>

      {checkoutSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-5" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.25)', color: 'var(--brand-green)' }}>
          <CheckCircle size={15} /> {checkoutSuccess}
        </div>
      )}
      {checkoutError && (
        <div className="p-3 rounded-lg mb-5 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          {checkoutError}
        </div>
      )}

      {/* Balance */}
      <div className="p-6 rounded-xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,212,120,0.15) 0%, rgba(0,229,255,0.08) 100%)', border: '1px solid rgba(0,212,120,0.25)' }}>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Current balance</p>
        <p className="text-5xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          {profile?.credits?.toLocaleString() || '0'}
          <span className="text-lg ml-2" style={{ color: 'var(--text-muted)' }}>credits</span>
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          ≈ Send to <strong style={{ color: 'var(--brand-green)' }}>{((profile?.credits || 0) * 10).toLocaleString()}</strong> recipients
        </p>
        <Coins size={80} className="absolute right-4 top-4 opacity-5" style={{ color: 'var(--brand-green)' }} />
      </div>

      {/* Earn credits */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} style={{ color: 'var(--brand-green)' }} />
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Earn Free Credits</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: 'Read member emails', credits: 5,  desc: 'Read and click emails to earn credits' },
            { label: 'Refer a member',     credits: 50, desc: 'Earn 50 credits per referral signup' },
            { label: 'Daily login bonus',  credits: 2,  desc: 'Log in every day to earn bonus credits' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,120,0.1)', color: 'var(--brand-green)' }}>+{item.credits} credits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buy credits */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={18} style={{ color: 'var(--brand-green)' }} />
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Buy Credit Packages</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="p-5 rounded-xl text-center transition-all"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-green)'; e.currentTarget.style.background = 'rgba(0,212,120,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{pkg.label}</p>
              <p className="text-3xl font-bold mb-0.5" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{pkg.credits.toLocaleString()}</p>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>credits</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{pkg.desc}</p>
              <button onClick={() => handleBuyCredits(pkg)} disabled={checkoutLoading === pkg.id}
                className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-60">
                {checkoutLoading === pkg.id
                  ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
                  : <><Lock size={12} /> ${pkg.price}</>
                }
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Lock size={10} /> Payments secured by Stripe. Credits added instantly after payment.
        </p>
      </div>

      {/* Promo Code */}
      <PromoCode />

      {/* Transaction history */}
      <div className="card">
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Transaction History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No transactions yet.</div>
        ) : (
          transactions.map((tx) => {
            const { icon: Icon, color } = txIcon(tx.type);
            return (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(tx.created_at)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: tx.type === 'spent' ? '#f87171' : 'var(--brand-green)' }}>
                  {tx.type === 'spent' ? '-' : '+'}{tx.amount}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CreditManager;
