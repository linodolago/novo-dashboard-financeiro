
    import React from 'react';
    import { Loader2 } from 'lucide-react';
    import LoadingState from '@/components/ui/LoadingState';
    import ErrorState from '@/components/ui/ErrorState';

    const FinanceStateRenderer = ({ isLoading, isInitiallyLoading, error, refetchAllData, children }) => {
        // Show full-page loading state only on the very first load
        if (isInitiallyLoading) {
            return <LoadingState message="Carregando seus dados financeiros iniciais..."/>;
        }

        // Show full-page error state for critical errors (e.g., initial data load failure)
        if (error && !isLoading) {
            // Define what constitutes a critical error (customize as needed)
            const isCriticalError = error.message?.includes("transações") || error.message?.includes("categorias");
            if (isCriticalError) {
                 return <ErrorState error={error} refetch={refetchAllData} />;
            }
            // Non-critical errors (e.g., failed update) are likely handled by toasts via the hooks
        }

        // Render children and a subtle loading indicator for background updates
        return (
            <>
                {children}
                {/* Show subtle spinner for background loading (not initial load) */}
                {isLoading && !isInitiallyLoading && (
                    <div className="fixed bottom-4 right-4 z-50 bg-background p-3 rounded-full shadow-lg border border-border animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                )}
            </>
        );
    };

    export default FinanceStateRenderer;
  