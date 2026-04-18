import { useState } from 'react';
import { ExternalLink, Star, Users, TrendingUp, Zap, Globe, ChevronRight } from 'lucide-react';

const TRAFFIC_SITES = [
  {
    category: 'Safelists',
    sites: [
      { name: 'Herculist Plus',         url: 'https://www.herculist.com',               desc: '350,000+ members. Send daily to the full database on Gold plan. One of the most responsive safelists.',  rating: 5, members: '350k+', price: 'Free / $14.95/mo' },
      { name: 'MisterSafelist',          url: 'https://www.mistersafelist.com',           desc: 'Run by Jerry Iannucci, the godfather of safelist marketing. Highly active community.',                    rating: 5, members: '50k+',  price: 'Free / $10/mo' },
      { name: 'ListJoe',                 url: 'https://www.listjoe.com',                  desc: 'Clean interface, active membership. Great for MMO and business opportunity offers.',                        rating: 4, members: '30k+',  price: 'Free / $10/mo' },
      { name: 'State of the Art Mailer', url: 'https://www.state-of-the-art-mailer.com', desc: 'Long-running safelist with a solid reputation. Good deliverability rates.',                                rating: 4, members: '40k+',  price: 'Free / $9.95/mo' },
      { name: 'MyDailyMailer',           url: 'https://www.mydailymailer.com',            desc: 'Daily mailing platform. Mail Token system keeps the list clean and active.',                               rating: 4, members: '20k+',  price: 'Free / $7/mo' },
    ]
  },
  {
    category: 'Traffic Exchanges',
    sites: [
      { name: 'TrafficG',     url: 'https://www.trafficg.com',     desc: 'One of the oldest and most trusted traffic exchanges. Real human visitors guaranteed.',       rating: 5, members: '100k+', price: 'Free / upgrades' },
      { name: 'Hit2Hit',      url: 'https://www.hit2hit.com',      desc: 'Manual traffic exchange with strong community. Good for landing pages and capture pages.',    rating: 4, members: '50k+',  price: 'Free / upgrades' },
      { name: 'EasyHits4U',   url: 'https://www.easyhits4u.com',   desc: 'Massive membership. 1:1 surf ratio. Popular for beginners getting started with free traffic.', rating: 4, members: '1.5M+', price: 'Free / upgrades' },
      { name: 'TrafficAdBar', url: 'https://www.trafficadbar.com', desc: 'Unique bar-style advertising. Runs in background while you browse. Passive traffic earning.',  rating: 3, members: '80k+',  price: 'Free / upgrades' },
    ]
  },
  {
    category: 'Viral Mailers',
    sites: [
      { name: 'List Infinity',     url: 'https://www.listinfinity.net',     desc: 'Viral list builder. Refer 2 members and unlock free mailing. Grows itself automatically.', rating: 5, members: '30k+', price: 'Free' },
      { name: 'ProActiveMailer',   url: 'https://proactivemailer.com',      desc: 'Phil cleans inactive members weekly — keeps the list fresh and responsive.',              rating: 4, members: '15k+', price: 'Free / upgrades' },
      { name: 'European Safelist', url: 'https://www.europeansafelist.com', desc: 'Great for reaching European marketers. Less competition than US-focused platforms.',        rating: 4, members: '20k+', price: 'Free / $7/mo' },
    ]
  },
  {
    category: 'Downline Builders',
    sites: [
      { name: 'Free Traffic System', url: 'https://www.freetrafficsystem.com', desc: 'Join once, get listed across dozens of traffic sites. Build your downline everywhere simultaneously.', rating: 5, members: '100k+', price: 'Free' },
      { name: 'TrafficZipper',       url: 'https://www.trafficzipper.com',     desc: 'Automates your safelist mailings across 25+ platforms. Saves hours of manual work daily.',             rating: 5, members: '50k+',  price: '$27-37/mo' },
    ]
  },
];

const CATEGORY_COLORS = {
  'Safelists':         'var(--brand-green)',
  'Traffic Exchanges': '#60a5fa',
  'Viral Mailers':     '#f472b6',
  'Downline Builders': '#fbbf24',
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={11} fill={i <= rating ? '#fbbf24' : 'transparent'} style={{ color: i <= rating ? '#fbbf24' : 'var(--border)' }} />
    ))}
  </div>
);

const DownlineBuilder = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...TRAFFIC_SITES.map(c => c.category)];
  const filtered = activeCategory === 'All' ? TRAFFIC_SITES : TRAFFIC_SITES.filter(c => c.category === activeCategory);
  const totalSites = TRAFFIC_SITES.reduce((sum, c) => sum + c.sites.length, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
          <Globe size={22} style={{ color: 'var(--brand-green)' }} /> Downline Builder
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Recommended traffic sites to multiply your reach. Join these platforms and build your downline across the entire safelist ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 my-5">
        {[
          { label: 'Recommended Sites', value: totalSites,                color: 'var(--brand-green)' },
          { label: 'Combined Members',  value: '2.5M+',                   color: '#60a5fa' },
          { label: 'Free to Join',      value: `${totalSites - 2} sites`, color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Syne', color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, rgba(0,212,120,0.08), rgba(0,229,255,0.04))', border: '1px solid rgba(0,212,120,0.2)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--brand-green)' }}>
          <Zap size={11} className="inline mr-1" fill="currentColor" /> Pro Strategy
        </p>
        <div className="grid md:grid-cols-3 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>1. Join the free tiers first</p>Start with free memberships on each platform to test response rates before upgrading.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>2. Use your Traffic ROM link</p>Promote your Traffic ROM referral link on all these platforms to build your downline here too.</div>
          <div><p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>3. Upgrade top performers</p>Track which platforms send the most clicks via your Link Cloaker, then upgrade those first.</div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeCategory === cat ? (CATEGORY_COLORS[cat] || 'var(--brand-green)') + '20' : 'var(--bg-secondary)',
              color: activeCategory === cat ? (CATEGORY_COLORS[cat] || 'var(--brand-green)') : 'var(--text-muted)',
              border: '1px solid ' + (activeCategory === cat ? (CATEGORY_COLORS[cat] || 'var(--brand-green)') + '50' : 'var(--border)'),
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map(({ category, sites }) => {
          const color = CATEGORY_COLORS[category] || 'var(--brand-green)';
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: color + '15', color, border: '1px solid ' + color + '30' }}>
                  {category}
                </span>
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {sites.map(site => (
                  <div key={site.name} className="card p-4 transition-all"
                    onMouseEnter={e => e.currentTarget.style.borderColor = color + '50'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-bold text-sm" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{site.name}</p>
                        <StarRating rating={site.rating} />
                      </div>
                      <a href={site.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
                        style={{ background: color + '15', color, border: '1px solid ' + color + '30' }}>
                        Join Free <ExternalLink size={11} />
                      </a>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{site.desc}</p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Users size={10} /> {site.members}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={10} /> {site.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-5 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <p className="font-bold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>💡 Promote Traffic ROM on all these platforms</p>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          Use your personal referral link when signing up and mailing on these sites. Every member you refer to Traffic ROM earns you 50 bonus credits.
        </p>
        <a href="/dashboard/referrals" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--brand-green)' }}>
          Get your referral link <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default DownlineBuilder;
