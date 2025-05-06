
    import React, { useState, useMemo, useCallback } from 'react';
    import { useTransactions } from '@/hooks/useTransactions';
    import { useCategories } from '@/hooks/useCategories';
    import { useGoal } from '@/hooks/useGoal';

    export function useAppContextState() {
        // --- Primary State ---
        const [currentDate, setCurrentDate] = useState(new Date());

        // --- Data Hooks ---
        const transactionsHook = useTransactions();
        const categoriesHook = useCategories();
        const goalHook = useGoal();

        // --- Combined Loading State ---
        const isLoading = useMemo(() =>
            transactionsHook.loading || categoriesHook.loading || goalHook.loading,
            [transactionsHook.loading, categoriesHook.loading, goalHook.loading]
        );

        // --- Initial Loading State ---
        // Considered initial load if transactions are loading and the array is currently empty
        const isInitiallyLoading = useMemo(() =>
            transactionsHook.loading && transactionsHook.transactions.length === 0,
            [transactionsHook.loading, transactionsHook.transactions.length]
        );

        // --- Combined Error State ---
        const error = useMemo(() =>
            transactionsHook.error || categoriesHook.error || goalHook.error,
            [transactionsHook.error, categoriesHook.error, goalHook.error]
        );

        // --- Refetch All Data Callback ---
        const refetchAllData = useCallback(async () => {
            // Reset error state before refetching
            transactionsHook.clearError();
            categoriesHook.clearError();
            goalHook.clearError();

            try {
                await Promise.all([
                    transactionsHook.refetchTransactions(),
                    categoriesHook.refetchCategories(),
                    goalHook.refetchGoal(),
                ]);
            } catch (err) {
                // Errors are typically handled within each hook's refetch logic now
                console.error("Error during refetchAllData:", err);
                // Optionally, set a general error state here if needed, though individual hooks might be sufficient
            }
        }, [transactionsHook, categoriesHook, goalHook]);


        return {
            // State
            currentDate,
            setCurrentDate,
            // Data Hooks (expose the full hooks for actions)
            transactionsHook,
            categoriesHook,
            goalHook,
            // Combined Status
            isLoading,
            isInitiallyLoading,
            error,
            refetchAllData,
        };
    }
  