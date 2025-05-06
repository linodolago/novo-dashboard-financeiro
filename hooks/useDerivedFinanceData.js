
    import React, { useMemo } from 'react';
    import {
        filterTransactionsForMonth,
        calculatePreviousMonthClosingBalance,
        calculateMonthlyBalanceSummary,
        calculateCategoryTotals,
        calculatePaymentMethodTotals,
        calculateDailyBalanceDetails,
        calculateFutureBalanceProjection,
        calculatePlanProjections,
        calculateAverageMonthlyExpense, // Import average expense calculation
        getFinancialSecurityInfo // Import security info calculation
    } from '@/lib/financeCalculations'; // Adjust imports if structure changed significantly
    import { endOfMonth } from 'date-fns';

    const initialPaymentMethods = [
        { id: 1, name: 'Dinheiro', color: '#22C55E' },
        { id: 2, name: 'Débito', color: '#06B6D4' },
        { id: 3, name: 'Cartão', color: '#F97316' },
        { id: 4, name: 'Pix', color: '#3B82F6' },
    ];

    function useCalculatedFinanceValues(
        persistedTransactions,
        categories,
        plans, // Use plans instead of financialGoal
        currentDate,
        isLoadingTransactions
    ) {
        const previousMonthClosingBalance = useMemo(() => {
            if (!isLoadingTransactions && persistedTransactions) {
                return calculatePreviousMonthClosingBalance(persistedTransactions, currentDate);
            }
            return 0;
        }, [persistedTransactions, isLoadingTransactions, currentDate]);

        const currentMonthTransactions = useMemo(() => {
            if (!isLoadingTransactions && persistedTransactions) {
                 // Renamed function
                return filterTransactionsForMonth(persistedTransactions, currentDate);
            }
            return [];
        }, [persistedTransactions, currentDate, isLoadingTransactions]);

        const monthlyBalance = useMemo(() => {
            // Renamed function
            return calculateMonthlyBalanceSummary(currentMonthTransactions, previousMonthClosingBalance);
        }, [currentMonthTransactions, previousMonthClosingBalance]);

        const dailyBalances = useMemo(() => {
             // Renamed function
            return calculateDailyBalanceDetails(currentMonthTransactions, currentDate, previousMonthClosingBalance);
        }, [currentMonthTransactions, currentDate, previousMonthClosingBalance]);

        const categoryTotals = useMemo(() => {
            return calculateCategoryTotals(currentMonthTransactions, categories);
        }, [currentMonthTransactions, categories]);

        const paymentMethodTotals = useMemo(() => {
            return calculatePaymentMethodTotals(currentMonthTransactions, initialPaymentMethods);
        }, [currentMonthTransactions]);

         const planProjections = useMemo(() => {
             if (!isLoadingTransactions && persistedTransactions && monthlyBalance) {
                 // Pass plans, transactions, current month's balance, and date
                 return calculatePlanProjections(plans, persistedTransactions, monthlyBalance.balance, currentDate);
             }
             return []; // Return empty array if loading or no data
         }, [plans, persistedTransactions, isLoadingTransactions, monthlyBalance, currentDate]);


        const negativeBalanceInfo = useMemo(() => {
            if (!isLoadingTransactions && persistedTransactions && monthlyBalance) {
                const startingBalanceForProjection = monthlyBalance.balance;
                // Project starting from the *end* of the current month
                const startDateForProjection = endOfMonth(currentDate);
                return calculateFutureBalanceProjection(persistedTransactions, startingBalanceForProjection, startDateForProjection);
            }
            return null;
        }, [persistedTransactions, isLoadingTransactions, monthlyBalance, currentDate]);

        // --- NEW: Financial Security Calculations ---
        const averageMonthlyExpense = useMemo(() => {
             if (!isLoadingTransactions && persistedTransactions) {
                // Calculate based on *all* transactions passed
                return calculateAverageMonthlyExpense(persistedTransactions);
            }
            return 0;
        }, [persistedTransactions, isLoadingTransactions]);

        const financialSecurityInfo = useMemo(() => {
             if (!isLoadingTransactions && monthlyBalance) {
                // Calculate based on the *current month's final balance* and the *average expense*
                return getFinancialSecurityInfo(monthlyBalance.balance, averageMonthlyExpense);
            }
            return getFinancialSecurityInfo(0, 0); // Default state while loading
        }, [monthlyBalance, averageMonthlyExpense, isLoadingTransactions]);
        // --- END: Financial Security Calculations ---


        return {
            previousMonthClosingBalance,
            currentMonthTransactions,
            monthlyBalance,
            dailyBalances,
            categoryTotals,
            paymentMethodTotals,
            planProjections,
            negativeBalanceInfo,
            averageMonthlyExpense, // Expose average expense
            financialSecurityInfo, // Expose security info
            paymentMethods: initialPaymentMethods,
        };
    }


    export function useDerivedFinanceData(
        persistedTransactions,
        categories,
        plans, // Accept plans
        currentDate,
        isLoadingTransactions
    ) {
        const derivedData = useCalculatedFinanceValues(
            persistedTransactions,
            categories,
            plans, // Pass plans
            currentDate,
            isLoadingTransactions
        );

        return derivedData;
    }
  