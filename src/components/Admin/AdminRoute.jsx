import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: '#e11d48', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8899bb', fontFamily: 'DM Sans' }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!profile?.is_admin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminRoute;
