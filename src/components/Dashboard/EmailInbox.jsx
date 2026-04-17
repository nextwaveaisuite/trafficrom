import { useEffect, useState, useCallback } from 'react';
import { Mail, Clock, Coins, CheckCircle, ExternalLink, RefreshCw, Inbox } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../utils/helpers';
import { MEMBERSHIP_TIERS } from '../../utils/constants';

const READING_TIME = 7;
const CREDITS_PER_EMAIL = 5;

// Replace merge tags with reader's actual details
const personalise = (text, profile) => {
  if (!text) return text;
  const firstName = profile?.first_name || profile?.username || 'Friend';
  return text
    .replace(/\[FIRST_NAME\]/gi, firstName)
    .replace(/\[USERNAME\]/gi, profile?.username || 'Friend');
};

const EmailInbox = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(null);
  const [timer, setTimer] = useState(0);
  const [credited, setCredited] = useState([]);
  const [earnedToday, setEarnedToday] = useState(0);

  const tier = profile?.membership_tier || 'free';
  const tierInfo = MEMBERSHIP_TIERS[tier];
  const creditMultiplier = tierInfo?.creditRatio || 1;
  const creditsEarned = Math.floor(CREDITS_PER_EMAIL * creditMultiplier);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('email_campaigns')
      .select('id, subject, message, target_category, created_at, user_id, profiles(username, first_name)')
      .neq('user_id', user.id)
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(20);
    setEmails(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) fetchEmails(); }, [user, fetchEmails]);

  useEffect(() => {
    if (!reading) return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          awardCredits(reading);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reading, timer]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEmail = (email) => {
    if (credited.includes(email.id)) return;
    setReading(email);
    setTimer(READING_TIME);
  };

  const awardCredits = async (email) => {
    if (credited.includes(email.id)) return;
    await supabase.rpc('earn_credits', {
      p_user_id: user.id,
      p_amount: creditsEarned,
      p_description: `Read email: "${email.subject.slice(0, 40)}"`,
    });
    await supabase.from('email_tracking').upsert({
      campaign_id: email.id,
      recipient_id: user.id,
      opened_at: new Date().toISOString(),
    }, { onConflict: 'campaign_id,recipient_id' });
    await supabase.rpc('increment_opens', { p_campaign_id: email.id }).maybeSingle();
    setCredited(prev => [...prev, email.id]);
    setEarnedToday(prev => prev + creditsEarned);
    refreshProfile();
  };

  const closeEmail = () => {
    setReading(null);
    setTimer(0);
  };

  const timerPct = ((READING_TIME - timer) / READING_TIME) * 100;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Email Inbox</h1>
        <button onClick={fetchEmails} className="p-2 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Read emails from other members to earn credits. Your earn rate: <strong style={{ color: 'var(--brand-green)' }}>+{creditsEarned} credits per email</strong>
        {tier !== 'free' && <span style={{ color: 'var(--brand-green)' }}> ({creditMultiplier}x {tier} multiplier)</span>}
      </p>

      {earnedToday > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg mb-5" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)' }}>
          <Coins size={16} style={{ color: 'var(--brand-green)' }} />
          <p className="text-sm" style={{ color: 'var(--brand-green)' }}>
            You've earned <strong>+{earnedToday} credits</strong> this session! Keep reading to earn more.
          </p>
        </div>
      )}

      {/* Reading modal */}
      {reading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {personalise(reading.subject, profile)}
                </p>
                {timer > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <Clock size={13} style={{ color: '#fbbf24' }} />
                    <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>Read for {timer}s to earn credits</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.3)' }}>
                    <CheckCircle size={13} style={{ color: 'var(--brand-green)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--brand-green)' }}>+{creditsEarned} credits earned!</span>
                  </div>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: timerPct + '%', background: timer > 0 ? '#fbbf24' : 'var(--brand-green)' }} />
              </div>
            </div>

            {/* Email body with personalisation */}
            <div className="p-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                {personalise(reading.message, profile)}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                From: @{reading.profiles?.username || 'member'} · {timeAgo(reading.created_at)}
              </p>
              <div className="flex gap-2">
                <button onClick={closeEmail} className="btn-outline text-sm py-1.5 px-4">Close</button>
                <a href="#visit" onClick={e => e.preventDefault()} className="btn-primary text-sm py-1.5 px-4 inline-flex items-center gap-1">
                  Visit Site <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email list */}
      <div className="card overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <div className="col-span-2">Subject</div>
          <div>From</div>
          <div>Category</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3" style={{ borderColor: 'var(--brand-green)', borderTopColor: 'transparent' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Inbox is empty</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No emails to read right now. Check back soon as other members send campaigns.</p>
          </div>
        ) : emails.map((email) => {
          const isRead = credited.includes(email.id);
          return (
            <div key={email.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 px-5 py-3 items-center transition-colors"
              style={{ borderBottom: '1px solid var(--border)', background: isRead ? 'rgba(0,212,120,0.03)' : 'transparent' }}>
              <div className="col-span-2 flex items-center gap-2">
                <Mail size={14} style={{ color: isRead ? 'var(--brand-green)' : 'var(--text-muted)', flexShrink: 0 }} />
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {personalise(email.subject, profile)}
                </p>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@{email.profiles?.username || 'member'}</div>
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {email.target_category || 'General'}
                </span>
              </div>
              <div>
                {isRead ? (
                  <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: 'var(--brand-green)' }}>
                    <CheckCircle size={12} /> +{creditsEarned} earned
                  </span>
                ) : (
                  <button onClick={() => openEmail(email)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Coins size={11} /> Read & Earn
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        You must read each email for {READING_TIME} seconds to earn credits. Credits are awarded automatically when the timer completes.
      </p>
    </div>
  );
};

export default EmailInbox;
