
    import React, { useState, useCallback, useEffect } from 'react';
    import { supabase, getUserId } from '@/lib/supabaseClient';
    import { useToast } from "@/components/ui/use-toast";
    import { formatISO, parseISO, isValid } from 'date-fns';

    // Helper to format date to YYYY-MM-DD, ensuring validity
    const formatDateSafe = (date) => {
        if (!date) return null;
        try {
            const parsed = parseISO(date);
            return isValid(parsed) ? formatISO(parsed, { representation: 'date' }) : null;
        } catch (e) {
            return null;
        }
    };

    // Helper to prepare data for Supabase insertion/update
    const preparePlanData = (data, userId) => {
        if (!userId) throw new Error("User ID is required.");
        return {
            user_id: userId,
            name: data.name,
            target_amount: parseFloat(data.target_amount) || 0,
            target_date: formatDateSafe(data.target_date),
        };
    };

    export function usePlans() {
        const [plans, setPlans] = useState([]);
        const { toast } = useToast();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [userId, setUserId] = useState(null);

        // Fetch user ID on mount
        useEffect(() => {
            const fetchUser = async () => {
                const id = await getUserId();
                setUserId(id);
                 if (!id) {
                    setLoading(false); // Stop loading if no user
                }
            };
            fetchUser();
        }, []);

        // Fetch plans when user ID is available
        const fetchPlans = useCallback(async () => {
            if (!userId) {
                setPlans([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await supabase
                    .from('plans')
                    .select('id, name, target_amount, target_date, created_at')
                    .eq('user_id', userId)
                    .order('target_date', { ascending: true });

                if (fetchError) throw fetchError;
                setPlans(data || []);
            } catch (err) {
                console.error("Failed to fetch plans:", err);
                setError("Falha ao buscar planos.");
                toast({ title: "Erro", description: "Não foi possível carregar os planos.", variant: "destructive" });
                setPlans([]);
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        // Initial fetch and refetch trigger
        useEffect(() => {
            fetchPlans();
        }, [fetchPlans]); // Re-run when fetchPlans (and thus userId) changes

        const addPlan = useCallback(async (data) => {
            if (!userId) {
                toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
                return null;
            }
            setLoading(true);
            setError(null);
            try {
                const preparedData = preparePlanData(data, userId);
                if (preparedData.target_amount <= 0) throw new Error("O valor alvo deve ser positivo.");
                if (!preparedData.target_date) throw new Error("A data alvo é inválida.");

                const { data: insertedData, error: insertError } = await supabase
                    .from('plans')
                    .insert(preparedData)
                    .select('id, name, target_amount, target_date, created_at')
                    .single();

                if (insertError) throw insertError;

                setPlans(prev => [...prev, insertedData].sort((a, b) => new Date(a.target_date) - new Date(b.target_date)));
                toast({ title: "Sucesso", description: "Plano adicionado." });
                return insertedData;
            } catch (err) {
                console.error("Failed to add plan:", err);
                setError(err.message || "Falha ao adicionar plano.");
                toast({ title: "Erro", description: err.message || "Não foi possível adicionar o plano.", variant: "destructive" });
                return null;
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        const updatePlan = useCallback(async (planId, data) => {
            if (!userId) {
                toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
                return null;
            }
            if (!planId) {
                 toast({ title: "Erro", description: "ID do plano ausente.", variant: "destructive" });
                 return null;
            }
            setLoading(true);
            setError(null);
            try {
                const preparedData = preparePlanData(data, userId);
                 if (preparedData.target_amount <= 0) throw new Error("O valor alvo deve ser positivo.");
                 if (!preparedData.target_date) throw new Error("A data alvo é inválida.");

                // Remove user_id for update payload
                delete preparedData.user_id;

                const { data: updatedData, error: updateError } = await supabase
                    .from('plans')
                    .update(preparedData)
                    .eq('id', planId)
                    .eq('user_id', userId)
                    .select('id, name, target_amount, target_date, created_at')
                    .single();

                if (updateError) throw updateError;

                setPlans(prev => prev.map(p => p.id === planId ? updatedData : p).sort((a, b) => new Date(a.target_date) - new Date(b.target_date)));
                toast({ title: "Sucesso", description: "Plano atualizado." });
                return updatedData;
            } catch (err) {
                console.error("Failed to update plan:", err);
                setError(err.message || "Falha ao atualizar plano.");
                toast({ title: "Erro", description: err.message || "Não foi possível atualizar o plano.", variant: "destructive" });
                return null;
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        const deletePlan = useCallback(async (planId) => {
            if (!userId) {
                toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
                return false;
            }
             if (!planId) {
                 toast({ title: "Erro", description: "ID do plano ausente.", variant: "destructive" });
                 return false;
            }
            setLoading(true);
            setError(null);
            try {
                const { error: deleteError } = await supabase
                    .from('plans')
                    .delete()
                    .eq('id', planId)
                    .eq('user_id', userId);

                if (deleteError) throw deleteError;

                setPlans(prev => prev.filter(p => p.id !== planId));
                toast({ title: "Sucesso", description: "Plano excluído." });
                return true;
            } catch (err) {
                console.error("Failed to delete plan:", err);
                setError("Falha ao excluir plano.");
                toast({ title: "Erro", description: "Não foi possível excluir o plano.", variant: "destructive" });
                return false;
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        const refetchPlans = useCallback(() => {
            fetchPlans();
        }, [fetchPlans]);

        return {
            plans,
            loading,
            error,
            addPlan,
            updatePlan,
            deletePlan,
            refetchPlans,
        };
    }
  