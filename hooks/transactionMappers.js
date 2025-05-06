
    import { formatCurrency, parseDateString, formatInputDate } from '@/lib/utils';
    import { isValid } from 'date-fns';

    // Helper function to safely parse and format dates
    const safeFormatInputDate = (dateString) => {
        if (!dateString) return '';
        const parsed = parseDateString(dateString);
        return isValid(parsed) ? formatInputDate(parsed) : '';
    };

    // Helper function to safely parse amounts
    const safeParseFloat = (amount) => {
        const parsed = parseFloat(amount);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Maps raw income data from Supabase to the format used in the frontend state
    export const mapIncomeData = (dbRecord) => {
        const startDate = parseDateString(dbRecord.start_date);
        const endDate = dbRecord.end_date ? parseDateString(dbRecord.end_date) : null;

        return {
            id: dbRecord.id,
            type: 'income',
            description: dbRecord.name,
            amount: safeParseFloat(dbRecord.amount),
            frequency: dbRecord.periodicity || 'once',
            paymentMethod: dbRecord.payment_method || 'Entrada', // Default for income
            category: null, // Incomes don't have categories in this model
            date: isValid(startDate) ? formatInputDate(startDate) : formatInputDate(new Date()), // Corresponds to start_date for UI
            end_date: endDate && isValid(endDate) ? formatInputDate(endDate) : '', // end_date for UI
            formattedAmount: formatCurrency(safeParseFloat(dbRecord.amount)),
            originalData: dbRecord // Preserve the original raw record from DB
        };
    };

    // Maps raw expense data from Supabase to the format used in the frontend state
    export const mapExpenseData = (dbRecord) => {
        const startDate = parseDateString(dbRecord.start_date);
         const endDate = dbRecord.end_date ? parseDateString(dbRecord.end_date) : null;

        return {
            id: dbRecord.id,
            type: 'expense',
            description: dbRecord.name,
            amount: safeParseFloat(dbRecord.amount),
            frequency: dbRecord.periodicity || 'once',
            paymentMethod: dbRecord.payment_method || '',
            category: dbRecord.category || '',
            date: isValid(startDate) ? formatInputDate(startDate) : formatInputDate(new Date()), // Corresponds to start_date for UI
            end_date: endDate && isValid(endDate) ? formatInputDate(endDate) : '', // end_date for UI
            formattedAmount: formatCurrency(safeParseFloat(dbRecord.amount)),
            originalData: dbRecord // Preserve the original raw record from DB
        };
    };
  