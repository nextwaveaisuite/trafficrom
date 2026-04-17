const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const slug = event.path.replace('/go/', '').replace(/^\/+|\/+$/g, '');

  if (!slug) {
    return { statusCode: 302, headers: { Location: '/' } };
  }

  try {
    const { data: link, error } = await supabase
      .from('cloaked_links')
      .select('id, destination_url, is_active, clicks')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !link) {
      return {
        statusCode: 302,
        headers: { Location: '/?ref=invalid-link' },
      };
    }

    // Track the click
    supabase.from('cloaked_links')
      .update({ clicks: (link.clicks || 0) + 1, last_clicked_at: new Date().toISOString() })
      .eq('id', link.id)
      .then(() => {});

    supabase.from('link_clicks').insert({
      link_id: link.id,
      clicked_at: new Date().toISOString(),
      referrer: event.headers?.referer || null,
      user_agent: event.headers?.['user-agent'] || null,
    }).then(() => {});

    return {
      statusCode: 302,
      headers: {
        Location: link.destination_url,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    };
  } catch (err) {
    console.error('Link redirect error:', err);
    return { statusCode: 302, headers: { Location: '/' } };
  }
};
