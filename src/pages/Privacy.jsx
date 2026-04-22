import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</h2>
    <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-muted)' }}>{children}</div>
  </div>
);

const Privacy = () => (
  <div style={{ background: 'var(--bg-primary)' }}>
    <Header />
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-green)' }}>
          <Zap size={16} color="#0a0e1a" fill="#0a0e1a" />
        </div>
        <span className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Traffic ROM</span>
      </div>
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Privacy Policy</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: April 2026</p>
      <div className="card p-8">
        <Section title="1. Introduction">
          <p>NextWave AI Suite ("we", "us", "our") operates Traffic ROM ("the Service"). This Privacy Policy explains how we collect, use, and protect your personal information when you use the Service.</p>
          <p>By using Traffic ROM, you agree to the collection and use of information in accordance with this policy.</p>
        </Section>
        <Section title="2. Information We Collect">
          <p><strong style={{ color: 'var(--text-primary)' }}>Account Information:</strong> When you register, we collect your first name, last name, email address, and username.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong> We collect information about how you use the platform, including emails sent, credits earned, campaigns created, links clicked, and login times.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Payment Information:</strong> Payments are processed by Stripe. We store only a reference to your Stripe customer ID — we never see or store your full card details.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Link Cloaker Data:</strong> When you create cloaked links, we store the destination URL, slug, and click tracking data including timestamps and referring URLs.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Communications:</strong> Email campaigns you create and send within the platform are stored in our database.</p>
        </Section>
        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <p>• Provide, operate and maintain the Service</p>
          <p>• Process payments and manage your subscription</p>
          <p>• Display your campaigns to other members in the platform inbox</p>
          <p>• Calculate and award credits for reading emails</p>
          <p>• Display leaderboard rankings</p>
          <p>• Send platform announcements and important account notices</p>
          <p>• Prevent fraud and enforce our Terms of Service</p>
          <p>• Improve and develop new features</p>
          <p>We do not sell your personal information to third parties. Ever.</p>
        </Section>
        <Section title="4. Data Sharing">
          <p><strong style={{ color: 'var(--text-primary)' }}>Supabase:</strong> Our database and authentication provider. Data is stored on secure servers.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Stripe:</strong> Our payment processor. They handle all card data under their own privacy policy.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Anthropic:</strong> The AI email composer sends your selected niche and tone to generate email content. No personal data is sent.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>Netlify:</strong> Our hosting provider. Server logs may include IP addresses for security purposes.</p>
          <p>Your username and first name may be visible to other platform members on the leaderboard and in campaigns you send.</p>
        </Section>
        <Section title="5. Data Retention">
          <p>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it (such as payment records for tax purposes, which we retain for 7 years).</p>
        </Section>
        <Section title="6. Your Rights">
          <p>• <strong style={{ color: 'var(--text-primary)' }}>Access:</strong> Request a copy of the personal data we hold about you</p>
          <p>• <strong style={{ color: 'var(--text-primary)' }}>Correction:</strong> Update inaccurate personal data via your account settings</p>
          <p>• <strong style={{ color: 'var(--text-primary)' }}>Deletion:</strong> Request deletion of your account and associated data</p>
          <p>• <strong style={{ color: 'var(--text-primary)' }}>Portability:</strong> Request your data in a portable format</p>
          <p>• <strong style={{ color: 'var(--text-primary)' }}>Objection:</strong> Object to processing of your data in certain circumstances</p>
          <p>To exercise any of these rights, contact us at support@nextwaveaisuite.com.</p>
        </Section>
        <Section title="7. Cookies">
          <p>We use essential cookies and browser local storage to keep you logged in and remember your preferences. We do not use advertising or tracking cookies.</p>
        </Section>
        <Section title="8. Security">
          <p>We implement industry-standard security measures including encrypted connections (HTTPS), secure authentication via Supabase, and row-level security on our database.</p>
        </Section>
        <Section title="9. Children's Privacy">
          <p>Traffic ROM is not intended for users under the age of 18. We do not knowingly collect personal information from children.</p>
        </Section>
        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via the platform dashboard.</p>
        </Section>
        <Section title="11. Contact Us">
          <p>Email: support@nextwaveaisuite.com</p>
          <p>Website: nextwaveaisuite.com</p>
          <p>We aim to respond to all privacy inquiries within 5 business days.</p>
        </Section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
