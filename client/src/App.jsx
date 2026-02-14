import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/EventsPage';
import CalendarPage from './pages/CalendarPage';
import ClientsPage from './pages/ClientsPage';
import FinancePage from './pages/FinancePage';
import ReportsPage from './pages/ReportsPage';
import WorkflowPage from './pages/WorkflowPage';
import UsersPage from './pages/UsersPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-studio-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-studio-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="workflow" element={<WorkflowPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="addusers" element={<UsersPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1c2128',
                            color: '#e6edf3',
                            border: '1px solid #30363d',
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    );
}
