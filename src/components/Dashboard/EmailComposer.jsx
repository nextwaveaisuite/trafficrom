import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Send, Info, AlertCircle, CheckCircle,
  Sparkles, RefreshCw, ChevronDown, Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { supabase } from '../../lib/supabase';
import { MEMBERSHIP_TIERS, EMAIL_CATEGORIES } from '../../utils/constants';

const CREDITS_PER_100_RECIPIENTS = 10;

const TONES = [
  { value: 'urgent',       label: 'Urgent',       emoji: '🔥', desc: 'Creates FOMO and time pressure' },
  { value: 'professional', label: 'Professional',  emoji: '💼', desc: 'Credible and authoritative' },
  { value: 'casual',       label: 'Casual',        emoji: '😊', desc: 'Friendly and conversational' },
  { value: 'storytelling', label: 'Story-driven',  emoji: '📖', desc: 'Personal narrative that connects' },
];

const EmailComposer = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { spendCredits } = useCredits();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedTone, setSelectedTone] = useState('urgent');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [subjectVariations, setSubjectVariations] = useState([]);
  const [showVariations, setShowVariations] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const tier = profile?.membership_tier || 'free';
  const tierInfo = MEMBERSHIP_TIERS[tier];
  const maxRecipients = tierInfo?.maxRecipients || 500;
  const creditsAvailable = profile?.credits || 0;
  const maxSendable = Math.min(maxRecipients, Math.floor(creditsAvailable / CREDITS_PER_100_RECIPIENTS) * 100);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { recipientCount: Math.min(500, maxSendable), category: 'Make Money Online' }
  });

  const recipientCount = watch('recipientCount', Math.min(500, maxSendable));
  const selectedCategory = watch('category', 'Make Money Online');
  const creditsNeeded = Math.ceil(recipientCount / 100) * CREDITS_PER_100_RECIPIENTS;
  const canSend = creditsAvailable >= creditsNeeded && recipientCount > 0;

  const generateEmail = async () => {
    setIsGenerating(true);
    setAiError('');

    try {
      // Call our Netlify serverless function — keeps API key secure server-side
      const response = await fetch('/.netlify/functions/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          tone: selectedTone,
          generationCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const parsed = await response.json();

      if (parsed.subjects && parsed.body) {
        setSubjectVariations(parsed.subjects);
        setGeneratedSubject(parsed.subjects[0]);
        setGeneratedBody(parsed.body);
        setValue('subject', parsed.subjects[0]);
        setValue('message', parsed.body);
        setShowVariations(true);
        setGenerationCount(prev => prev + 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setAiError('Generation failed: ' + err.message);
    }
    setIsGenerating(false);
  };

  const pickSubjectVariation = (subject) => {
    setGeneratedSubject(subject);
    setValue('subject', subject);
    setShowVariations(false);
  };

  const onSubmit = async (data) => {
    if (!canSend) return;
    setIsSubmitting(true);
    setError('');

    const emailsSentToday = profile?.emails_sent_today || 0;
    if (emailsSentToday >= tierInfo.emailsPerDay) {
      setError('You have reached your daily send limit of ' + tierInfo.emailsPerDay + ' email(s). Upgrade your plan for more sends.');
      setIsSubmitting(false);
      return;
    }

    const { error: creditError } = await spendCredits(creditsNeeded, 'Campaign: ' + data.subject);
    if (creditError) {
      setError('Failed to deduct credits. Please try again.');
      setIsSubmitting(false);
      return;
    }

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
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your email is being delivered to {parseInt(recipientCount).toLocaleString()} opt-in marketers.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSuccess(false); setGeneratedSubject(''); setGeneratedBody(''); setSubjectVariations([]); setGenerationCount(0); }} className="btn-outline text-sm py-2 px-5">Send Another</button>
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

      <div className="flex items-center gap-3 p-3 rounded-lg mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Info size={16} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Balance: <strong style={{ color: 'var(--text-primary)' }}>{creditsAvailable.toLocaleString()} credits</strong> &nbsp;·&nbsp;
          Cost: <strong style={{ color: 'var(--text-primary)' }}>{CREDITS_PER_100_RECIPIENTS} per 100 recipients</strong> &nbsp;·&nbsp;
          Max today: <strong style={{ color: 'var(--brand-green)' }}>{maxSendable.toLocaleString()}</strong>
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
            <label className="label">Category / Niche</label>
            <select {...register('category')} className="input">
              {EMAIL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Select your niche first, then generate AI content tailored to that audience.</p>
          </div>

          {/* AI Generator Panel */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,212,120,0.25)', background: 'rgba(0,212,120,0.03)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,212,120,0.15)', background: 'rgba(0,212,120,0.06)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
                <Sparkles size={12} color="#0a0e1a" />
              </div>
              <p className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>AI Email Generator</p>
              <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(0,212,120,0.15)', color: 'var(--brand-green)', border: '1px solid rgba(0,212,120,0.2)' }}>Powered by Claude</span>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Choose email tone</p>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => setSelectedTone(tone.value)}
                      className="text-left p-2.5 rounded-lg transition-all"
                      style={{
                        background: selectedTone === tone.value ? 'rgba(0,212,120,0.12)' : 'var(--bg-secondary)',
                        border: '1px solid ' + (selectedTone === tone.value ? 'rgba(0,212,120,0.5)' : 'var(--border)'),
                      }}
                    >
                      <span className="text-sm font-semibold block" style={{ color: selectedTone === tone.value ? 'var(--brand-green)' : 'var(--text-primary)' }}>
                        {tone.emoji} {tone.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tone.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={generateEmail}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all"
                style={{
                  background: isGenerating ? 'transparent' : 'linear-gradient(135deg, #00d478, #00ad60)',
                  color: isGenerating ? 'var(--brand-green)' : '#0a0e1a',
                  border: isGenerating ? '1px solid rgba(0,212,120,0.3)' : 'none',
                  fontFamily: 'Syne',
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--brand-green)', borderTopColor: 'transparent' }} />
                    Writing your {selectedCategory} email...
                  </>
                ) : generationCount > 0 ? (
                  <><RefreshCw size={14} /> Regenerate Email</>
                ) : (
                  <><Zap size={14} /> Generate AI Email for {selectedCategory}</>
                )}
              </button>

              {aiError && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <p className="text-xs" style={{ color: '#f87171' }}>{aiError}</p>
                </div>
              )}

              {showVariations && subjectVariations.length > 0 && (
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Choose a subject line</p>
                    <button type="button" onClick={() => setShowVariations(false)} style={{ color: 'var(--text-muted)' }}>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  {subjectVariations.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickSubjectVariation(s)}
                      className="w-full text-left px-3 py-2.5 text-sm transition-colors"
                      style={{
                        borderBottom: i < subjectVariations.length - 1 ? '1px solid var(--border)' : 'none',
                        color: generatedSubject === s ? 'var(--brand-green)' : 'var(--text-primary)',
                        background: generatedSubject === s ? 'rgba(0,212,120,0.08)' : 'var(--bg-card)',
                      }}
                    >
                      {generatedSubject === s && '✓ '}{s}
                    </button>
                  ))}
                </div>
              )}

              {generationCount > 0 && !showVariations && (
                <button type="button" onClick={() => setShowVariations(true)} className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80" style={{ color: 'var(--brand-green)' }}>
                  <ChevronDown size={12} /> Show all {subjectVariations.length} subject line options
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="label">Email subject *</label>
            <input
              {...register('subject', {
                required: 'Subject is required',
                minLength: { value: 5, message: 'Min 5 characters' },
                maxLength: { value: 200, message: 'Max 200 characters' }
              })}
              placeholder="Use AI above to generate, or write your own subject line..."
              className="input"
            />
            {errors.subject && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.subject.message}</p>}
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label" style={{ marginBottom: 0 }}>Email body *</label>
              {generatedBody && (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--brand-green)' }}>
                  <Sparkles size={10} /> AI generated — feel free to edit
                </span>
              )}
            </div>
            <textarea
              {...register('message', {
                required: 'Message is required',
                minLength: { value: 50, message: 'Min 50 characters' }
              })}
              rows={12}
              placeholder="Click the AI generator above to auto-populate this with SEO-optimised, conversion-focused content for your selected niche. Or write your own email here..."
              className="input resize-y"
            />
            {errors.message && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.message.message}</p>}
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              💡 Replace <strong>[YOUR LINK HERE]</strong> with your actual affiliate or offer link before sending.
            </p>
          </div>

          {/* Recipients */}
          <div>
            <label className="label">
              Recipients: <strong style={{ color: 'var(--brand-green)' }}>{parseInt(recipientCount || 0).toLocaleString()}</strong>
            </label>
            <input
              {...register('recipientCount', {
                required: true,
                min: { value: 100, message: 'Minimum 100 recipients' },
                max: { value: maxSendable, message: 'Maximum ' + maxSendable.toLocaleString() + ' recipients (based on credits and plan)' }
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

        {/* Cost */}
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Campaign cost</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining after send: {Math.max(0, creditsAvailable - creditsNeeded).toLocaleString()} credits</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>{creditsNeeded.toLocaleString()}</p>
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
