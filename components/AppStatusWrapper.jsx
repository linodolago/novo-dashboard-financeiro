
    import React from 'react';
    import LoadingState from '@/components/ui/LoadingState';
    import ErrorState from '@/components/ui/ErrorState';
    import { Loader2 } from 'lucide-react';

    const AppStatusWrapper = ({
        isLoading,
        isInitiallyLoading,
        error,
        hasData,
        refetch,
        children
    }) => {
        // Show full-screen loader only during initial load
        if (isInitiallyLoading) {
            return <LoadingState message="Carregando seus dados financeiros iniciais..." />;
        }

        // Show full-screen error only if initial load failed and not currently loading again
        if (error && !hasData && !isLoading) {
             return <ErrorState error={error} refetch={refetch} />;
        }

        // Render children and show subtle loading indicator for background fetches
        return (
            <>
                {children}
                {isLoading && !isInitiallyLoading && (
                     <div className="fixed bottom-4 right-4 z-50 bg-background p-3 rounded-full shadow-lg border border-border animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                     </div>
                )}
            </>
        );
    };

    export default AppStatusWrapper;
  