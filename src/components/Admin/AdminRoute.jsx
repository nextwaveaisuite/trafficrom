import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus('denied');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_owner')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_admin || profile?.is_owner) {
        setStatus('allowed');
      } else {
        setStatus('denied');
      }
    };

    check();
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#e11d48', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8899bb', fontFamily: 'DM Sans' }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminRoute;
