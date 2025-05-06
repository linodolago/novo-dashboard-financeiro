
    import React, { useMemo, useCallback } from 'react';
    import { useTransactions } from '@/hooks/useTransactions';
    import { useCategories } from '@/hooks/useCategories';
    import { useGoal } from '@/hooks/useGoal';
    import { useDerivedFinanceData } from '@/hooks/useDerivedFinanceData';
    import useAggregateState from '@/hooks/useAggregateState';

    export function useFinanceContextValue(currentDate, setCurrentDate) {
        // --- Custom Hooks ---
        const transactionsHook = useTransactions();
        const categoriesHook = useCategories();
        const goalHook = useGoal();

        // --- Aggregated State ---
        const { isLoading, isInitiallyLoading, error } = useAggregateState([
            transactionsHook,
            categoriesHook,
            goalHook,
        ]);

        // --- Derived Data ---
        const derivedData = useDerivedFinanceData(
            transactionsHook.transactions,
            categoriesHook.categories,
            goalHook.financialGoal,
            currentDate,
            transactionsHook.loading
        );

        // --- Refetch All ---
        const refetchAllData = useCallback(async () => {
            try {
                await Promise.all([
                    transactionsHook.refetchTransactions(),
                    categoriesHook.refetchCategories(),
                    goalHook.refetchGoal(),
                ]);
            } catch (err) {
                console.error("Error during refetchAllData:", err);
            }
        }, [transactionsHook, categoriesHook, goalHook]);

        // --- Memoized Context Value ---
        const value = useMemo(() => ({
            // Date
            currentDate,
            setCurrentDate,

            // Raw Data & Actions
            persistedTransactions: transactionsHook.transactions,
            categories: categoriesHook.categories,
            financialGoal: goalHook.financialGoal,
            addTransaction: transactionsHook.addTransaction,
            deleteTransaction: transactionsHook.deleteTransaction,
            updateTransaction: transactionsHook.updateTransaction,
            updateRecurringValueFromDate: transactionsHook.updateRecurringValueFromDate,
            addCategory: categoriesHook.addCategory,
            updateGoal: goalHook.updateGoal,

            // Aggregated State
            loading: isLoading,
            isInitiallyLoading: isInitiallyLoading,
            error: error,
            refetchData: refetchAllData,

            // Derived Data
            ...derivedData,

        }), [
            currentDate, setCurrentDate, isLoading, isInitiallyLoading, error, refetchAllData,
            transactionsHook, categoriesHook, goalHook, derivedData,
        ]);

        return {
            value,
            isLoading,
            isInitiallyLoading,
            error,
            refetchAllData
        };
    }
  