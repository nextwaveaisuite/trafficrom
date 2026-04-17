export const MEMBERSHIP_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    lifetimePrice: null,
    emailsPerDay: 2,
    emailsPerWeek: 2,
    creditRatio: 1,
    maxRecipients: 500,
    features: ['2 emails/week', '500 recipients max', 'AI email composer', 'Link cloaker', 'Community support'],
  },
  starter: {
    name: 'Starter',
    price: 7,
    lifetimePrice: 47,
    emailsPerDay: 1,
    emailsPerWeek: 7,
    creditRatio: 1.5,
    maxRecipients: 2000,
    features: ['1 email/day', '2,000 recipients', 'AI email composer', 'Link cloaker', '1.5x credit multiplier', 'Banner ads', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    price: 15,
    lifetimePrice: 97,
    emailsPerDay: 3,
    emailsPerWeek: 21,
    creditRatio: 2,
    maxRecipients: 10000,
    features: ['3 emails/day', '10,000 recipients', 'AI email composer', 'Link cloaker', '2x credit multiplier', 'Fastest delivery', 'Advanced analytics', 'Priority support'],
  },
  elite: {
    name: 'Elite',
    price: 29,
    lifetimePrice: 197,
    emailsPerDay: 999,
    emailsPerWeek: 999,
    creditRatio: 3,
    maxRecipients: 999999,
    features: ['Unlimited emails/day', 'Full database — every member', 'AI email composer', 'Link cloaker', '3x credit multiplier', 'Fastest delivery', 'Advanced analytics', 'VIP support', 'Founding member badge'],
  },
};

export const CREDIT_PACKAGES = [
  { id: 'credits_500',  credits: 500,  price: 5,  label: 'Starter Pack', desc: 'Perfect for testing' },
  { id: 'credits_2000', credits: 2000, price: 15, label: 'Growth Pack',  desc: 'Best value' },
  { id: 'credits_5000', credits: 5000, price: 29, label: 'Power Pack',   desc: 'For serious mailers' },
];

export const EMAIL_CATEGORIES = [
  'Make Money Online',
  'Affiliate Marketing',
  'Health & Fitness',
  'Cryptocurrency',
  'Business Opportunity',
  'Digital Products',
  'Self Improvement',
  'Software & Tools',
  'E-commerce',
  'General',
];

export const COMMISSION_RATES = {
  memberReferral: 0.50,
  creditPurchase: 0.30,
};
