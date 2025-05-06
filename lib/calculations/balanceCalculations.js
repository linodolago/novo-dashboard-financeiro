
    import {
        generateRecurringTransactions,
        parseDateString
    } from '@/lib/utils'; // Assuming utils handles date parsing and generation
    import {
        calculateRunningBalance
    } from '@/lib/calculations/helpers'; // Use the helper from the new location
    import {
        startOfDay,
        startOfMonth,
        endOfMonth,
        addDays,
        isBefore,
        getMonth,
        getYear,
        isValid,
        subMonths,
        differenceInCalendarMonths,
        endOfDay // Added missing import
    } from 'date-fns';

    export const calculatePreviousMonthClosingBalance = (allPersistedTransactions, contextDate) => {
        const firstMomentOfCurrentMonth = startOfDay(startOfMonth(contextDate));
        let balance = 0;
        const endOfPreviousMonth = endOfDay(addDays(firstMomentOfCurrentMonth, -1)); // Ensure it covers the whole last day

        // Determine the earliest transaction date to avoid unnecessary generation
        let earliestDate = null;
        allPersistedTransactions.forEach(t => {
            const dt = parseDateString(t.date);
            if (isValid(dt) && (!earliestDate || isBefore(dt, earliestDate))) {
                earliestDate = dt;
            }
            // Consider end_date for recurring transactions ending in the past
            if (t.end_date) {
                const endDt = parseDateString(t.end_date);
                 if (isValid(endDt) && (!earliestDate || isBefore(endDt, earliestDate))) {
                    earliestDate = endDt; // Should consider the start date instead? Logic might need review if this causes issues.
                 }
            }
        });


        // If there's no earliest date (no transactions), the balance is 0
        if (!earliestDate) {
            return 0;
        }

        // Generate transactions from the beginning up to the end of the previous month
        const allGeneratedTransactions = generateRecurringTransactions(
            allPersistedTransactions,
            endOfPreviousMonth, // Target date for generation
            true, // Include past instances
            earliestDate // Start generation from the earliest relevant date
        );


        // Filter only transactions *before* the start of the current month
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
        const potentialTransactions = generateRecurringTransactions(allPersistedTransactions, endOfMonth(contextDate), false);
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

    // Calculates the average monthly expense based on historical data
    export const calculateAverageMonthlyExpense = (allPersistedTransactions) => {
         const firstMomentEver = new Date(1970, 0, 1); // A very early date
         const today = new Date();
         const allPastExpenses = generateRecurringTransactions(
                allPersistedTransactions.filter(t => t.type === 'expense'),
                today,
                true, // Include all past instances
                firstMomentEver
            ).filter(t => {
                 const dt = parseDateString(t.date);
                 // Only expenses strictly before the start of the current month
                 return isValid(dt) && isBefore(startOfDay(dt), startOfMonth(today));
            });

         if (allPastExpenses.length === 0) {
            return 0;
         }

         const monthlyExpenses = {};
         let earliestMonth = null;
         let latestMonth = null;

         allPastExpenses.forEach(t => {
             const date = parseDateString(t.date);
             if (!isValid(date)) return;

             const monthKey = `${getYear(date)}-${getMonth(date)}`;
             monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + t.amount;

             const monthStart = startOfMonth(date);
             if (!earliestMonth || isBefore(monthStart, earliestMonth)) {
                 earliestMonth = monthStart;
             }
             // Use the date itself for latest month check, but store startOfMonth
             if (!latestMonth || isBefore(latestMonth, monthStart)) {
                 latestMonth = monthStart;
             }
         });

         // Ensure both dates are valid before calculating difference
         const numberOfMonths = earliestMonth && latestMonth
            ? differenceInCalendarMonths(latestMonth, earliestMonth) + 1 // Add 1 because difference counts transitions
            : 0; // If no valid months, count is 0


        // If number of months is still 0 (e.g., only one month of data), handle division by zero
         if (numberOfMonths <= 0) {
             // If there are expenses but month calculation failed, return the total sum as average for 1 month
             return Object.values(monthlyExpenses).reduce((sum, amount) => sum + amount, 0);
         }


         const totalExpense = Object.values(monthlyExpenses).reduce((sum, amount) => sum + amount, 0);

         return totalExpense / numberOfMonths;
     };
  