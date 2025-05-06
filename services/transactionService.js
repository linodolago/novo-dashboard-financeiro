
    import { supabase } from '@/lib/supabaseClient';
    import { parseDateString, formatDateToDB } from '@/lib/utils';
    import { isValid } from 'date-fns';
    import { getCurrentUserId, fetchUserSupabaseData } from '@/services/supabaseHelpers';

    // --- Transaction Data Mapping ---
    const mapTransactionToDb = (transaction, userId) => {
        const isIncome = transaction.type === 'income';
        const payload = { user_id: userId };

        if (transaction.description !== undefined) payload.name = transaction.description;
        if (transaction.amount !== undefined) payload.amount = parseFloat(transaction.amount) || 0;
        if (transaction.frequency !== undefined) payload.periodicity = transaction.frequency;

        if (transaction.date !== undefined) {
             const transactionStartDate = parseDateString(transaction.date);
             payload.start_date = isValid(transactionStartDate) ? formatDateToDB(transactionStartDate) : formatDateToDB(new Date());
        }

        // Handle end_date carefully: allow null, otherwise format valid dates
        if (transaction.hasOwnProperty('end_date')) {
            if (transaction.end_date === null || transaction.end_date === '') {
                 payload.end_date = null;
            } else {
                const transactionEndDate = parseDateString(transaction.end_date);
                payload.end_date = isValid(transactionEndDate) ? formatDateToDB(transactionEndDate) : null;
            }
        }

        if (isIncome) {
            if (transaction.paymentMethod !== undefined) payload.payment_method = transaction.paymentMethod || 'Entrada';
        } else { // Expense
            if (transaction.category !== undefined) payload.category = transaction.category;
            if (transaction.paymentMethod !== undefined) payload.payment_method = transaction.paymentMethod;
        }

        return payload;
    }

    // --- Fetch User Transactions ---
    export const fetchTransactions = async () => {
        // Use the helper to fetch user-specific data
        const [incomesData, expensesData] = await Promise.all([
            fetchUserSupabaseData('incomes', 'id, name, amount, periodicity, payment_method, start_date, end_date'),
            fetchUserSupabaseData('expenses', 'id, name, amount, category, payment_method, periodicity, start_date, end_date'),
        ]);
        return { incomesData, expensesData };
    };

    // --- Insert Transaction ---
    export const insertTransaction = async (transaction) => {
        const userId = await getCurrentUserId();
        const isIncome = transaction.type === 'income';
        const tableName = isIncome ? 'incomes' : 'expenses';
        const payload = mapTransactionToDb(transaction, userId);

        // Basic Validation
        if (!payload.name || payload.amount === undefined || !payload.periodicity || !payload.start_date) {
             throw new Error("Campos obrigatórios ausentes para inserir transação.");
        }
        if (!isIncome && (!payload.category || !payload.payment_method)) {
             throw new Error("Categoria e forma de pagamento são obrigatórios para despesas.");
        }

        const { data, error } = await supabase
            .from(tableName)
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error(`Error inserting ${tableName}:`, error);
            throw new Error(`Falha ao salvar ${isIncome ? 'receita' : 'despesa'}. Detalhes: ${error.message}`);
        }
        return data;
    };

    // --- Update Transaction ---
    export const updateTransaction = async (transaction) => {
        const userId = await getCurrentUserId(); // Needed for mapping, RLS handles actual permission
        if (!transaction.id) throw new Error("ID da transação necessário para atualização.");

        const isIncome = transaction.type === 'income';
        const tableName = isIncome ? 'incomes' : 'expenses';
        const payload = mapTransactionToDb(transaction, userId);
        delete payload.user_id; // Don't try to update user_id

        // Prevent empty updates
        if (Object.keys(payload).length === 0) {
             console.warn("Nenhum campo fornecido para atualização da transação ID:", transaction.id);
             // Optionally fetch and return existing data if needed by the caller
             const { data: existingData, error: fetchError } = await supabase
                 .from(tableName)
                 .select()
                 .eq('id', transaction.id)
                 // RLS handles user check
                 .single();
             if (fetchError) throw new Error(`Falha ao buscar dados existentes para ${isIncome ? 'receita' : 'despesa'}.`);
             return existingData;
        }

        const { data, error } = await supabase
            .from(tableName)
            .update(payload)
            .eq('id', transaction.id)
            // RLS implicitly handles user_id check
            .select()
            .single();

        if (error) {
            console.error(`Error updating ${tableName}:`, error);
            throw new Error(`Falha ao atualizar ${isIncome ? 'receita' : 'despesa'}. Detalhes: ${error.message}`);
        }
        return data;
    };

    // --- Remove Transaction ---
    export const removeTransaction = async (id, type) => {
        await getCurrentUserId(); // Ensures user is authenticated before attempting delete
        const tableName = type === 'income' ? 'incomes' : 'expenses';

        // RLS policy on the table ensures the user can only delete their own records
        const { error } = await supabase.from(tableName).delete().match({ id: id });

        if (error) {
            console.error(`Error deleting ${tableName}:`, error);
            throw new Error(`Falha ao remover ${type === 'income' ? 'receita' : 'despesa'}.`);
        }
        // No data is returned on successful delete
    };
  