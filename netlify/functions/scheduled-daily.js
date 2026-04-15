// Runs every day at midnight UTC
// Resets daily email send counts for all members
// Schedule set in netlify.toml

const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Reset daily send counts
    const { error } = await supabase
      .from('profiles')
      .update({ emails_sent_today: 0 })
      .gte('emails_sent_today', 0);

    if (error) throw error;

    console.log('Daily reset completed successfully.');
    return { statusCode: 200, body: JSON.stringify({ success: true, task: 'daily-reset' }) };
  } catch (err) {
    console.error('Daily reset failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
