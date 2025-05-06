
    import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/context/AuthContext';
    import { Loader2 } from 'lucide-react';

    const ProtectedRoute = ({ children }) => {
        const { user, loading } = useAuth();
        const location = useLocation();

        if (loading) {
            // Show a loading indicator while checking auth state
            return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        }

        if (!user) {
            // User not logged in, redirect to login page, saving the current location
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // User is logged in, render the requested component
        return children;
    };

    export default ProtectedRoute;
  