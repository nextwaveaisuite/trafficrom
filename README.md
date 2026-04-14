# Traffic ROM 🚀

> Real Opt-in Marketing. Traffic that actually wants to hear from you — starting at just $7/month.

Built with **React + Supabase + Netlify**. Designed to be duplicated and customized for multiple niches.

---

## 🗂 Project Structure

```
traffic-rom/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── Auth/               # Login, Register, ProtectedRoute
│   │   ├── Dashboard/          # Dashboard, EmailComposer, CampaignHistory, CreditManager
│   │   └── Layout/             # Header, Sidebar, Footer
│   ├── pages/                  # Home, Pricing, Features
│   ├── hooks/                  # useAuth, useCredits
│   ├── lib/                    # supabase.js
│   ├── utils/                  # constants.js, helpers.js
│   └── styles/                 # index.css
├── supabase/
│   └── migrations/             # SQL schema (run in Supabase)
├── .env.example
├── netlify.toml
└── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 – Clone or upload to GitHub

1. Create a new GitHub repository (e.g. `traffic-rom`)
2. Upload the extracted zip contents
3. Commit and push

### Step 2 – Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In **SQL Editor**, open and run the file:  
   `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### Step 3 – Set environment variables

Copy `.env.example` to `.env` and fill in your values:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx   (optional, for payments)
REACT_APP_SITE_URL=https://yourdomain.netlify.app
```

### Step 4 – Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from GitHub**
2. Select your repository
3. Build settings are auto-detected from `netlify.toml`
4. Add environment variables in **Site settings → Environment variables**
5. Click **Deploy**

### Step 5 – Enable Supabase Auth

1. In Supabase go to **Authentication → Settings**
2. Set your **Site URL** to your Netlify URL
3. Add redirect URLs: `https://yourdomain.netlify.app/**`

---

## 💳 Stripe Integration (Optional)

To enable credit purchases:

1. Create a [Stripe](https://stripe.com) account
2. Add your publishable key to `.env`
3. Set up a Supabase Edge Function in `supabase/functions/process-payment/`
4. Connect Stripe webhooks to update the `credit_transactions` table

---

## 🎨 Customizing the Brand

All branding is centralized for easy modification:

| File | What to change |
|------|---------------|
| `src/utils/constants.js` | Pricing, credit packages, categories |
| `src/styles/index.css` | Colors (CSS variables at top) |
| `tailwind.config.js` | Color palette, fonts |
| `public/index.html` | Site title, meta description |
| All layout files | Logo text, site name |

To clone for a new niche, duplicate the repo and update these files.

---

## 📈 Membership Tiers

| Plan | Price | Emails/Day | Recipients | Credit Ratio |
|------|-------|-----------|------------|-------------|
| Free | $0 | 2/week | 500 | 1x |
| Starter | $7/mo | 1/day | 2,000 | 1.5x |
| Pro | $15/mo | 3/day | 10,000 | 2x |

---

## 🛠 Local Development

```bash
npm install
cp .env.example .env   # fill in your Supabase keys
npm start              # runs on http://localhost:3000
```

---

## 📌 Roadmap

- [ ] Stripe payment integration
- [ ] Referral tracking dashboard
- [ ] Advanced analytics page
- [ ] Account settings page
- [ ] Email inbox (read emails to earn credits)
- [ ] Admin panel
- [ ] Mobile app (React Native)

---

Built with ❤️ for the struggling marketer.
