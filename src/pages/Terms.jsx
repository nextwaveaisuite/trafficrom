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

const Terms = () => (
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
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Terms of Service</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: April 2026</p>
      <div className="card p-8">
        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Traffic ROM ("the Service"), operated by NextWave AI Suite, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          <p>These terms apply to all users of the Service, including members on free and paid plans.</p>
        </Section>
        <Section title="2. Description of Service">
          <p>Traffic ROM is a safelist email marketing platform that allows members to send promotional emails to other members who have opted in to receive such communications. The Service operates on a credit-based system where members earn credits by reading emails and spend credits to send campaigns.</p>
          <p>All email communications sent through Traffic ROM are delivered within the platform. Members read emails through the platform inbox, not their personal email address.</p>
        </Section>
        <Section title="3. Account Registration">
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
          <p>You must be at least 18 years of age to use this Service. By registering, you confirm that you meet this requirement.</p>
          <p>We reserve the right to suspend or terminate accounts that contain false information or violate these terms.</p>
        </Section>
        <Section title="4. Acceptable Use">
          <p>By using Traffic ROM, you agree NOT to:</p>
          <p>• Send spam, illegal content, or content that violates any applicable laws</p>
          <p>• Promote illegal products, services, scams, or fraudulent opportunities</p>
          <p>• Send adult content, hate speech, or content that discriminates against any group</p>
          <p>• Attempt to harvest personal data from other members</p>
          <p>• Use automated tools or bots to read emails or earn credits fraudulently</p>
          <p>• Impersonate any person or entity</p>
          <p>• Interfere with or disrupt the Service or its servers</p>
          <p>We reserve the right to remove any content and suspend any account that violates these guidelines without notice or refund.</p>
        </Section>
        <Section title="5. Credits and Payments">
          <p>Credits are the in-platform currency used to send email campaigns. Credits can be earned by reading other members' emails or purchased directly through the platform.</p>
          <p>Purchased credits are non-refundable once added to your account. Credits have no cash value and cannot be transferred or exchanged for money.</p>
          <p>Membership subscription fees are billed monthly or as a one-time lifetime payment as selected at checkout. Monthly subscriptions auto-renew until cancelled.</p>
          <p>All payments are processed securely by Stripe. We do not store your payment card details.</p>
        </Section>
        <Section title="6. Refund Policy">
          <p>Monthly subscriptions may be cancelled at any time through your account settings or the Stripe billing portal. Cancellation takes effect at the end of the current billing period. No partial refunds are provided for unused time.</p>
          <p>Lifetime memberships and credit purchases are non-refundable.</p>
          <p>If you believe you have been charged in error, contact us within 14 days at support@nextwaveaisuite.com.</p>
        </Section>
        <Section title="7. Intellectual Property">
          <p>The Traffic ROM platform, including its design, features, and content, is owned by NextWave AI Suite and protected by intellectual property laws.</p>
          <p>You retain ownership of the email content you create. By submitting content, you grant us a limited licence to display and deliver that content within the platform.</p>
        </Section>
        <Section title="8. Privacy">
          <p>Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our <Link to="/privacy" style={{ color: 'var(--brand-green)' }}>Privacy Policy</Link> to understand our practices.</p>
        </Section>
        <Section title="9. Disclaimers">
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee specific results from using the platform, including traffic volume, leads, or sales.</p>
          <p>We are not responsible for the content of emails sent by other members or for any losses resulting from reliance on such content.</p>
        </Section>
        <Section title="10. Limitation of Liability">
          <p>To the fullest extent permitted by law, NextWave AI Suite shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
          <p>Our total liability to you for any claim shall not exceed the amount you paid to us in the 12 months prior to the claim.</p>
        </Section>
        <Section title="11. Termination">
          <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, without notice or refund.</p>
          <p>You may delete your account at any time by contacting support@nextwaveaisuite.com. Account deletion is permanent and cannot be undone.</p>
        </Section>
        <Section title="12. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify members of material changes via the platform dashboard.</p>
        </Section>
        <Section title="13. Governing Law">
          <p>These Terms are governed by the laws of Australia. Any disputes shall be resolved in the courts of Australia.</p>
        </Section>
        <Section title="14. Contact">
          <p>Email: support@nextwaveaisuite.com</p>
          <p>Website: nextwaveaisuite.com</p>
        </Section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
