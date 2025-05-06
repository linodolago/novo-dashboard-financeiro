
    import { supabase } from '@/lib/supabaseClient';
    import { parseDateString, formatDateToDB } from '@/lib/utils';
    import { getCurrentUserId, fetchSingleUserSupabaseRecord } from '@/services/supabaseHelpers';

    // --- Fetch User Goal ---
    export const fetchGoal = async () => {
        // Use the helper to fetch the user's single goal record
        return fetchSingleUserSupabaseRecord('financial_goals', 'id, current_amount, target_amount, target_date');
    };

    // --- Insert or Update Goal ---
    export const modifyGoal = async (goal, goalId) => {
        const userId = await getCurrentUserId();
        const formattedTargetDate = goal.targetDate ? formatDateToDB(parseDateString(goal.targetDate)) : null;

        const payload = {
            current_amount: parseFloat(goal.current) || 0,
            target_amount: parseFloat(goal.target) || 1, // Ensure target is at least 1 to avoid division by zero issues
            target_date: formattedTargetDate,
            user_id: userId, // Associate goal with the user
        };

        // Basic validation
        if (payload.target_amount <= 0) {
            throw new Error("O valor alvo da meta deve ser maior que zero.");
        }
        if (payload.current_amount < 0) {
             payload.current_amount = 0; // Don't allow negative current amount
        }

        let query;
        if (goalId) {
            // Update existing goal - RLS ensures user owns it
            query = supabase.from('financial_goals').update(payload).eq('id', goalId);
        } else {
            // Insert new goal
            query = supabase.from('financial_goals').insert(payload);
        }

        // Perform the operation and select the result
        const { data, error } = await query.select().single();

        if (error) {
            console.error(`Error ${goalId ? 'updating' : 'inserting'} goal:`, error);
            throw new Error(`Falha ao ${goalId ? 'atualizar' : 'definir'} meta. Detalhes: ${error.message}`);
        }
        return data;
    };
  