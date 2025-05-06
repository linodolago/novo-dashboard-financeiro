
    import React, { useState, useCallback, useEffect, useMemo } from 'react';
    import { supabase, getUserId } from '@/lib/supabaseClient';
    import { useToast } from "@/components/ui/use-toast";

    // Default categories (can be added for new users if their list is empty)
    const DEFAULT_EXPENSE_CATEGORIES = [
        { name: 'Alimentação', color: '#F97316', type: 'expense' },
        { name: 'Transporte', color: '#06B6D4', type: 'expense' },
        { name: 'Moradia', color: '#EF4444', type: 'expense' },
        { name: 'Lazer', color: '#8B5CF6', type: 'expense' },
        { name: 'Saúde', color: '#10B981', type: 'expense' },
        { name: 'Educação', color: '#3B82F6', type: 'expense' },
        { name: 'Outros', color: '#6B7280', type: 'expense' },
    ];
    const DEFAULT_INCOME_CATEGORIES = [
        { name: 'Salário', color: '#22C55E', type: 'income' },
        { name: 'Freelance', color: '#EAB308', type: 'income' },
        { name: 'Investimentos', color: '#A855F7', type: 'income' },
        { name: 'Outros', color: '#6B7280', type: 'income' },
    ];

    export function useCategories() {
        const [userCategories, setUserCategories] = useState([]);
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

        // Fetch categories when user ID is available
        const fetchCategories = useCallback(async () => {
            if (!userId) {
                setUserCategories([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('id, name, color, type')
                    .eq('user_id', userId)
                    .order('name', { ascending: true });

                if (fetchError) throw fetchError;

                // If user has no categories yet, add defaults
                if (data && data.length === 0) {
                    const defaultCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].map(cat => ({ ...cat, user_id: userId }));
                    const { data: insertedDefaults, error: insertError } = await supabase
                        .from('categories')
                        .insert(defaultCategories)
                        .select('id, name, color, type');

                    if (insertError) throw insertError;
                    setUserCategories(insertedDefaults || []);
                } else {
                    setUserCategories(data || []);
                }

            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Falha ao buscar categorias.");
                toast({ title: "Erro", description: "Não foi possível carregar as categorias.", variant: "destructive" });
                setUserCategories([]);
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        // Initial fetch and refetch trigger
        useEffect(() => {
            fetchCategories();
        }, [fetchCategories]); // Re-run when fetchCategories (and thus userId) changes

        // Note: Adding/deleting categories might require more UI/logic
        // For now, we focus on fetching existing ones.
        // Add category function (example - might need more fields like color, type)
        const addCategory = useCallback(async (categoryData) => {
             if (!userId) {
                 toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
                 return null;
             }
             if (!categoryData || !categoryData.name || !categoryData.type) {
                 toast({ title: "Erro", description: "Nome e tipo da categoria são obrigatórios.", variant: "destructive" });
                 return null;
             }

             setLoading(true);
             setError(null);
             try {
                 const payload = {
                     user_id: userId,
                     name: categoryData.name,
                     color: categoryData.color || '#6B7280', // Default color
                     type: categoryData.type,
                 };
                 const { data: insertedData, error: insertError } = await supabase
                     .from('categories')
                     .insert(payload)
                     .select('id, name, color, type')
                     .single();

                 if (insertError) throw insertError;

                 setUserCategories(prev => [...prev, insertedData].sort((a, b) => a.name.localeCompare(b.name)));
                 toast({ title: "Sucesso", description: `Categoria "${insertedData.name}" adicionada.` });
                 return insertedData;
             } catch (err) {
                 console.error("Failed to add category:", err);
                 setError("Falha ao adicionar categoria.");
                 toast({ title: "Erro", description: "Não foi possível adicionar a categoria.", variant: "destructive" });
                 return null;
             } finally {
                 setLoading(false);
             }
        }, [userId, toast]);


        const refetchCategories = useCallback(() => {
            fetchCategories();
        }, [fetchCategories]);

        // Combine default and user categories if needed, or just use userCategories
        const categories = useMemo(() => {
            // Return only user-specific categories fetched from Supabase
            return userCategories;
        }, [userCategories]);

        return {
            categories, // This now holds only user-specific categories
            loading,
            error,
            refetchCategories,
            addCategory, // Expose addCategory function
        };
    }
  