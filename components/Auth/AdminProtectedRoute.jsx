
    import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/context/AuthContext';
    import { Loader2, ShieldAlert } from 'lucide-react'; // Import ShieldAlert

    const AdminProtectedRoute = ({ children }) => {
        const { user, isAdmin, loading, profile } = useAuth();
        const location = useLocation();

        if (loading || (user && !profile && !loading)) { // Still loading auth OR user exists but profile hasn't loaded yet
            return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        }

        if (!user) {
            // Not logged in, redirect to login
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        if (!isAdmin) {
             // Logged in, but not an admin
             return (
                 <div className="flex flex-col justify-center items-center h-screen text-center p-4">
                     <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
                     <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
                     <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
                     <Navigate to="/" replace />; {/* Or link back to dashboard <Link to="/">Voltar ao Dashboard</Link> */}
                 </div>
             );
        }

        // User is logged in AND is an admin
        return children;
    };

    export default AdminProtectedRoute;
  