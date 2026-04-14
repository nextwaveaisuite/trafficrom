import { useEffect, useState } from 'react';
import { Coins, TrendingUp, ShoppingCart, ArrowDownRight, ArrowUpRight, Gift } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { CREDIT_PACKAGES } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import PromoCode from './PromoCode';

const CreditManager = () => {
  const { profile } = useAuth();
  const { fetchTransactions } = useCredits();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions(20).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const txIcon = (type) => ({
    earned:    { icon: ArrowDownRight, color: 'var(--brand-green)' },
    purchased: { icon: ShoppingCart,   color: '#60a5fa' },
    spent:     { icon: ArrowUpRight,   color: '#f87171' },
    bonus:     { icon: Gift,           color: '#fbbf24' },
  }[type] || { icon: Coins, color: 'var(--text-muted)' });

  const handleBuyCredits = (pkg) => {
    // TODO: Connect to Stripe checkout
    alert(`Stripe integration needed.\nPackage: ${pkg.label}\nCredits: ${pkg.credits}\nPrice: $${pkg.price}\n\nAdd your Stripe key to .env and connect the process-payment edge function.`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Credits</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Purchase, earn, and manage your sending credits</p>

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
            { label: 'Read member emails', credits: 5, desc: 'Read and click emails to earn credits' },
            { label: 'Refer a member', credits: 50, desc: 'Earn 50 credits per referral signup' },
            { label: 'Daily login bonus', credits: 2, desc: 'Log in every day to earn bonus credits' },
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
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="p-4 rounded-lg text-center transition-all cursor-pointer"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-green)'; e.currentTarget.style.background = 'rgba(0,212,120,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onClick={() => handleBuyCredits(pkg)}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{pkg.label}</p>
              <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{pkg.credits.toLocaleString()}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>credits</p>
              <button className="btn-primary w-full text-sm py-1.5">${pkg.price}</button>
            </div>
          ))}
        </div>
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
