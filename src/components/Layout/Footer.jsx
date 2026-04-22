import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
              <Zap size={16} color="#0a0e1a" fill="#0a0e1a" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
            Real Opt-in Marketing. Traffic that actually wants to hear from you — at a price that doesn't hurt.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>A product of <Link to="/nextwaveaisuite" className="hover:opacity-80" style={{ color: 'var(--brand-green)', fontWeight: 600 }}>NextWave AI Suite</Link></p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Product</h4>
          <ul className="space-y-2">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['Founding Members', '/founding-members'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <li key={to}><Link to={to} className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Support</h4>
          <ul className="space-y-2">
            <li><Link to="/register" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Get Started Free</Link></li>
            <li><Link to="/login" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Member Login</Link></li>
            <li><a href="mailto:support@nextwaveaisuite.com" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Contact Support</a></li>
            <li><Link to="/nextwaveaisuite" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>NextWave AI Suite</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link></li>
            <li><a href="mailto:support@nextwaveaisuite.com" className="text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Anti-Spam Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} NextWave AI Suite. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Link to="/terms" className="text-xs hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          <Link to="/privacy" className="text-xs hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
          <a href="mailto:support@nextwaveaisuite.com" className="text-xs hover:opacity-80" style={{ color: 'var(--text-muted)' }}>support@nextwaveaisuite.com</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
