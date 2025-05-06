
    import { supabase } from '@/lib/supabaseClient';
    // No need for getCurrentUserId here as RLS handles permissions based on the caller

    // --- Fetch Own User Profile ---
    // Used by AuthContext to get the logged-in user's details
    export const fetchUserProfile = async (userId) => {
         if (!userId) throw new Error("User ID is required to fetch profile.");
         try {
             const { data, error } = await supabase
                 .from('profiles')
                 .select('id, first_name, last_name, avatar_url, role, status')
                 .eq('id', userId)
                 .single();

             // Don't throw error if profile not found (PGRST116), just return null
             if (error && error.code !== 'PGRST116') {
                 throw error;
             }
             return data; // Returns null if not found, or the profile data
         } catch (error) {
             console.error('Error fetching user profile:', error);
             throw new Error('Erro ao buscar perfil do usuário.');
         }
     };


    // --- Admin: Fetch All Profiles ---
    // Requires admin role via RLS policy
    export const fetchAllProfiles = async () => {
        const { data, error } = await supabase
            .from('profiles')
            // Join with auth.users to get the email
            .select(`
                id,
                first_name,
                last_name,
                role,
                status,
                user:users ( email )
            `)
             .order('first_name', { ascending: true });

        if (error) {
            console.error("Error fetching all profiles (Admin):", error);
            throw new Error("Falha ao buscar perfis de usuário. Verifique suas permissões de admin.");
        }

        // Flatten the structure to include email directly
        return (data || []).map(profile => ({
             id: profile.id,
             first_name: profile.first_name,
             last_name: profile.last_name,
             role: profile.role,
             status: profile.status,
             email: profile.user?.email || 'Email não disponível' // Safely access nested email
        }));
    };

    // --- Admin: Update User Status ---
    // Requires admin role via RLS policy
    export const updateUserProfileStatus = async (profileId, newStatus) => {
        if (!profileId || !newStatus) {
            throw new Error("Profile ID and new status are required.");
        }
        if (!['active', 'blocked'].includes(newStatus)) {
             throw new Error("Status inválido. Use 'active' ou 'blocked'.");
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', profileId)
            .select('id, status') // Select the updated fields
            .single();

        if (error) {
            console.error("Error updating profile status (Admin):", error);
            throw new Error(`Falha ao atualizar status do perfil: ${error.message}`);
        }
        return data;
    };

    // --- Admin: Update User Role ---
    // Requires admin role via RLS policy
    export const updateUserProfileRole = async (profileId, newRole) => {
         if (!profileId || !newRole) {
             throw new Error("Profile ID and new role are required.");
         }
         if (!['admin', 'user'].includes(newRole)) {
              throw new Error("Papel inválido. Use 'admin' ou 'user'.");
         }

         const { data, error } = await supabase
             .from('profiles')
             .update({ role: newRole })
             .eq('id', profileId)
             .select('id, role') // Select the updated fields
             .single();

         if (error) {
             console.error("Error updating profile role (Admin):", error);
             throw new Error(`Falha ao atualizar o papel do perfil: ${error.message}`);
         }
         return data;
     };
  