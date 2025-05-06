
    import {
        generateRecurringTransactions,
        parseDateString
    } from '@/lib/utils';
    import {
        calculateRunningBalance
    } from '@/lib/calculationHelpers';
    import {
        startOfDay,
        startOfMonth,
        endOfMonth,
        addDays,
        isBefore,
        getMonth,
        getYear,
        isValid
    } from 'date-fns';

    export const calculatePreviousMonthClosingBalance = (allPersistedTransactions, contextDate) => {
        const firstMomentOfCurrentMonth = startOfDay(startOfMonth(contextDate));
        let balance = 0;
        const endOfPreviousMonth = addDays(firstMomentOfCurrentMonth, -1);

        const allGeneratedTransactions = generateRecurringTransactions(
            allPersistedTransactions,
            endOfPreviousMonth,
            true // Include past transactions up to end of previous month
        );

        const transactionsBeforeCurrentMonth = allGeneratedTransactions.filter(t => {
            const transactionDate = parseDateString(t.date);
            return isValid(transactionDate) && isBefore(startOfDay(transactionDate), firstMomentOfCurrentMonth);
        });

        transactionsBeforeCurrentMonth.forEach(t => {
            balance += (t.type === 'income' ? t.amount : -t.amount);
        });

        return balance;
    };

    export const filterTransactionsForMonth = (allPersistedTransactions, contextDate) => {
        const potentialTransactions = generateRecurringTransactions(allPersistedTransactions, contextDate, false);
        const currentMonth = getMonth(contextDate);
        const currentYear = getYear(contextDate);

        return potentialTransactions.filter(t => {
            const transactionDate = parseDateString(t.date);
            return isValid(transactionDate) &&
                   getMonth(transactionDate) === currentMonth &&
                   getYear(transactionDate) === currentYear;
        });
    };


    export const calculateMonthlyBalanceSummary = (monthTransactions, previousMonthClosingBalance = 0) => {
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netChange = income - expense;
        const finalBalance = previousMonthClosingBalance + netChange;

        return { income, expense, balance: finalBalance, previousMonthClosingBalance, netChange };
    };

    export const calculateDailyBalanceDetails = (monthTransactions, contextDate, previousMonthClosingBalance = 0) => {
        return calculateRunningBalance(monthTransactions, startOfMonth(contextDate), previousMonthClosingBalance);
    };
  