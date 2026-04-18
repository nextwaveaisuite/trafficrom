import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';

const AdminRevenue = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, monthly: 0, subscriptions: 0, oneTime: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payment_transactions')
      .select('*, profiles(username, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    const txs = data || [];
    setTransactions(txs);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = txs.filter(t => new Date(t.created_at) >= startOfMonth).reduce((sum, t) => sum + (t.amount || 0), 0);
    const total = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const subscriptions = txs.filter(t => t.type === 'subscription').length;
    const oneTime = txs.filter(t => t.type === 'lifetime' || t.type === 'credits').length;

    setStats({ total, monthly, subscriptions, oneTime });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const TYPE_COLORS = { subscription: '#00d478', lifetime: '#fbbf24', credits: '#60a5fa' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Revenue & Payments</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>All Stripe transactions and payment history</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue',     value: `$${stats.total.toFixed(2)}`,   icon: DollarSign, color: '#00d478' },
          { label: 'This Month',        value: `$${stats.monthly.toFixed(2)}`, icon: TrendingUp,  color: '#60a5fa' },
          { label: 'Subscriptions',     value: stats.subscriptions,            icon: Users,       color: '#fbbf24' },
          { label: 'One-time Payments', value: stats.oneTime,                  icon: CreditCard,  color: '#f472b6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-muted)' }}>No transactions yet.</div>
        ) : (
          <div>
            <div className="grid grid-cols-5 px-5 py-2 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <div className="col-span-2">Member</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Date</div>
            </div>
            {transactions.map(tx => (
              <div key={tx.id} className="grid grid-cols-5 px-5 py-3 items-center text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="col-span-2">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{tx.profiles?.first_name} {tx.profiles?.last_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{tx.profiles?.username}</p>
                </div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: (TYPE_COLORS[tx.type] || '#8899bb') + '20', color: TYPE_COLORS[tx.type] || '#8899bb' }}>
                    {tx.type}
                  </span>
                  {tx.tier    && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.tier}</p>}
                  {tx.credits > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.credits} credits</p>}
                </div>
                <div><p className="font-bold" style={{ color: '#00d478' }}>${tx.amount?.toFixed(2)}</p></div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(tx.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;
