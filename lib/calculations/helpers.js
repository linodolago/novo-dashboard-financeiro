
    import { startOfDay, endOfDay, parseISO, isValid, isWithinInterval as dateFnsIsWithinInterval, isAfter, isEqual } from 'date-fns';
    import { parseDateString } from '@/lib/utils'; // Assuming utils handles various date formats


    export const isAfterOrEqual = (date1, date2) => {
        const d1 = startOfDay(parseDateString(date1));
        const d2 = startOfDay(parseDateString(date2));
        return isValid(d1) && isValid(d2) && (isAfter(d1, d2) || isEqual(d1, d2));
    };

    export const isWithinInterval = (date, startDate, endDate) => {
        const d = startOfDay(parseDateString(date));
        const start = startOfDay(parseDateString(startDate));
        const end = endOfDay(parseDateString(endDate)); // Use endOfDay for inclusivity
        return isValid(d) && isValid(start) && isValid(end) && dateFnsIsWithinInterval(d, { start, end });
    };


    // This function remains crucial for daily balance calculation
    export const calculateRunningBalance = (transactions, monthStartDate, startingBalance) => {
      const dailyBalances = [];
      const daysInMonth = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 0).getDate();
      let currentBalance = startingBalance;
      let dailyExpenses = 0; // Track expenses for the specific day

      const sortedTransactions = transactions
          .map(t => ({ ...t, dateObj: parseDateString(t.date) })) // Parse date once
          .filter(t => isValid(t.dateObj)) // Ensure date is valid
          .sort((a, b) => a.dateObj - b.dateObj); // Sort by actual date object

      let transactionIndex = 0;

      for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), day);
          const currentDateStart = startOfDay(currentDate);
          dailyExpenses = 0; // Reset daily expenses

          // Process transactions for the current day
          while (transactionIndex < sortedTransactions.length &&
                 isValid(sortedTransactions[transactionIndex].dateObj) &&
                 startOfDay(sortedTransactions[transactionIndex].dateObj).getTime() === currentDateStart.getTime()) {
              const t = sortedTransactions[transactionIndex];
              const amountChange = t.type === 'income' ? t.amount : -t.amount;
              currentBalance += amountChange;
              if (t.type === 'expense') {
                  dailyExpenses += t.amount;
              }
              transactionIndex++;
          }

          dailyBalances.push({
              day: day,
              date: currentDate, // Store the full date object
              balance: currentBalance,
              expense: dailyExpenses // Add daily expense total
          });
      }
      return dailyBalances;
    };


    // Calculates net change for a *specific* set of transactions (typically one month)
    export const calculateNetChangeForMonth = (transactions) => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return income - expense;
    };
  