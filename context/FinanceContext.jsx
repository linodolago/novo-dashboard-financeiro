
    import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
    import { supabase } from '@/lib/supabaseClient'; // Import supabase client
    import { useTransactions } from '@/hooks/useTransactions';
    import { useCategories } from '@/hooks/useCategories';
    import { usePlans } from '@/hooks/usePlans';
    import { useBanks } from '@/hooks/useBanks';
    import { useDerivedFinanceData } from '@/hooks/useDerivedFinanceData';
    import AppStatusWrapper from '@/components/AppStatusWrapper';
    import Auth from '@/components/Auth'; // Import the Auth component

    const FinanceContext = createContext(null);

    export const useFinance = () => {
        const context = useContext(FinanceContext);
        if (!context) {
            throw new Error('useFinance must be used within a FinanceProvider');
        }
        return context;
    };

    // --- Helper to combine loading/error states ---
    const useCombinedStatus = (...hooks) => {
        const isLoading = useMemo(() => hooks.some(hook => hook.loading), [hooks]);
        // Adjust initial loading check based on Supabase data potentially being empty initially
        const isInitiallyLoading = useMemo(() => hooks.some(hook => hook.loading && hook.transactions === undefined), [hooks]);
        const error = useMemo(() => hooks.reduce((acc, hook) => acc || hook.error, null), [hooks]);
        return { isLoading, isInitiallyLoading, error };
    };


    // --- Finance Provider Component ---
    export const FinanceProvider = ({ children }) => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [session, setSession] = useState(null); // Add state for Supabase session
        const [authLoading, setAuthLoading] = useState(true); // Loading state for auth check

        // --- Supabase Auth Listener ---
        useEffect(() => {
            setAuthLoading(true);
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                setAuthLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                // Optionally trigger data refetch on auth change
            });

            return () => subscription.unsubscribe();
        }, []);


        // --- Individual Data Hooks (Now depend on auth state) ---
        // These hooks now internally handle fetching based on user ID derived from the session
        const transactionsHook = useTransactions();
        const categoriesHook = useCategories();
        const plansHook = usePlans();
        const banksHook = useBanks();

        // --- Combine Loading and Error States ---
        const { isLoading, isInitiallyLoading, error } = useCombinedStatus(
            transactionsHook, categoriesHook, plansHook, banksHook
        );

        // --- Calculate Derived Data ---
        const derivedData = useDerivedFinanceData(
            transactionsHook.transactions,
            categoriesHook.categories,
            plansHook.plans,
            currentDate,
            transactionsHook.loading // Pass specific loading state if needed
        );

        // --- Refetch All Data Callback ---
        const refetchAllData = useCallback(async () => {
            // Check if user is authenticated before refetching
            if (!session?.user) return;
            try {
                // The individual refetch functions within hooks now handle user context
                await Promise.all([
                    transactionsHook.refetchTransactions(),
                    categoriesHook.refetchCategories(),
                    plansHook.refetchPlans(),
                    banksHook.refetchBanks(),
                ]);
            } catch (err) {
                console.error("Error during refetchAllData:", err);
            }
        }, [session, transactionsHook, categoriesHook, plansHook, banksHook]);

        // --- Context Value ---
        const value = useMemo(() => ({
            // Auth State
            session,
            authLoading,

            // Core State & Actions
            currentDate,
            setCurrentDate,
            ...transactionsHook,
            ...categoriesHook,
            ...plansHook,
            ...banksHook,

            // Combined Status
            loading: isLoading || authLoading, // Combine data loading and auth loading
            isInitiallyLoading: isInitiallyLoading || authLoading,
            error,
            refetchData: refetchAllData,

            // Derived Data
            ...derivedData,
            paymentMethods: derivedData.paymentMethods, // Keep fixed payment methods

        }), [
            session, authLoading, currentDate, isLoading, isInitiallyLoading, error, refetchAllData,
            transactionsHook, categoriesHook, plansHook, banksHook,
            derivedData,
        ]);

        // --- Render Logic ---
        // Show Auth component if not authenticated and auth check is complete
        if (!authLoading && !session) {
            return <Auth />;
        }

        // Show loading/error wrapper while auth is loading or data is loading/error
        return (
            <FinanceContext.Provider value={value}>
                <AppStatusWrapper
                    isLoading={isLoading || authLoading} // Show loading during auth check too
                    isInitiallyLoading={isInitiallyLoading || authLoading}
                    error={error}
                    // Adjust hasData check if needed based on initial Supabase state
                    hasData={!authLoading && (transactionsHook.transactions?.length > 0 || plansHook.plans?.length > 0)}
                    refetch={refetchAllData}
                >
                    {/* Render children only when authenticated and auth check is done */}
                    {!authLoading && session ? children : null}
                </AppStatusWrapper>
            </FinanceContext.Provider>
        );
    };
  