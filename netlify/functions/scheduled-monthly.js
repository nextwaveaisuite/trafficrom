// Runs on the 1st of every month at 00:05 UTC
// Awards leaderboard prizes to top performers
// Schedule set in netlify.toml

const { createClient } = require('@supabase/supabase-js');

const PRIZES = {
  referrers: [500, 250, 100],
  mailers:   [400, 200, 75],
  readers:   [300, 150, 50],
};

exports.handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now = new Date();
  // Get start of the previous month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  try {
    const results = [];

    // 1. TOP REFERRERS
    const { data: refData } = await supabase
      .from('referrals')
      .select('referrer_id')
      .gte('created_at', startOfLastMonth)
      .lt('created_at', endOfLastMonth);

    const refCounts = {};
    (refData || []).forEach(r => { refCounts[r.referrer_id] = (refCounts[r.referrer_id] || 0) + 1; });
    const topReferrers = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    for (let i = 0; i < topReferrers.length; i++) {
      const [userId] = topReferrers[i];
      const prize = PRIZES.referrers[i];
      await supabase.rpc('earn_credits', { p_user_id: userId, p_amount: prize, p_description: `🏆 Leaderboard prize — Top Referrer #${i+1} — ${monthLabel}` });
      results.push({ type: 'referrer', rank: i+1, userId, prize });
    }

    // 2. TOP MAILERS
    const { data: mailData } = await supabase
      .from('email_campaigns')
      .select('user_id')
      .eq('status', 'sent')
      .gte('created_at', startOfLastMonth)
      .lt('created_at', endOfLastMonth);

    const mailCounts = {};
    (mailData || []).forEach(r => { mailCounts[r.user_id] = (mailCounts[r.user_id] || 0) + 1; });
    const topMailers = Object.entries(mailCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    for (let i = 0; i < topMailers.length; i++) {
      const [userId] = topMailers[i];
      const prize = PRIZES.mailers[i];
      await supabase.rpc('earn_credits', { p_user_id: userId, p_amount: prize, p_description: `🏆 Leaderboard prize — Top Mailer #${i+1} — ${monthLabel}` });
      results.push({ type: 'mailer', rank: i+1, userId, prize });
    }

    // 3. TOP READERS
    const { data: readData } = await supabase
      .from('credit_transactions')
      .select('user_id, amount')
      .eq('type', 'earned')
      .gte('created_at', startOfLastMonth)
      .lt('created_at', endOfLastMonth);

    const readCounts = {};
    (readData || []).forEach(r => { readCounts[r.user_id] = (readCounts[r.user_id] || 0) + r.amount; });
    const topReaders = Object.entries(readCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    for (let i = 0; i < topReaders.length; i++) {
      const [userId] = topReaders[i];
      const prize = PRIZES.readers[i];
      await supabase.rpc('earn_credits', { p_user_id: userId, p_amount: prize, p_description: `🏆 Leaderboard prize — Top Reader #${i+1} — ${monthLabel}` });
      results.push({ type: 'reader', rank: i+1, userId, prize });
    }

    console.log(`Monthly prizes awarded for ${monthLabel}:`, results);
    return { statusCode: 200, body: JSON.stringify({ success: true, monthLabel, prizesAwarded: results.length, results }) };
  } catch (err) {
    console.error('Monthly prizes failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
