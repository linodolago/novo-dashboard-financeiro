
    import React, { useState, useCallback, useEffect, useMemo } from 'react';
    import { supabase, getUserId } from '@/lib/supabaseClient';
    import { useToast } from "@/components/ui/use-toast";

    // Default banks (can be added for new users if their list is empty)
    const DEFAULT_BANKS = [
        { name: 'Nubank' },
        { name: 'Itaú' },
        { name: 'Santander' },
        { name: 'Caixa Econômica Federal' },
        { name: 'Banco do Brasil' },
    ];

    export function useBanks() {
        const [userAddedBanks, setUserAddedBanks] = useState([]);
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

        // Fetch banks when user ID is available
        const fetchBanks = useCallback(async () => {
            if (!userId) {
                setUserAddedBanks([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await supabase
                    .from('banks')
                    .select('id, name')
                    .eq('user_id', userId)
                    .order('name', { ascending: true });

                if (fetchError) throw fetchError;

                 // If user has no banks yet, add defaults
                 if (data && data.length === 0) {
                    const defaultBanksPayload = DEFAULT_BANKS.map(bank => ({ ...bank, user_id: userId }));
                    const { data: insertedDefaults, error: insertError } = await supabase
                        .from('banks')
                        .insert(defaultBanksPayload)
                        .select('id, name');

                    if (insertError) {
                        // Handle potential unique constraint violation if defaults already exist somehow
                        if (insertError.code === '23505') { // unique_violation
                             console.warn("Default banks might already exist for user.");
                             // Re-fetch to get existing banks
                             const { data: existingData, error: refetchError } = await supabase
                                .from('banks')
                                .select('id, name')
                                .eq('user_id', userId)
                                .order('name', { ascending: true });
                             if (refetchError) throw refetchError;
                             setUserAddedBanks(existingData || []);
                        } else {
                            throw insertError;
                        }
                    } else {
                         setUserAddedBanks(insertedDefaults || []);
                    }
                } else {
                    setUserAddedBanks(data || []);
                }

            } catch (err) {
                console.error("Failed to fetch banks:", err);
                setError("Falha ao buscar bancos.");
                toast({ title: "Erro", description: "Não foi possível carregar os bancos.", variant: "destructive" });
                setUserAddedBanks([]);
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        // Initial fetch and refetch trigger
        useEffect(() => {
            fetchBanks();
        }, [fetchBanks]); // Re-run when fetchBanks (and thus userId) changes

        const addBank = useCallback(async (bankName) => {
            if (!userId) {
                toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
                return null;
            }
            if (!bankName || bankName.trim() === '') {
                 toast({ title: "Erro", description: "Nome do banco não pode ser vazio.", variant: "destructive" });
                 return null;
            }

            setLoading(true);
            setError(null);
            try {
                const payload = { user_id: userId, name: bankName.trim() };
                const { data: insertedData, error: insertError } = await supabase
                    .from('banks')
                    .insert(payload)
                    .select('id, name')
                    .single();

                if (insertError) {
                     if (insertError.code === '23505') { // unique_violation
                        throw new Error(`Banco "${bankName.trim()}" já existe.`);
                    } else {
                        throw insertError;
                    }
                }

                setUserAddedBanks(prev => [...prev, insertedData].sort((a, b) => a.name.localeCompare(b.name)));
                // toast({ title: "Sucesso", description: `Banco "${insertedData.name}" adicionado.` }); // Toast handled in action hook
                return insertedData;
            } catch (err) {
                console.error("Failed to add bank:", err);
                setError(err.message || "Falha ao adicionar banco.");
                toast({ title: "Erro", description: err.message || "Não foi possível adicionar o banco.", variant: "destructive" });
                return null;
            } finally {
                setLoading(false);
            }
        }, [userId, toast]);

        const refetchBanks = useCallback(() => {
            fetchBanks();
        }, [fetchBanks]);

        // Combine default and user-added banks for the dropdown list
        const banks = useMemo(() => {
            // Now just returns the user-specific banks fetched from Supabase
            return [...userAddedBanks].sort((a, b) => a.name.localeCompare(b.name));
        }, [userAddedBanks]);

        return {
            banks, // The combined list for UI
            userAddedBanks, // Only user-specific banks from DB
            loading,
            error,
            addBank,
            refetchBanks,
        };
    }
  