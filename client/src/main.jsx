import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // This might be replaced or integrated into AppLayout
import './index.css';

// New imports for routing
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard'; // Assuming this path
import LoginPage from './pages/LoginPage'; // Assuming this path
import EventsPage from './pages/EventsPage'; // Assuming this path
import CalendarPage from './pages/CalendarPage'; // Assuming this path
import ClientsPage from './pages/ClientsPage'; // Assuming this path
import FinancePage from './pages/FinancePage'; // Assuming this path
import ReportsPage from './pages/ReportsPage'; // Assuming this path
import WorkflowPage from './pages/WorkflowPage';
import UsersPage from './pages/UsersPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SupportPage from './pages/SupportPage';

import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/" /> : children;
};

// Router definition
const router = createBrowserRouter([
    {
        path: '/login',
        element: <PublicRoute><LoginPage /></PublicRoute>,
    },
    {
        path: '/',
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'events', element: <EventsPage /> },
            { path: 'calendar', element: <CalendarPage /> },
            { path: 'clients', element: <ClientsPage /> },
            { path: 'finance', element: <FinancePage /> },
            { path: 'workflow', element: <WorkflowPage /> },
            { path: 'reports', element: <ReportsPage /> },
            { path: 'users@2205', element: <UsersPage /> },
            { path: 'privacy', element: <PrivacyPage /> },
            { path: 'terms', element: <TermsPage /> },
            { path: 'support', element: <SupportPage /> },
        ],
    },
]);

// New imports for Auth and Toast
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <Toaster position="top-right" />
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>,
);
