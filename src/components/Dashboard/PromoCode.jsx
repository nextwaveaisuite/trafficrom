import { useState } from 'react';
import { Tag, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const PromoCode = () => {
  const { user, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, credits, type }
  const [recentCodes, setRecentCodes] = useState([]);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const upperCode = code.trim().toUpperCase();

    // Check if code exists and is valid
    const { data: promoData, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single();

    if (error || !promoData) {
      setResult({ success: false, message: 'Invalid or expired promo code. Please check and try again.' });
      setLoading(false);
      return;
    }

    // Check expiry
    if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
      setResult({ success: false, message: 'This promo code has expired.' });
      setLoading(false);
      return;
    }

    // Check if already redeemed by this user
    const { data: alreadyUsed } = await supabase
      .from('promo_code_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('promo_code_id', promoData.id)
      .single();

    if (alreadyUsed) {
      setResult({ success: false, message: 'You have already redeemed this promo code.' });
      setLoading(false);
      return;
    }

    // Check usage limit
    if (promoData.max_uses && promoData.uses_count >= promoData.max_uses) {
      setResult({ success: false, message: 'This promo code has reached its maximum uses.' });
      setLoading(false);
      return;
    }

    // Award credits
    await supabase.rpc('earn_credits', {
      p_user_id: user.id,
      p_amount: promoData.credits,
      p_description: `Promo code: ${upperCode} — ${promoData.description}`,
    });

    // Record redemption
    await supabase.from('promo_code_redemptions').insert({
      user_id: user.id,
      promo_code_id: promoData.id,
      credits_awarded: promoData.credits,
    });

    // Increment usage count
    await supabase
      .from('promo_codes')
      .update({ uses_count: (promoData.uses_count || 0) + 1 })
      .eq('id', promoData.id);

    setResult({
      success: true,
      message: `Success! ${promoData.description}`,
      credits: promoData.credits,
      type: promoData.credit_type,
    });
    setRecentCodes(prev => [{ code: upperCode, credits: promoData.credits, type: promoData.credit_type }, ...prev.slice(0, 4)]);
    setCode('');
    refreshProfile();
    setLoading(false);
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(251,191,36,0.04)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
          <Tag size={15} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Promo Code</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter a code to claim bonus credits</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Sparkles size={10} /> Bonus Credits
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Result message */}
        {result && (
          <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{
            background: result.success ? 'rgba(0,212,120,0.08)' : 'rgba(239,68,68,0.08)',
            border: '1px solid ' + (result.success ? 'rgba(0,212,120,0.25)' : 'rgba(239,68,68,0.25)'),
          }}>
            {result.success
              ? <CheckCircle size={15} style={{ color: 'var(--brand-green)', flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            }
            <div>
              <p className="text-sm font-semibold" style={{ color: result.success ? 'var(--brand-green)' : '#f87171' }}>
                {result.success ? `+${result.credits} credits added!` : 'Code not valid'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{result.message}</p>
            </div>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code e.g. BANNER500"
            className="input flex-1 text-sm uppercase"
            maxLength={30}
            style={{ letterSpacing: '0.05em', fontWeight: 600 }}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            style={{ background: '#fbbf24', color: '#0a0e1a', fontFamily: 'Syne', whiteSpace: 'nowrap' }}
          >
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
              : <><Tag size={13} /> Redeem</>
            }
          </button>
        </form>

        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          💡 Promo codes are shared in our newsletter, social media and member announcements. Each code can only be used once per account.
        </p>

        {/* Recent redeemed this session */}
        {recentCodes.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Redeemed this session</p>
            <div className="space-y-1.5">
              {recentCodes.map((rc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold" style={{ color: '#fbbf24' }}>{rc.code}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--brand-green)' }}>+{rc.credits} credits</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCode;
