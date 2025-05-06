
    import React, { useState, useCallback, useEffect } from 'react';
    import { supabase, getUserId } from '@/lib/supabaseClient';
    import { useToast } from "@/components/ui/use-toast";
    import { subDays, parseISO } from 'date-fns';
    import { formatDateSafe, prepareSupabaseData } from '@/lib/transactionUtils'; // Import helpers

    export function useTransactions() {
      const [transactions, setTransactions] = useState([]);
      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [userId, setUserId] = useState(null);

      useEffect(() => {
          const fetchUser = async () => {
              const id = await getUserId();
              setUserId(id);
              if (!id) {
                  setLoading(false);
              }
          };
          fetchUser();
      }, []);

      const fetchTransactions = useCallback(async () => {
          if (!userId) {
              setTransactions([]);
              setLoading(false);
              return;
          }
          setLoading(true);
          setError(null);
          try {
              const { data, error: fetchError } = await supabase
                  .from('transactions')
                  .select(`
                      id, description, amount, category_id, payment_method, bank_account_id, frequency, type, date, end_date, created_at, updated_at,
                      categories ( id, name, color ),
                      banks ( id, name )
                  `)
                  .eq('user_id', userId)
                  .order('date', { ascending: false });

              if (fetchError) throw fetchError;

              const mappedData = data.map(t => ({
                  ...t,
                  category: t.categories ? t.categories.name : null,
                  bankAccount: t.banks ? t.banks.name : null,
                  // category_id and bank_account_id are already correct from the select
              }));

              setTransactions(mappedData || []);
          } catch (err) {
              console.error("Failed to fetch transactions:", err);
              setError("Falha ao buscar transações.");
              toast({ title: "Erro", description: `Falha ao carregar transações: ${err.message}`, variant: "destructive" });
              setTransactions([]);
          } finally {
              setLoading(false);
          }
      }, [userId, toast]);

      useEffect(() => {
          if (userId) { // Fetch only if userId is available
             fetchTransactions();
          }
      }, [userId, fetchTransactions]); // Re-run when fetchTransactions or userId changes

      const addTransaction = useCallback(async (data) => {
          if (!userId) {
              toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
              return null;
          }
          setLoading(true);
          setError(null);
          try {
              const preparedData = prepareSupabaseData(data, userId);

              const { data: insertedData, error: insertError } = await supabase
                  .from('transactions')
                  .insert(preparedData)
                  .select(`
                      id, description, amount, category_id, payment_method, bank_account_id, frequency, type, date, end_date, created_at, updated_at,
                      categories ( id, name, color ),
                      banks ( id, name )
                  `)
                  .single();

              if (insertError) throw insertError;

              const mappedNewTransaction = {
                  ...insertedData,
                  category: insertedData.categories ? insertedData.categories.name : null,
                  bankAccount: insertedData.banks ? insertedData.banks.name : null,
              };

              // Use fetchTransactions to ensure state consistency after add
              await fetchTransactions();
              toast({ title: "Sucesso", description: "Transação adicionada." });
              return mappedNewTransaction; // Return the mapped data

          } catch (err) {
              console.error("Failed to add transaction:", err);
              const userMessage = err.message.includes("category_id") ? "Categoria inválida."
                                : err.message.includes("bank_account_id") ? "Banco inválido."
                                : "Não foi possível adicionar a transação.";
              setError(`Falha ao adicionar transação: ${err.message}`);
              toast({ title: "Erro", description: userMessage, variant: "destructive" });
              return null;
          } finally {
              setLoading(false);
          }
      }, [userId, toast, fetchTransactions]);


      const updateTransaction = useCallback(async (data, options = {}) => {
          const { changeEffectiveDate, silent = false } = options;

          if (!userId) {
              if (!silent) toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
              return null;
          }
          if (!data.id) {
              setError("ID da transação ausente para atualização.");
              if (!silent) toast({ title: "Erro", description: "ID da transação ausente.", variant: "destructive" });
              return null;
          }

          setLoading(true);
          setError(null);

          try {
              // Refetch current transactions to get the latest state before updating
              const { data: currentTransactions, error: fetchCurrentError } = await supabase
                  .from('transactions')
                  .select('*')
                  .eq('user_id', userId);

              if (fetchCurrentError) throw fetchCurrentError;

              const originalTransaction = currentTransactions.find(t => t.id === data.id);
              if (!originalTransaction) {
                  throw new Error("Transação original não encontrada para atualização.");
              }

              let resultTransaction = null;

              if (changeEffectiveDate && originalTransaction.frequency !== 'once') {
                  const effectiveDate = formatDateSafe(changeEffectiveDate);
                  const originalStartDate = formatDateSafe(originalTransaction.date);

                  if (!effectiveDate || !originalStartDate || effectiveDate <= originalStartDate) {
                      throw new Error("Data efetiva inválida. Deve ser posterior à data de início da transação original.");
                  }

                  const dayBeforeEffective = formatDateSafe(subDays(parseISO(effectiveDate), 1));
                  const { error: updateOriginalError } = await supabase
                      .from('transactions')
                      .update({ end_date: dayBeforeEffective })
                      .eq('id', originalTransaction.id)
                      .eq('user_id', userId);

                  if (updateOriginalError) throw updateOriginalError;

                  const newTransactionData = prepareSupabaseData({
                      ...data,
                      date: effectiveDate,
                      frequency: originalTransaction.frequency,
                      type: originalTransaction.type,
                      end_date: null, // New transaction has no end date initially
                      id: undefined, // Ensure ID is not copied
                  }, userId);

                  const { data: insertedData, error: insertError } = await supabase
                      .from('transactions')
                      .insert(newTransactionData)
                      .select(`id, description, amount, category_id, payment_method, bank_account_id, frequency, type, date, end_date, created_at, updated_at, categories ( id, name, color ), banks ( id, name )`)
                      .single();

                  if (insertError) throw insertError;
                  resultTransaction = insertedData;

              } else {
                  const updatePayload = prepareSupabaseData(data, userId);
                  // Ensure end_date isn't overwritten unintentionally for non-split updates
                  if (data.frequency !== 'once' && !changeEffectiveDate) {
                       // Keep existing end_date if it exists and frequency is not 'once'
                       updatePayload.end_date = formatDateSafe(originalTransaction.end_date);
                  } else if (data.frequency === 'once') {
                       updatePayload.end_date = null; // Set to null for 'once'
                  }
                  delete updatePayload.user_id; // Not needed for update
                  // id is used in eq filter, not in payload

                  const { data: updatedData, error: updateError } = await supabase
                      .from('transactions')
                      .update(updatePayload)
                      .eq('id', data.id)
                      .eq('user_id', userId)
                      .select(`id, description, amount, category_id, payment_method, bank_account_id, frequency, type, date, end_date, created_at, updated_at, categories ( id, name, color ), banks ( id, name )`)
                      .single();

                  if (updateError) throw updateError;
                  resultTransaction = updatedData;
              }

              await fetchTransactions(); // Refetch to update UI state
              if (!silent) toast({ title: "Sucesso", description: "Transação atualizada." });

              const mappedResult = resultTransaction ? {
                  ...resultTransaction,
                  category: resultTransaction.categories ? resultTransaction.categories.name : null,
                  bankAccount: resultTransaction.banks ? resultTransaction.banks.name : null,
              } : null;

              return mappedResult;

          } catch (err) {
              console.error("Failed to update transaction:", err);
              const userMessage = err.message.includes("category_id") ? "Categoria inválida."
                                : err.message.includes("bank_account_id") ? "Banco inválido."
                                : err.message || "Falha ao atualizar transação.";
              setError(`Falha ao atualizar transação: ${err.message}`);
              if (!silent) toast({ title: "Erro", description: userMessage, variant: "destructive" });
              return null;
          } finally {
              setLoading(false);
          }
      }, [userId, toast, fetchTransactions]);


      const deleteTransaction = useCallback(async (transactionId, transactionType) => {
          if (!userId) {
              toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
              return false;
          }
          if (!transactionId) {
              setError("ID da transação ausente para exclusão.");
              toast({ title: "Erro", description: "ID da transação ausente.", variant: "destructive" });
              return false;
          }
          setLoading(true);
          setError(null);
          try {
              const { error: deleteError } = await supabase
                  .from('transactions')
                  .delete()
                  .eq('id', transactionId)
                  .eq('user_id', userId);

              if (deleteError) throw deleteError;

              // Use fetchTransactions to ensure state consistency after delete
              await fetchTransactions();
              toast({ title: "Sucesso", description: `${transactionType === 'income' ? 'Receita' : 'Despesa'} excluída.` });
              return true;
          } catch (err) {
              console.error("Failed to delete transaction:", err);
              setError(err.message || "Falha ao excluir transação.");
              toast({ title: "Erro", description: err.message || "Falha ao excluir transação.", variant: "destructive" });
              return false;
          } finally {
              setLoading(false);
          }
      }, [userId, toast, fetchTransactions]);

      const refetchTransactions = useCallback(() => {
          fetchTransactions();
      }, [fetchTransactions]);


      return {
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refetchTransactions
      };
    }
  