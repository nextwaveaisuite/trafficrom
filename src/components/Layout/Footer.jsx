import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
              <Zap size={16} color="#0a0e1a" fill="#0a0e1a" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Real Opt-in Marketing. Traffic that actually wants to hear from you — at a price that doesn't hurt.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Product</h4>
          <ul className="space-y-2">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <li key={to}><Link to={to} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Support</h4>
          <ul className="space-y-2">
            {[['Help Center', '#'], ['Contact Us', '#'], ['Status', '#']].map(([label, to]) => (
              <li key={label}><a href={to} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{label}</a></li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Legal</h4>
          <ul className="space-y-2">
            {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['Anti-Spam', '#']].map(([label, to]) => (
              <li key={label}><a href={to} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} NextWave AI Suite. All rights reserved.</p>
        <p className="text-xs mt-2 md:mt-0" style={{ color: 'var(--text-muted)' }}>Traffic ROM is a product of <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>NextWave AI Suite</span></p>
      </div>
    </div>
  </footer>
);

export default Footer;
