import { ArrowRight, Zap, Bot, Mail, Trophy, Star, ExternalLink, ChevronRight } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'trafficrom',
    name: 'Traffic ROM',
    tagline: 'Real Opt-in Marketing',
    desc: 'The complete affiliate traffic platform. AI email writing, link cloaking, safelist marketing, banner ads and monthly leaderboard — all in one platform.',
    status: 'live',
    url: 'https://trafficrom.netlify.app',
    color: '#00d478',
    icon: Mail,
    features: ['AI Email Composer', 'Link Cloaker', 'Safelist Marketing', 'Banner Ads', 'Leaderboard'],
    price: 'From $7/month',
  },
  {
    id: 'agentrankos',
    name: 'Agent Rank OS',
    tagline: "World's First Dual-Mode AI Lead Generation Office",
    desc: '6 specialised AI agents find leads, write outreach and close deals automatically — running two revenue streams simultaneously while you sleep.',
    status: 'soon',
    url: 'https://agentrankos.com',
    color: '#60a5fa',
    icon: Bot,
    features: ['6 AI Agents', 'Automated Lead Gen', 'AI Outreach Writing', '$497-$1,997/mo Clients', 'Affiliate Traffic from $4/mo'],
    price: 'Coming Soon',
  },
];

const NextWaveHub = () => (
  <div style={{ background: '#0a0e1a', minHeight: '100vh' }}>

    <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e2840' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d478, #00e5ff)' }}>
          <Zap size={18} color="#0a0e1a" fill="#0a0e1a" />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>NextWave AI Suite</p>
          <p className="text-xs" style={{ color: '#8899bb' }}>nextwaveaisuite.com</p>
        </div>
      </div>
      <a href="https://trafficrom.netlify.app" target="_blank" rel="noopener noreferrer"
        className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.2)', color: '#00d478' }}>
        Go to Traffic ROM <ExternalLink size={11} />
      </a>
    </header>

    <section className="relative overflow-hidden px-6 pt-20 pb-20 text-center">
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-[150px]"
        style={{ background: 'linear-gradient(135deg, #00d478, #60a5fa)' }} />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', color: '#00d478' }}>
          <Zap size={11} fill="currentColor" /> AI-Powered Marketing Suite
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>
          The Next Wave of<br />
          <span style={{ background: 'linear-gradient(135deg, #00d478, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Marketing Tools
          </span>
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#8899bb', lineHeight: 1.7 }}>
          NextWave AI Suite builds affordable, powerful AI marketing tools for affiliate marketers and online entrepreneurs. Everything you need to grow — on autopilot.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://trafficrom.netlify.app/register" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-base"
            style={{ background: '#00d478', color: '#0a0e1a', fontFamily: 'Syne' }}>
            Start Free with Traffic ROM <ArrowRight size={16} />
          </a>
          <a href="https://agentrankos.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-base"
            style={{ background: 'transparent', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', fontFamily: 'Syne' }}>
            Explore Agent Rank OS
          </a>
        </div>
      </div>
    </section>

    <section className="px-6 pb-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Our Products</h2>
      <p className="text-center mb-10" style={{ color: '#8899bb' }}>Two powerful tools. One ecosystem. Total marketing automation.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {PRODUCTS.map(product => {
          const Icon = product.icon;
          return (
            <div key={product.id} className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: '#0f1525', border: '1px solid ' + product.color + '30' }}>
              <div className="absolute top-[-80px] right-[-80px] w-[200px] h-[200px] rounded-full blur-[80px] opacity-10"
                style={{ background: product.color }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: product.color + '20', border: '1px solid ' + product.color + '40' }}>
                    <Icon size={22} style={{ color: product.color }} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: product.status === 'live' ? 'rgba(0,212,120,0.15)' : 'rgba(96,165,250,0.15)', color: product.status === 'live' ? '#00d478' : '#60a5fa', border: '1px solid ' + (product.status === 'live' ? 'rgba(0,212,120,0.3)' : 'rgba(96,165,250,0.3)') }}>
                    {product.status === 'live' ? '● Live Now' : '● Coming Soon'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{product.name}</h3>
                <p className="text-sm font-semibold mb-3" style={{ color: product.color }}>{product.tagline}</p>
                <p className="text-sm mb-4" style={{ color: '#8899bb', lineHeight: 1.6 }}>{product.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {product.features.map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: product.color + '10', color: product.color, border: '1px solid ' + product.color + '25' }}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: '#f0f4ff' }}>{product.price}</p>
                  <a href={product.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: product.color, color: '#0a0e1a', fontFamily: 'Syne' }}>
                    {product.status === 'live' ? 'Get Started' : 'Learn More'} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="px-6 py-16" style={{ borderTop: '1px solid #1e2840', background: '#080c18' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Why NextWave AI Suite</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap,    title: 'AI at the Core',          desc: 'Every product is built with AI automation at its heart — not bolted on as an afterthought.' },
            { icon: Star,   title: 'Affordable for Everyone', desc: 'We price for real marketers, not enterprise budgets. Powerful tools from $7/month.' },
            { icon: Trophy, title: 'Built by Marketers',      desc: 'Every feature exists because we needed it ourselves. No bloat. No fluff. Just results.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl text-center" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(0,212,120,0.1)' }}>
                <Icon size={18} style={{ color: '#00d478' }} />
              </div>
              <p className="font-bold mb-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{title}</p>
              <p className="text-sm" style={{ color: '#8899bb' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 py-16 max-w-3xl mx-auto text-center">
      <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,212,120,0.08), rgba(96,165,250,0.04))', border: '1px solid rgba(0,212,120,0.15)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#00d478' }}>🔗 Coming Integration</p>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Agent Rank OS + Traffic ROM</h2>
        <p className="mb-6" style={{ color: '#8899bb', lineHeight: 1.7 }}>
          When Agent Rank OS launches fully, Traffic ROM members will get exclusive access to use its AI lead generation to drive targeted traffic directly to their campaigns — a complete autopilot traffic ecosystem.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="https://trafficrom.netlify.app/register" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: '#00d478', color: '#0a0e1a', fontFamily: 'Syne' }}>
            Join Traffic ROM Now <ArrowRight size={14} />
          </a>
          <a href="https://agentrankos.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: 'transparent', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
            Agent Rank OS <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>

    <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid #1e2840' }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#00d478' }}>
          <Zap size={14} color="#0a0e1a" fill="#0a0e1a" />
        </div>
        <span className="font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>NextWave AI Suite</span>
      </div>
      <p className="text-xs mb-3" style={{ color: '#8899bb' }}>AI-powered marketing tools for the next generation of online entrepreneurs.</p>
      <div className="flex gap-4 justify-center text-xs">
        <a href="https://trafficrom.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: '#00d478' }}>Traffic ROM</a>
        <a href="https://agentrankos.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Agent Rank OS</a>
      </div>
      <p className="text-xs mt-4" style={{ color: '#4a5568' }}>© 2026 NextWave AI Suite. All rights reserved.</p>
    </footer>
  </div>
);

export default NextWaveHub;
