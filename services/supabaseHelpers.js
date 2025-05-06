
    import { supabase } from '@/lib/supabaseClient';

    // --- Helper: Get Current User ID ---
    export const getCurrentUserId = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error getting session:", error);
            throw new Error("Não foi possível obter a sessão do usuário.");
        }
        if (!session?.user) {
            // This case should ideally be handled by ProtectedRoute, but good to have a check
            console.warn("Attempted action without authenticated user.");
            throw new Error("Usuário não autenticado.");
        }
        return session.user.id;
    };

    // --- Helper for fetching multiple records (user-specific) ---
    export async function fetchUserSupabaseData(tableName, columns) {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
            .from(tableName)
            .select(columns)
            .eq('user_id', userId);

        if (error) {
            console.error(`Error fetching user ${tableName}:`, error);
            throw new Error(`Falha ao buscar seus ${tableName}.`);
        }
        return data || [];
    }

    // --- Helper for fetching a single record (user-specific) ---
    export async function fetchSingleUserSupabaseRecord(tableName, columns) {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
            .from(tableName)
            .select(columns)
            .eq('user_id', userId)
            .limit(1)
            .single();

        // Ignore 'not found' error (PGRST116), return null in that case
        if (error && error.code !== 'PGRST116') {
            console.error(`Error fetching single user ${tableName}:`, error);
            throw new Error(`Falha ao buscar seu ${tableName}.`);
        }
        return data; // Can be null if not found
    }
  