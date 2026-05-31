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
import { WorkerProvider } from './context/WorkerContext';
import { ReportProvider } from './context/ReportContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkerProvider>
          <ReportProvider>
            <Toaster 
              position="top-center"
              maxToasts={1}
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
                <Route index element={<Navigate to="daily-report" replace />} />
                <Route path="daily-report" element={<ReportsList />} />
                <Route path="daily-report/new" element={<DailyReportEntry />} />
                <Route path="daily-report/edit/:id" element={<DailyReportEntry />} />
                <Route path="workers" element={<ProtectedRoute allowedRoles={['executive_manager', 'data_entry']}><Workers /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRoles={['executive_manager']}><Users /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRoles={['executive_manager', 'data_entry', 'factory_admin']}><Settings /></ProtectedRoute>} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ReportProvider>
        </WorkerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
