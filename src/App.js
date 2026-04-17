import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Admin/AdminRoute';
import Sidebar from './components/Layout/Sidebar';
import AdminSidebar from './components/Admin/AdminSidebar';

const FoundingMembers    = lazy(() => import('./pages/FoundingMembers'));
const Home               = lazy(() => import('./pages/Home'));
const Pricing            = lazy(() => import('./pages/Pricing'));
const Features           = lazy(() => import('./pages/Features'));
const Login              = lazy(() => import('./components/Auth/Login'));
const Register           = lazy(() => import('./components/Auth/Register'));

const Dashboard          = lazy(() => import('./components/Dashboard/Dashboard'));
const BannerAds          = lazy(() => import('./components/Dashboard/BannerAds'));
const Leaderboard        = lazy(() => import('./components/Dashboard/Leaderboard'));
const Referrals          = lazy(() => import('./components/Dashboard/Referrals'));
const Analytics          = lazy(() => import('./components/Dashboard/Analytics'));
const AccountSettings    = lazy(() => import('./components/Dashboard/AccountSettings'));
const EmailComposer      = lazy(() => import('./components/Dashboard/EmailComposer'));
const EmailInbox         = lazy(() => import('./components/Dashboard/EmailInbox'));
const CampaignHistory    = lazy(() => import('./components/Dashboard/CampaignHistory'));
const CreditManager      = lazy(() => import('./components/Dashboard/CreditManager'));

const AdminLogin         = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminOverview      = lazy(() => import('./pages/Admin/AdminOverview'));
const AdminMembers       = lazy(() => import('./pages/Admin/AdminMembers'));
const AdminCampaigns     = lazy(() => import('./pages/Admin/AdminCampaigns'));
const AdminPromoCodes    = lazy(() => import('./pages/Admin/AdminPromoCodes'));
const AdminPromoSchedule = lazy(() => import('./pages/Admin/AdminPromoSchedule'));
const AdminBanners       = lazy(() => import('./pages/Admin/AdminBanners'));
const AdminLeaderboard   = lazy(() => import('./pages/Admin/AdminLeaderboard'));
const AdminSettings      = lazy(() => import('./pages/Admin/AdminSettings'));
const AdminPlaceholder   = lazy(() => import('./pages/Admin/AdminPlaceholder'));

const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #00d478', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: '#8899bb', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Loading...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <Sidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="flex" style={{ minHeight: '100vh', background: '#0a0e1a' }}>
    <AdminSidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"                 element={<Home />} />
            <Route path="/founding-members" element={<FoundingMembers />} />
            <Route path="/pricing"          element={<Pricing />} />
            <Route path="/features"         element={<Features />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/register"         element={<Register />} />

            {/* Member Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/compose" element={
              <ProtectedRoute><DashboardLayout><EmailComposer /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/inbox" element={
              <ProtectedRoute><DashboardLayout><EmailInbox /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/history" element={
              <ProtectedRoute><DashboardLayout><CampaignHistory /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/credits" element={
              <ProtectedRoute><DashboardLayout><CreditManager /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/banners" element={
              <ProtectedRoute><DashboardLayout><BannerAds /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/leaderboard" element={
              <ProtectedRoute><DashboardLayout><Leaderboard /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/referrals" element={
              <ProtectedRoute><DashboardLayout><Referrals /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute><DashboardLayout><AccountSettings /></DashboardLayout></ProtectedRoute>
            } />

            {/* Admin Console */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute><AdminLayout><AdminOverview /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/members" element={
              <AdminRoute><AdminLayout><AdminMembers /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/campaigns" element={
              <AdminRoute><AdminLayout><AdminCampaigns /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/credits" element={
              <AdminRoute><AdminLayout><AdminPlaceholder title="Credits Management" /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/promocodes" element={
              <AdminRoute><AdminLayout><AdminPromoCodes /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/promoscheduler" element={
              <AdminRoute><AdminLayout><AdminPromoSchedule /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/banners" element={
              <AdminRoute><AdminLayout><AdminBanners /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/leaderboard" element={
              <AdminRoute><AdminLayout><AdminLeaderboard /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/revenue" element={
              <AdminRoute><AdminLayout><AdminPlaceholder title="Revenue & Payments" /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminRoute><AdminLayout><AdminPlaceholder title="Platform Analytics" /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/reports" element={
              <AdminRoute><AdminLayout><AdminPlaceholder title="Reports & Flags" /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/broadcasts" element={
              <AdminRoute><AdminLayout><AdminPlaceholder title="Member Broadcasts" /></AdminLayout></AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
