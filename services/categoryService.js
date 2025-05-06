
    import { supabase } from '@/lib/supabaseClient';
    import { getRandomColor } from '@/lib/utils';
    import { getCurrentUserId, fetchUserSupabaseData } from '@/services/supabaseHelpers';

    // --- Fetch User Categories ---
    export const fetchCategories = async () => {
        // Use the helper to fetch user-specific categories
        return fetchUserSupabaseData('categories', 'id, name, color, user_id');
    };

    // --- Insert Category ---
    export const insertCategory = async (category) => {
        const userId = await getCurrentUserId();
        const newCategoryData = {
            name: category.name,
            color: category.color || getRandomColor(),
            user_id: userId, // Assign category to the current user
        };

        // Basic validation
        if (!newCategoryData.name) {
            throw new Error("O nome da categoria é obrigatório.");
        }

        const { data, error } = await supabase
            .from('categories')
            .insert(newCategoryData)
            .select()
            .single();

        if (error) {
            console.error("Error adding category:", error);
            // Provide more specific feedback if possible (e.g., unique constraint violation)
            if (error.code === '23505') { // unique_violation
                 throw new Error(`A categoria "${newCategoryData.name}" já existe.`);
            }
            throw new Error(`Falha ao salvar categoria. Detalhes: ${error.message}`);
        }
        return data;
    };
  