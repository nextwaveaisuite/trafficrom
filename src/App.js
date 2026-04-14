import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';

// Public pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Features from './pages/Features';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';
import EmailComposer from './components/Dashboard/EmailComposer';
import CampaignHistory from './components/Dashboard/CampaignHistory';
import CreditManager from './components/Dashboard/CreditManager';

// Dashboard layout wrapper
const DashboardLayout = ({ children }) => (
  <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <Sidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

// Placeholder pages for unfinished sections
const ComingSoon = ({ title }) => (
  <div className="p-6 max-w-2xl mx-auto">
    <div className="card p-10 text-center">
      <p className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{title}</p>
      <p style={{ color: 'var(--text-muted)' }}>This section is coming soon. Check back shortly!</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/compose" element={
            <ProtectedRoute>
              <DashboardLayout><EmailComposer /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/history" element={
            <ProtectedRoute>
              <DashboardLayout><CampaignHistory /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/credits" element={
            <ProtectedRoute>
              <DashboardLayout><CreditManager /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/referrals" element={
            <ProtectedRoute>
              <DashboardLayout><ComingSoon title="Referral Program" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/analytics" element={
            <ProtectedRoute>
              <DashboardLayout><ComingSoon title="Advanced Analytics" /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <DashboardLayout><ComingSoon title="Account Settings" /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
              <div className="text-center">
                <p className="text-6xl font-bold mb-3" style={{ fontFamily: 'Syne', color: 'var(--brand-green)' }}>404</p>
                <p className="text-xl mb-6" style={{ color: 'var(--text-primary)' }}>Page not found</p>
                <a href="/" className="btn-primary py-2 px-6">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
