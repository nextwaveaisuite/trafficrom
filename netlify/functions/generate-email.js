// Netlify serverless function — proxies requests to Anthropic API
// The API key stays server-side and is never exposed to the browser

const NICHE_PROMPTS = {
  'Make Money Online': {
    angle: 'passive income, financial freedom, working from home, escaping the 9-5',
    audience: 'people looking to earn extra income online, side hustlers, aspiring entrepreneurs',
  },
  'Affiliate Marketing': {
    angle: 'earning commissions, promoting products, building passive income through affiliate networks',
    audience: 'bloggers, content creators, marketers wanting to monetize their audience',
  },
  'Cryptocurrency': {
    angle: 'crypto gains, blockchain opportunities, DeFi, altcoins, Bitcoin, market timing',
    audience: 'crypto enthusiasts, investors, people interested in digital assets',
  },
  'Health & Fitness': {
    angle: 'weight loss, muscle gain, energy, longevity, natural health solutions',
    audience: 'people wanting to lose weight, get fit, improve their health naturally',
  },
  'Business Opportunity': {
    angle: 'entrepreneurship, starting a business, scaling income, freedom lifestyle',
    audience: 'aspiring entrepreneurs, people wanting to start their own business',
  },
  'Digital Products': {
    angle: 'courses, ebooks, software, templates, digital downloads with high profit margins',
    audience: 'creators, educators, marketers selling or buying digital products',
  },
  'Self Improvement': {
    angle: 'mindset, productivity, habits, success principles, personal development',
    audience: 'ambitious people wanting to improve their life, career, relationships',
  },
  'Software & Tools': {
    angle: 'automation, time-saving, productivity tools, SaaS solutions, ROI',
    audience: 'business owners, marketers, entrepreneurs looking for tools to grow faster',
  },
  'E-commerce': {
    angle: 'online stores, dropshipping, Amazon FBA, product selling, ecommerce profits',
    audience: 'entrepreneurs wanting to sell products online, existing store owners',
  },
  'General': {
    angle: 'online business, marketing, making money, building an audience',
    audience: 'general online marketers and entrepreneurs',
  },
};

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Check API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in Netlify environment variables.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { category, tone, generationCount = 0 } = body;
  const niche = NICHE_PROMPTS[category] || NICHE_PROMPTS['General'];

  const hooks = [
    'How I achieved results without any prior experience',
    'The system that works while you sleep',
    'Why most people struggle with this (and how to be different)',
    'The strategy top performers are quietly using',
    'What nobody tells you about getting started',
  ];
  const hook = hooks[generationCount % hooks.length];

  const prompt = `You are an expert direct-response email copywriter specializing in affiliate marketing and online business.

Write a high-converting promotional email for the "${category}" niche.

Niche details:
- Core angle: ${niche.angle}
- Target audience: ${niche.audience}
- Hook inspiration: ${hook}
- Tone: ${tone}

Requirements:
- Generate 3 different subject line options (each under 60 characters, curiosity-driven, high open-rate)
- Write one complete email body (150-200 words)
- Email body must include: attention-grabbing opening, pain point identification, solution teaser, social proof hint, clear call-to-action with [YOUR LINK HERE] placeholder
- End with a compelling P.S. line
- Tone must be: ${tone}
- Do NOT use spammy words or excessive punctuation
- Make it feel personal and authentic

Respond in this EXACT JSON format with no other text before or after:
{"subjects": ["subject 1", "subject 2", "subject 3"], "body": "full email body here"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Anthropic API error: ${response.status}`, details: errText })
      };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Generation failed', details: err.message })
    };
  }
};
