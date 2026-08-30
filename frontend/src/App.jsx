import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import MarketPage from './pages/MarketPage';
import TradeJournalPage from './pages/TradeJournalPage';
import PortfolioPage from './pages/PortfolioPage';
import TradingToolsPage from './pages/TradingToolsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminTradingActivityPage from './pages/admin/TradingActivityPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

import AdminAiPage from './pages/admin/AdminAiPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/market" 
            element={
              <ProtectedRoute>
                <MarketPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis" 
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journal" 
            element={
              <ProtectedRoute>
                <TradeJournalPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tools" 
            element={
              <ProtectedRoute>
                <TradingToolsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai" 
            element={
              <ProtectedRoute>
                <AiAssistantPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="trades" element={<AdminTradingActivityPage />} />
          {/* Placeholders for future pages */}
          <Route path="payments" element={<div className="p-8 text-zinc-400">Payments Page (Coming Soon)</div>} />
          <Route path="subscriptions" element={<div className="p-8 text-zinc-400">Subscriptions Page (Coming Soon)</div>} />
          <Route path="support" element={<div className="p-8 text-zinc-400">Support Management (Coming Soon)</div>} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="ai" element={<AdminAiPage />} />
          <Route path="logs" element={<div className="p-8 text-zinc-400">Security Logs (Coming Soon)</div>} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
