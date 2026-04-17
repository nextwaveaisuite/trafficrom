const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://trafficrom.netlify.app';

const PRICE_MAP = {
  [process.env.STRIPE_STARTER_PRICE_ID]:          { tier: 'starter', type: 'subscription', credits: 0 },
  [process.env.STRIPE_PRO_PRICE_ID]:              { tier: 'pro',     type: 'subscription', credits: 0 },
  [process.env.STRIPE_ELITE_PRICE_ID]:            { tier: 'elite',   type: 'subscription', credits: 0 },
  [process.env.STRIPE_STARTER_LIFETIME_PRICE_ID]: { tier: 'starter', type: 'lifetime',     credits: 0 },
  [process.env.STRIPE_PRO_LIFETIME_PRICE_ID]:     { tier: 'pro',     type: 'lifetime',     credits: 0 },
  [process.env.STRIPE_ELITE_LIFETIME_PRICE_ID]:   { tier: 'elite',   type: 'lifetime',     credits: 0 },
  [process.env.STRIPE_CREDITS_500_PRICE_ID]:      { tier: null,      type: 'credits',      credits: 500  },
  [process.env.STRIPE_CREDITS_2000_PRICE_ID]:     { tier: null,      type: 'credits',      credits: 2000 },
  [process.env.STRIPE_CREDITS_5000_PRICE_ID]:     { tier: null,      type: 'credits',      credits: 5000 },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { priceId, userId, userEmail } = JSON.parse(event.body);

    if (!priceId || !userId || !userEmail) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const priceInfo = PRICE_MAP[priceId];
    if (!priceInfo) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid price ID' }) };
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const isSubscription = priceInfo.type === 'subscription';
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${SITE_URL}/dashboard?payment=success&type=${priceInfo.type}&tier=${priceInfo.tier || 'credits'}&credits=${priceInfo.credits}`,
      cancel_url: `${SITE_URL}/pricing?payment=cancelled`,
      metadata: {
        user_id: userId,
        price_id: priceId,
        type: priceInfo.type,
        tier: priceInfo.tier || '',
        credits: String(priceInfo.credits),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    console.error('Checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
