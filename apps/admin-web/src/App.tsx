import { Routes, Route, Navigate } from 'react-router-dom';
import { getStoredUser } from './services/api';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateShipmentPage from './pages/CreateShipmentPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ShipmentDetailPage from './pages/ShipmentDetailPage';
import ScanPage from './pages/ScanPage';
import BranchesPage from './pages/BranchesPage';
import UsersPage from './pages/UsersPage';
import TemplatesPage from './pages/TemplatesPage';
import ReportsPage from './pages/ReportsPage';
import { ToastProvider } from './components/Toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const user = getStoredUser();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="shipments/new" element={<CreateShipmentPage />} />
                    <Route path="shipments/:id" element={<ShipmentDetailPage />} />
                    <Route path="shipments" element={<ShipmentsPage />} />
                    <Route path="scan" element={<ScanPage />} />
                    <Route path="branches" element={<BranchesPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="print-templates" element={<TemplatesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}
