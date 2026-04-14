import { useState } from 'react';
import { Save, Shield, Globe, Coins, Mail, AlertTriangle } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
    <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1e2840' }}>
      <Icon size={16} style={{ color: '#e11d48' }} />
      <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{title}</h2>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899bb' }}>{label}</label>
    {children}
    {hint && <p className="text-xs mt-1" style={{ color: '#8899bb' }}>{hint}</p>}
  </div>
);

const AdminSettings = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Traffic ROM',
    tagline: 'Real Opt-in Marketing. Traffic that actually wants to hear from you.',
    supportEmail: 'support@nextwaveaisuite.com',
    freeEmailsPerWeek: 2,
    starterEmailsPerDay: 1,
    proEmailsPerDay: 3,
    freeMaxRecipients: 500,
    starterMaxRecipients: 2000,
    proMaxRecipients: 10000,
    creditsPerEmail: 10,
    signupBonus: 100,
    referralBonus: 50,
    starterPrice: 7,
    proPrice: 15,
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
  });

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // In production: save to Supabase platform_settings table
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = { background: '#151d30', border: '1px solid #1e2840', borderRadius: 8, padding: '8px 12px', color: '#f0f4ff', fontFamily: 'DM Sans', width: '100%', outline: 'none' };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>Platform Settings</h1>
          <p className="text-sm mt-1" style={{ color: '#8899bb' }}>Configure Traffic ROM platform-wide settings</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm" style={{ background: saved ? '#00d478' : '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
          <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <Section icon={Globe} title="Site Configuration">
        <Field label="Site Name">
          <input style={inputStyle} value={settings.siteName} onChange={e => handleChange('siteName', e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input style={inputStyle} value={settings.tagline} onChange={e => handleChange('tagline', e.target.value)} />
        </Field>
        <Field label="Support Email">
          <input style={inputStyle} type="email" value={settings.supportEmail} onChange={e => handleChange('supportEmail', e.target.value)} />
        </Field>
      </Section>

      <Section icon={Coins} title="Pricing & Plans">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starter Price ($/mo)">
            <input style={inputStyle} type="number" value={settings.starterPrice} onChange={e => handleChange('starterPrice', e.target.value)} />
          </Field>
          <Field label="Pro Price ($/mo)">
            <input style={inputStyle} type="number" value={settings.proPrice} onChange={e => handleChange('proPrice', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section icon={Mail} title="Email Limits">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Free (per week)">
            <input style={inputStyle} type="number" value={settings.freeEmailsPerWeek} onChange={e => handleChange('freeEmailsPerWeek', e.target.value)} />
          </Field>
          <Field label="Starter (per day)">
            <input style={inputStyle} type="number" value={settings.starterEmailsPerDay} onChange={e => handleChange('starterEmailsPerDay', e.target.value)} />
          </Field>
          <Field label="Pro (per day)">
            <input style={inputStyle} type="number" value={settings.proEmailsPerDay} onChange={e => handleChange('proEmailsPerDay', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Free Max Recipients">
            <input style={inputStyle} type="number" value={settings.freeMaxRecipients} onChange={e => handleChange('freeMaxRecipients', e.target.value)} />
          </Field>
          <Field label="Starter Max Recipients">
            <input style={inputStyle} type="number" value={settings.starterMaxRecipients} onChange={e => handleChange('starterMaxRecipients', e.target.value)} />
          </Field>
          <Field label="Pro Max Recipients">
            <input style={inputStyle} type="number" value={settings.proMaxRecipients} onChange={e => handleChange('proMaxRecipients', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section icon={Coins} title="Credits Configuration">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Credits per 100 recipients" hint="Cost to send to 100 people">
            <input style={inputStyle} type="number" value={settings.creditsPerEmail} onChange={e => handleChange('creditsPerEmail', e.target.value)} />
          </Field>
          <Field label="Signup Bonus Credits" hint="Given to new members">
            <input style={inputStyle} type="number" value={settings.signupBonus} onChange={e => handleChange('signupBonus', e.target.value)} />
          </Field>
          <Field label="Referral Bonus Credits" hint="Per successful referral">
            <input style={inputStyle} type="number" value={settings.referralBonus} onChange={e => handleChange('referralBonus', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section icon={Shield} title="Platform Controls">
        <div className="space-y-3">
          {[
            { key: 'maintenanceMode',   label: 'Maintenance Mode',   desc: 'Take the site offline for maintenance',     danger: true },
            { key: 'newRegistrations',  label: 'New Registrations',  desc: 'Allow new members to register',             danger: false },
            { key: 'emailNotifications',label: 'Email Notifications',desc: 'Send system emails to members',             danger: false },
          ].map(({ key, label, desc, danger }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#151d30', border: '1px solid #1e2840' }}>
              <div>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f0f4ff' }}>
                  {danger && <AlertTriangle size={13} style={{ color: '#fbbf24' }} />}
                  {label}
                </p>
                <p className="text-xs" style={{ color: '#8899bb' }}>{desc}</p>
              </div>
              <button
                onClick={() => handleChange(key, !settings[key])}
                className="w-11 h-6 rounded-full transition-all relative"
                style={{ background: settings[key] ? (danger ? '#fbbf24' : '#00d478') : '#1e2840' }}
              >
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: settings[key] ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold" style={{ background: saved ? '#00d478' : '#e11d48', color: '#fff', fontFamily: 'Syne' }}>
          <Save size={16} /> {saved ? '✓ Saved Successfully!' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
