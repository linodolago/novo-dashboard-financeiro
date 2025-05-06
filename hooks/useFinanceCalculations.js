
    import { useMemo } from 'react';
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
        calculateFinancialSecurityCategory // Import security category calculation
    } from '@/lib/financeCalculations';
    import { endOfMonth } from 'date-fns';

    // Default payment methods (can be moved to constants file later)
    const initialPaymentMethods = [
        { id: 1, name: 'Dinheiro', color: '#22C55E' },
        { id: 2, name: 'Débito', color: '#06B6D4' },
        { id: 3, name: 'Cartão', color: '#F97316' },
        { id: 4, name: 'Pix', color: '#3B82F6' },
    ];

    export function useFinanceCalculations(
        persistedTransactions,
        categories,
        plans,
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
                return filterTransactionsForMonth(persistedTransactions, currentDate);
            }
            return [];
        }, [persistedTransactions, currentDate, isLoadingTransactions]);

        const monthlyBalance = useMemo(() => {
            return calculateMonthlyBalanceSummary(currentMonthTransactions, previousMonthClosingBalance);
        }, [currentMonthTransactions, previousMonthClosingBalance]);

        const dailyBalances = useMemo(() => {
            return calculateDailyBalanceDetails(currentMonthTransactions, currentDate, previousMonthClosingBalance);
        }, [currentMonthTransactions, currentDate, previousMonthClosingBalance]);

        const categoryTotals = useMemo(() => {
            return calculateCategoryTotals(currentMonthTransactions, categories);
        }, [currentMonthTransactions, categories]);

        const paymentMethodTotals = useMemo(() => {
            return calculatePaymentMethodTotals(currentMonthTransactions, initialPaymentMethods);
        }, [currentMonthTransactions]);

        const planProjections = useMemo(() => {
             if (!isLoadingTransactions && persistedTransactions && monthlyBalance && plans) {
                 return calculatePlanProjections(plans, persistedTransactions, monthlyBalance.balance, currentDate);
             }
             return [];
         }, [plans, persistedTransactions, isLoadingTransactions, monthlyBalance, currentDate]);

        const negativeBalanceInfo = useMemo(() => {
            if (!isLoadingTransactions && persistedTransactions && monthlyBalance) {
                const startingBalanceForProjection = monthlyBalance.balance;
                const startDateForProjection = endOfMonth(currentDate);
                return calculateFutureBalanceProjection(persistedTransactions, startingBalanceForProjection, startDateForProjection);
            }
            return null;
        }, [persistedTransactions, isLoadingTransactions, monthlyBalance, currentDate]);

        // --- NEW: Average Monthly Expense ---
        const averageMonthlyExpense = useMemo(() => {
             if (!isLoadingTransactions && persistedTransactions) {
                return calculateAverageMonthlyExpense(persistedTransactions);
             }
             return 0;
        }, [persistedTransactions, isLoadingTransactions]);

         // --- NEW: Financial Security Category ---
         const financialSecurity = useMemo(() => {
             // Ensure balance is available from monthlyBalance before calculating
             if (monthlyBalance && typeof monthlyBalance.balance === 'number') {
                return calculateFinancialSecurityCategory(monthlyBalance.balance, averageMonthlyExpense);
             }
             // Return a default or loading state if balance isn't ready
             return null; // Or some default category like { name: 'Calculando...', color: '#ccc' }
         }, [monthlyBalance, averageMonthlyExpense]);


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
            financialSecurity, // Expose security info
            paymentMethods: initialPaymentMethods,
        };
    }
  