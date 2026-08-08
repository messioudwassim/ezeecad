import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Chargement paresseux : chaque page n'est telechargee que quand elle est
// visitee, au lieu d'un seul bundle contenant tout le site des le premier
// affichage de la landing page.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardLayout = lazy(() => import('@/pages/DashboardLayout'));
const DashboardHome = lazy(() => import('@/pages/DashboardHome'));
const UploadModelPage = lazy(() => import('@/pages/UploadModelPage'));
const MyModelsPage = lazy(() => import('@/pages/MyModelsPage'));
const MyDownloadsPage = lazy(() => import('@/pages/MyDownloadsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DesignerRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || (profile?.role !== 'designer' && profile?.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/marketplace" element={<PublicLayout><MarketplacePage /></PublicLayout>} />
          <Route path="/marketplace/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/payment/return" element={<PublicLayout><PaymentReturnPage /></PublicLayout>} />
          <Route path="/cgv" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/confidentialite" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar />
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="upload" element={<DesignerRoute><UploadModelPage /></DesignerRoute>} />
            <Route path="my-models" element={<DesignerRoute><MyModelsPage /></DesignerRoute>} />
            <Route path="downloads" element={<MyDownloadsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;