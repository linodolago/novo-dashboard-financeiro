
    // Removed unused import: import { calculateDaysRemaining } from '@/lib/utils';

    export const calculateCategoryTotals = (monthTransactions, categories) => {
        const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');
        const totals = new Map();
        categories.forEach(cat => totals.set(cat.name, { ...cat, count: 0, amount: 0 }));

        expenseTransactions.forEach(t => {
            // Ensure category exists and is in the map
            if (t.category && totals.has(t.category)) {
                const current = totals.get(t.category);
                current.amount += t.amount;
                current.count += 1;
            }
            // Optional: Handle transactions with categories not in the initial list?
            // else if (t.category) { /* Create a new entry? */ }
        });
        // Filter out categories with zero amount before returning
        return Array.from(totals.values()).filter(cat => cat.amount > 0);
    };

    export const calculatePaymentMethodTotals = (monthTransactions, paymentMethods) => {
         const totals = new Map();
         paymentMethods.forEach(method => totals.set(method.name, { ...method, count: 0, amount: 0 }));

         monthTransactions.forEach(t => {
             // Ensure paymentMethod exists and is in the map
             if (t.paymentMethod && totals.has(t.paymentMethod)) {
                 const current = totals.get(t.paymentMethod);
                 current.amount += t.amount; // Keep track of amount per method if needed later
                 current.count += 1;
             }
              // Optional: Handle transactions with unknown payment methods?
             // else if (t.paymentMethod) { /* Create a new entry? */ }
         });
         // Return all payment methods, even if count is 0, for consistent chart rendering
         return Array.from(totals.values());
    };
  