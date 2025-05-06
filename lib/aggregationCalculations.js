
    import { calculateDaysRemaining } from '@/lib/utils';

    export const calculateCategoryTotals = (monthTransactions, categories) => {
        const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');
        const totals = new Map();
        categories.forEach(cat => totals.set(cat.name, { ...cat, count: 0, amount: 0 }));

        expenseTransactions.forEach(t => {
            if (t.category && totals.has(t.category)) {
                const current = totals.get(t.category);
                current.amount += t.amount;
                current.count += 1;
            }
        });
        return Array.from(totals.values()).filter(cat => cat.amount > 0);
    };

    export const calculatePaymentMethodTotals = (monthTransactions, paymentMethods) => {
         const totals = new Map();
         paymentMethods.forEach(method => totals.set(method.name, { ...method, count: 0, amount: 0 }));

         monthTransactions.forEach(t => {
             if (t.paymentMethod && totals.has(t.paymentMethod)) {
                 const current = totals.get(t.paymentMethod);
                 current.amount += t.amount;
                 current.count += 1;
             }
         });
         return Array.from(totals.values());
    };
  