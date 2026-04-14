exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in Netlify environment variables.' })
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }; }

  const { category, tone, generationCount = 0 } = body;

  const hooks = [
    'How I achieved results without any prior experience',
    'The system that works while you sleep',
    'Why most people struggle with this and how to be different',
    'The strategy top performers are quietly using',
    'What nobody tells you about getting started',
  ];

  const niches = {
    'Make Money Online':   { angle: 'passive income, financial freedom, working from home', audience: 'side hustlers, aspiring entrepreneurs' },
    'Affiliate Marketing': { angle: 'earning commissions, promoting products, passive income', audience: 'bloggers, content creators, marketers' },
    'Cryptocurrency':      { angle: 'crypto gains, blockchain, DeFi, Bitcoin', audience: 'crypto enthusiasts, investors' },
    'Health & Fitness':    { angle: 'weight loss, muscle gain, energy, natural health', audience: 'people wanting to get fit and healthy' },
    'Business Opportunity':{ angle: 'entrepreneurship, scaling income, freedom lifestyle', audience: 'aspiring entrepreneurs' },
    'Digital Products':    { angle: 'courses, ebooks, software, high profit margins', audience: 'creators, educators, marketers' },
    'Self Improvement':    { angle: 'mindset, productivity, habits, success principles', audience: 'ambitious people wanting to grow' },
    'Software & Tools':    { angle: 'automation, time-saving, productivity, ROI', audience: 'business owners, marketers' },
    'E-commerce':          { angle: 'online stores, dropshipping, Amazon FBA', audience: 'entrepreneurs wanting to sell online' },
    'General':             { angle: 'online business, marketing, making money', audience: 'general online marketers' },
  };

  const niche = niches[category] || niches['General'];
  const hook = hooks[generationCount % hooks.length];

  const prompt = `You are an expert direct-response email copywriter specializing in affiliate marketing.

Write a high-converting promotional email for the "${category}" niche.
- Core angle: ${niche.angle}
- Target audience: ${niche.audience}
- Hook inspiration: ${hook}
- Tone: ${tone}

Requirements:
- Generate 3 subject line options (under 60 characters each, curiosity-driven)
- Write one complete email body (150-200 words)
- Include: attention-grabbing opening, pain point, solution teaser, social proof hint, CTA with [YOUR LINK HERE]
- End with a P.S. line
- No spammy words or excessive punctuation
- Feel personal and authentic

Respond in this EXACT JSON format only, no other text:
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
      return { statusCode: response.status, body: JSON.stringify({ error: `Anthropic API error: ${response.status}`, details: errText }) };
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
    return { statusCode: 500, body: JSON.stringify({ error: 'Generation failed', details: err.message }) };
  }
};
