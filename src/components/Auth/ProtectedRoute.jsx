import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Skeleton that mirrors the dashboard layout shape
const DashboardSkeleton = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
    {/* Sidebar skeleton */}
    <div style={{ width: 240, background: '#0f1525', borderRight: '1px solid #1e2840', padding: '20px 12px', flexShrink: 0 }}>
      <div style={{ height: 32, width: 160, background: '#1e2840', borderRadius: 8, marginBottom: 24 }} />
      <div style={{ height: 64, background: '#151d30', borderRadius: 10, marginBottom: 20 }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: 36, background: '#1e2840', borderRadius: 8, marginBottom: 6, opacity: 1 - i * 0.1 }} />
      ))}
    </div>
    {/* Main content skeleton */}
    <div style={{ flex: 1, padding: 24 }}>
      <div style={{ height: 28, width: 220, background: '#1e2840', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 16, width: 160, background: '#151d30', borderRadius: 4, marginBottom: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 96, background: '#0f1525', borderRadius: 12, border: '1px solid #1e2840' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ height: 120, background: '#0f1525', borderRadius: 12, border: '1px solid #1e2840' }} />
        ))}
      </div>
      <div style={{ height: 240, background: '#0f1525', borderRadius: 12, border: '1px solid #1e2840' }} />
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show skeleton layout instead of blank spinner
  // This renders immediately using cached auth state
  if (loading && !user) return <DashboardSkeleton />;

  // If loading but we have cached user — render children immediately
  // Auth will verify in background
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
