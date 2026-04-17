const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log('Stripe webhook:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {

      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const userId = session.metadata?.user_id;
        const priceId = session.metadata?.price_id;
        const type = session.metadata?.type;
        const tier = session.metadata?.tier;
        const credits = parseInt(session.metadata?.credits || '0');

        if (!userId) break;

        const priceInfo = PRICE_MAP[priceId] || { type, tier, credits };

        if (priceInfo.type === 'credits') {
          await supabase.rpc('earn_credits', {
            p_user_id: userId,
            p_amount: priceInfo.credits,
            p_description: `Credit purchase: ${priceInfo.credits} credits`,
          });
        } else if (priceInfo.tier) {
          const updates = {
            membership_tier: priceInfo.tier,
            subscription_status: priceInfo.type === 'lifetime' ? 'lifetime' : 'active',
          };
          if (session.subscription) {
            updates.stripe_subscription_id = session.subscription;
          }
          await supabase.from('profiles').update(updates).eq('id', userId);
        }

        await supabase.from('payment_transactions').insert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: session.amount_total / 100,
          currency: session.currency,
          type: priceInfo.type,
          tier: priceInfo.tier,
          credits: priceInfo.credits,
          status: 'completed',
        });

        break;
      }

      case 'customer.subscription.updated': {
        const sub = stripeEvent.data.object;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const priceInfo = PRICE_MAP[priceId];

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', sub.customer)
          .single();

        if (profile && priceInfo) {
          await supabase.from('profiles').update({
            membership_tier: priceInfo.tier,
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
          }).eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', sub.customer)
          .single();

        if (profile) {
          await supabase.from('profiles').update({
            membership_tier: 'free',
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
          }).eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (profile) {
          await supabase.from('profiles').update({
            subscription_status: 'past_due',
          }).eq('id', profile.id);
        }
        break;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
