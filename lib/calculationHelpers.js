
    import {
        isValid,
        startOfDay,
        endOfMonth,
        startOfMonth,
        getMonth,
        getYear,
        getDate,
        isBefore,
        isAfter,
        isEqual,
        addDays,
        eachDayOfInterval
    } from 'date-fns';
    import { parseDateString } from '@/lib/utils';

    export const isAfterOrEqual = (date1, date2) => {
        if (!isValid(date1) || !isValid(date2)) return false;
        return isAfter(date1, date2) || isEqual(date1, date2);
    };

    export const isWithinInterval = (date, interval) => {
        if (!date || !interval || !interval.start || !interval.end || !isValid(date) || !isValid(interval.start) || !isValid(interval.end)) return false;
        return isAfterOrEqual(date, interval.start) && (isBefore(date, interval.end) || isEqual(date, interval.end));
    };

    export const calculateRunningBalance = (transactions, startDate, startBalance) => {
        const dailyMap = new Map();
        const daysInPeriod = eachDayOfInterval({ start: startDate, end: endOfMonth(startDate) });

        daysInPeriod.forEach(day => {
            dailyMap.set(getDate(day), { date: day, income: 0, expense: 0 });
        });

        transactions.forEach(t => {
            const tDate = parseDateString(t.date);
            if (isValid(tDate) && getMonth(tDate) === getMonth(startDate) && getYear(tDate) === getYear(startDate)) {
                const dayOfMonth = getDate(tDate);
                if (dailyMap.has(dayOfMonth)) {
                    const dayData = dailyMap.get(dayOfMonth);
                    dayData.income += (t.type === 'income' ? t.amount : 0);
                    dayData.expense += (t.type === 'expense' ? t.amount : 0);
                }
            }
        });

        let runningBalance = startBalance;
        const balances = [];
        daysInPeriod.forEach(day => {
             const dayOfMonth = getDate(day);
             const dayData = dailyMap.get(dayOfMonth);
             if (dayData) {
                runningBalance += dayData.income - dayData.expense;
                balances.push({
                    date: day,
                    balance: runningBalance,
                    income: dayData.income,
                    expense: dayData.expense,
                    day: dayOfMonth
                });
            }
        });
        return balances;
    };

    export const calculateNetChangeForMonth = (transactions, date) => {
         const month = getMonth(date);
         const year = getYear(date);
         let income = 0;
         let expense = 0;

         transactions.forEach(t => {
             const tDate = parseDateString(t.date);
             if (isValid(tDate) && getMonth(tDate) === month && getYear(tDate) === year) {
                 if (t.type === 'income') income += t.amount;
                 else expense += t.amount;
             }
         });
         return income - expense;
     };
  