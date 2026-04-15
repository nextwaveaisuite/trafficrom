import { Construction } from 'lucide-react';

const AdminPlaceholder = ({ title }) => (
  <div className="p-6 max-w-2xl mx-auto animate-fade-in">
    <div className="text-center p-12 rounded-xl" style={{ background: '#0f1525', border: '1px solid #1e2840' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(225,29,72,0.1)' }}>
        <Construction size={24} style={{ color: '#e11d48' }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne', color: '#f0f4ff' }}>{title}</h2>
      <p style={{ color: '#8899bb' }}>This admin section is coming soon. Core functionality is already wired up — this page just needs its UI built out.</p>
    </div>
  </div>
);

export default AdminPlaceholder;
