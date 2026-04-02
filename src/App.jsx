import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganizationDashboard from './pages/OrganizationDashboard';
import PersonalDashboard from './pages/PersonalDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import VendorsPage from './pages/VendorsPage';
import AIPlannerPage from './pages/AIPlannerPage';
import PaymentPage from './pages/PaymentPage';
import GuestManagementPage from './pages/GuestManagementPage';
import ServiceBookingPage from './pages/ServiceBookingPage';
import CalendarPage from './pages/CalendarPage';
import DocumentManagerPage from './pages/DocumentManagerPage';
import AgendaBuilderPage from './pages/AgendaBuilderPage';
import AttendancePage from './pages/AttendancePage';
import MessagingPage from './pages/MessagingPage';
import HotelRestaurantPage from './pages/HotelRestaurantPage';
import EventTemplatesPage from './pages/EventTemplatesPage';
import WishlistPage from './pages/WishlistPage';
import PromoCodesPage from './pages/PromoCodesPage';
import ReportExportPage from './pages/ReportExportPage';
import NotificationCenter from './pages/NotificationCenter';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

        <Route path="/dashboard/organization" element={<ProtectedRoute allowedRoles={['organizer']}><OrganizationDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/personal" element={<ProtectedRoute allowedRoles={['user']}><PersonalDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/events/:id/edit" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
        <Route path="/events/:id/documents" element={<ProtectedRoute><DocumentManagerPage /></ProtectedRoute>} />
        <Route path="/events/:id/agenda" element={<ProtectedRoute><AgendaBuilderPage /></ProtectedRoute>} />
        <Route path="/events/:id/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/events/:eventId/book" element={<ProtectedRoute><ServiceBookingPage /></ProtectedRoute>} />
        <Route path="/events/:eventId/guests" element={<ProtectedRoute><GuestManagementPage /></ProtectedRoute>} />

        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
        <Route path="/hotels-restaurants" element={<ProtectedRoute><HotelRestaurantPage /></ProtectedRoute>} />
        <Route path="/ai-planner" element={<ProtectedRoute><AIPlannerPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute><GuestManagementPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><EventTemplatesPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/promo-codes" element={<ProtectedRoute allowedRoles={['vendor']}><PromoCodesPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportExportPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;