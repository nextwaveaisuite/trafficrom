// Netlify Scheduled Function — runs on cron schedule
// Automatically generates promo codes and announces to members

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // needs service key for admin operations
);

const CODE_TYPES = {
  general:     { prefix: 'ROM',    label: 'General Credits' },
  banner_ads:  { prefix: 'BANNER', label: 'Banner Ad Credits' },
  solo_ads:    { prefix: 'SOLO',   label: 'Solo Ad Credits' },
  email_sends: { prefix: 'MAIL',   label: 'Email Send Credits' },
  bonus:       { prefix: 'BONUS',  label: 'Bonus Credits' },
};

const generateCode = (type) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = CODE_TYPES[type]?.prefix || 'ROM';
  const random = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const month = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
  return `${prefix}${month}${random}`;
};

exports.handler = async (event) => {
  console.log('Auto-promo function triggered:', new Date().toISOString());

  try {
    // Fetch all active schedules
    const { data: schedules, error: scheduleError } = await supabase
      .from('promo_schedules')
      .select('*')
      .eq('is_active', true);

    if (scheduleError) throw scheduleError;
    if (!schedules || schedules.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: 'No active schedules found' }) };
    }

    const now = new Date();
    const results = [];

    for (const schedule of schedules) {
      // Check if it's time to generate a new code
      const lastRun = schedule.last_run_at ? new Date(schedule.last_run_at) : null;
      let shouldRun = false;

      if (!lastRun) {
        shouldRun = true;
      } else {
        const diffDays = (now - lastRun) / (1000 * 60 * 60 * 24);
        if (schedule.frequency === 'weekly'      && diffDays >= 7)  shouldRun = true;
        if (schedule.frequency === 'fortnightly' && diffDays >= 14) shouldRun = true;
        if (schedule.frequency === 'monthly'     && diffDays >= 30) shouldRun = true;
      }

      if (!shouldRun) {
        results.push({ schedule: schedule.id, status: 'skipped — not due yet' });
        continue;
      }

      // Deactivate previous auto-generated code for this schedule
      await supabase
        .from('promo_codes')
        .update({ is_active: false })
        .eq('schedule_id', schedule.id)
        .eq('is_active', true);

      // Generate new code
      const newCode = generateCode(schedule.credit_type);
      const expiresAt = new Date(now.getTime() + (schedule.expires_days || 30) * 24 * 60 * 60 * 1000);
      const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

      const { data: promoData, error: insertError } = await supabase
        .from('promo_codes')
        .insert({
          code: newCode,
          credits: schedule.credits,
          credit_type: schedule.credit_type,
          description: `${schedule.label || CODE_TYPES[schedule.credit_type]?.label} — ${monthLabel} (Auto)`,
          max_uses: schedule.max_uses || null,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          schedule_id: schedule.id,
          uses_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        results.push({ schedule: schedule.id, status: 'error', error: insertError.message });
        continue;
      }

      // Create member announcement if enabled
      if (schedule.auto_announce) {
        await supabase.from('announcements').insert({
          title: `🎁 New Promo Code Available — ${monthLabel}!`,
          message: `Claim your free ${schedule.credits} ${CODE_TYPES[schedule.credit_type]?.label || 'credits'}!\n\nYour code: **${newCode}**\n\nGo to Dashboard → Credits → Enter promo code to claim. Valid until ${expiresAt.toLocaleDateString()}. One use per account.`,
          type: 'promo',
          promo_code: newCode,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });
      }

      // Update schedule last_run_at
      await supabase
        .from('promo_schedules')
        .update({ last_run_at: now.toISOString(), last_code: newCode })
        .eq('id', schedule.id);

      results.push({
        schedule: schedule.id,
        status: 'success',
        code: newCode,
        credits: schedule.credits,
        announced: schedule.auto_announce,
      });

      console.log(`Generated code: ${newCode} for schedule: ${schedule.id}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, processed: results.length, results }),
    };

  } catch (err) {
    console.error('Auto-promo error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
