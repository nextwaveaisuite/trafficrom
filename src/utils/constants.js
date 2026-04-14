export const MEMBERSHIP_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    emailsPerDay: 2,
    emailsPerWeek: 2,
    creditRatio: 1,        // earn 1 credit per email read
    maxRecipients: 500,
    features: ['2 emails/week', '500 recipients max', 'Basic templates', 'Community support'],
  },
  starter: {
    name: 'Starter',
    price: 7,
    emailsPerDay: 1,
    emailsPerWeek: 7,
    creditRatio: 1.5,
    maxRecipients: 2000,
    features: ['1 email/day', '2,000 recipients', 'Priority delivery', 'Analytics dashboard', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 15,
    emailsPerDay: 3,
    emailsPerWeek: 21,
    creditRatio: 2,
    maxRecipients: 10000,
    features: ['3 emails/day', '10,000 recipients', 'Fastest delivery', 'Advanced analytics', 'Category targeting', 'Priority support'],
  },
};

export const CREDIT_PACKAGES = [
  { id: 'credits_100',  credits: 100,  price: 5,   label: 'Starter Pack' },
  { id: 'credits_500',  credits: 500,  price: 20,  label: 'Growth Pack' },
  { id: 'credits_1500', credits: 1500, price: 50,  label: 'Pro Pack' },
  { id: 'credits_5000', credits: 5000, price: 150, label: 'Power Pack' },
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
  memberReferral: 0.50,   // 50% of monthly membership fee
  creditPurchase: 0.30,   // 30% of credit package purchase
};
