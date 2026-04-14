import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Send, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { supabase } from '../../lib/supabase';
import { MEMBERSHIP_TIERS, EMAIL_CATEGORIES } from '../../utils/constants';

const CREDITS_PER_100_RECIPIENTS = 10; // 10 credits per 100 recipients

const EmailComposer = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { spendCredits } = useCredits();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const tier = profile?.membership_tier || 'free';
  const tierInfo = MEMBERSHIP_TIERS[tier];
  const maxRecipients = tierInfo?.maxRecipients || 500;
  const creditsAvailable = profile?.credits || 0;
  const maxSendable = Math.min(maxRecipients, Math.floor(creditsAvailable / CREDITS_PER_100_RECIPIENTS) * 100);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { recipientCount: Math.min(500, maxSendable) }
  });

  const recipientCount = watch('recipientCount', Math.min(500, maxSendable));
  const creditsNeeded = Math.ceil(recipientCount / 100) * CREDITS_PER_100_RECIPIENTS;
  const canSend = creditsAvailable >= creditsNeeded && recipientCount > 0;

  const onSubmit = async (data) => {
    if (!canSend) return;
    setIsSubmitting(true);
    setError('');

    // Check daily limit
    const emailsSentToday = profile?.emails_sent_today || 0;
    if (emailsSentToday >= tierInfo.emailsPerDay) {
      setError(`You've reached your daily send limit of ${tierInfo.emailsPerDay} email(s). Upgrade your plan for more sends.`);
      setIsSubmitting(false);
      return;
    }

    // Deduct credits
    const { error: creditError } = await spendCredits(creditsNeeded, `Campaign: ${data.subject}`);
    if (creditError) {
      setError('Failed to deduct credits. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Create campaign
    const { error: campaignError } = await supabase.from('email_campaigns').insert({
      user_id: user.id,
      subject: data.subject,
      message: data.message,
      target_category: data.category,
      credits_used: creditsNeeded,
      recipients_count: parseInt(data.recipientCount),
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (campaignError) {
      setError('Failed to send campaign. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Update daily count
    await supabase
      .from('profiles')
      .update({ emails_sent_today: emailsSentToday + 1, total_emails_sent: (profile.total_emails_sent || 0) + 1 })
      .eq('id', user.id);

    refreshProfile();
    setSuccess(true);
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,212,120,0.15)' }}>
            <CheckCircle size={32} style={{ color: 'var(--brand-green)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Campaign Sent! 🚀</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your email has been queued and will be delivered to {parseInt(recipientCount).toLocaleString()} recipients.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSuccess(false)} className="btn-outline text-sm py-2 px-5">Send Another</button>
            <button onClick={() => navigate('/dashboard/history')} className="btn-primary text-sm py-2 px-5">View Campaigns</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Compose Email</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Send your promotional email to opt-in affiliate marketers</p>

      {/* Credits info bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Info size={16} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          You have <strong style={{ color: 'var(--text-primary)' }}>{creditsAvailable.toLocaleString()} credits</strong>.
          Cost: <strong style={{ color: 'var(--text-primary)' }}>{CREDITS_PER_100_RECIPIENTS} credits per 100 recipients</strong>.
          Max recipients today: <strong style={{ color: 'var(--brand-green)' }}>{maxSendable.toLocaleString()}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card p-5 space-y-5">
          <div>
            <label className="label">Email subject *</label>
            <input
              {...register('subject', { required: 'Subject is required', minLength: { value: 5, message: 'Min 5 characters' }, maxLength: { value: 200, message: 'Max 200 characters' } })}
              placeholder="e.g. Discover a $47/day passive income method..."
              className="input"
            />
            {errors.subject && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.subject.message}</p>}
          </div>

          <div>
            <label className="label">Category / Niche</label>
            <select {...register('category')} className="input">
              {EMAIL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Email body *</label>
            <textarea
              {...register('message', { required: 'Message is required', minLength: { value: 50, message: 'Min 50 characters' } })}
              rows={10}
              placeholder="Write your promotional email here. Include a clear call-to-action and your affiliate link..."
              className="input resize-y"
            />
            {errors.message && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.message.message}</p>}
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>HTML is supported. Tip: Include a P.S. line – it's the most-read part of any email!</p>
          </div>

          <div>
            <label className="label">Number of recipients: <strong style={{ color: 'var(--brand-green)' }}>{parseInt(recipientCount || 0).toLocaleString()}</strong></label>
            <input
              {...register('recipientCount', {
                required: true,
                min: { value: 100, message: 'Minimum 100 recipients' },
                max: { value: maxSendable, message: `Maximum ${maxSendable.toLocaleString()} recipients (based on credits & plan)` }
              })}
              type="range"
              min={100}
              max={maxSendable || 100}
              step={100}
              className="w-full mt-2"
              style={{ accentColor: 'var(--brand-green)' }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>100</span>
              <span>{maxSendable.toLocaleString()}</span>
            </div>
            {errors.recipientCount && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.recipientCount.message}</p>}
          </div>
        </div>

        {/* Cost summary */}
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Campaign cost</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining after send: {Math.max(0, creditsAvailable - creditsNeeded).toLocaleString()} credits</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{creditsNeeded.toLocaleString()}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>credits</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSend || isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#0a0e1a', borderTopColor: 'transparent' }} />
            : <><Send size={16} /> Send to {parseInt(recipientCount || 0).toLocaleString()} Marketers</>
          }
        </button>

        {!canSend && creditsAvailable < 10 && (
          <p className="text-center text-sm" style={{ color: '#f87171' }}>
            Not enough credits. <a href="/dashboard/credits" style={{ textDecoration: 'underline' }}>Buy more credits</a> to continue.
          </p>
        )}
      </form>
    </div>
  );
};

export default EmailComposer;
