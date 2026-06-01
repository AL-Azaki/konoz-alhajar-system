import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DailyReportEntry } from './pages/DailyReportEntry';
import { ReportsList } from './pages/ReportsList';
import { Workers } from './pages/Workers';
import { Users } from './pages/Users';
import { Welcome } from './pages/Welcome';
import { Gallery } from './pages/Gallery';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Dashboard } from './pages/Dashboard';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { InventoryDispatch } from './pages/InventoryDispatch';
import { InventoryLedger } from './pages/InventoryLedger';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Wrench, Factory, Package, Clock, Wallet } from 'lucide-react';
import { WorkerProvider } from './context/WorkerContext';
import { ReportProvider } from './context/ReportContext';
import { InventoryProvider } from './context/InventoryContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkerProvider>
          <SettingsProvider>
            <ReportProvider>
              <InventoryProvider>
              <Toaster
                position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: 'Tajawal, sans-serif',
                  direction: 'rtl',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes inside AppLayout */}
              <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="daily-report" element={<ReportsList />} />
                <Route path="daily-report/new" element={<DailyReportEntry />} />
                <Route path="daily-report/edit/:id" element={<DailyReportEntry />} />
                <Route path="workers" element={<ProtectedRoute allowedRoles={['executive_manager', 'data_entry']}><Workers /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRoles={['executive_manager']}><Users /></ProtectedRoute>} />
                <Route path="maintenance" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><PlaceholderPage title="الصيانة" icon={Wrench} /></ProtectedRoute>} />
                <Route path="production" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><PlaceholderPage title="الإنتاج" icon={Factory} /></ProtectedRoute>} />
                <Route path="inventory" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><InventoryDashboard /></ProtectedRoute>} />
                <Route path="inventory/dispatch" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><InventoryDispatch /></ProtectedRoute>} />
                <Route path="inventory/ledger" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><InventoryLedger /></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><PlaceholderPage title="الحضور والغياب" icon={Clock} /></ProtectedRoute>} />
                <Route path="finance" element={<ProtectedRoute allowedRoles={['executive_manager', 'factory_admin']}><PlaceholderPage title="المالية والمصروفات" icon={Wallet} /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRoles={['executive_manager', 'data_entry', 'factory_admin']}><Settings /></ProtectedRoute>} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
              </InventoryProvider>
            </ReportProvider>
          </SettingsProvider>
        </WorkerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
