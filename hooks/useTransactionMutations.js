
    import React, { useCallback } from 'react';
        import { useToast } from '@/components/ui/use-toast';
        import { mapIncomeData, mapExpenseData } from './transactionMappers';
        import {
            _internalAddTransaction,
            _internalDeleteTransaction,
            _internalUpdateTransaction,
            _internalUpdateRecurringValue
        } from './transactionMutations';
        import { fetchSingleTransaction as apiFetchSingleTransaction } from '@/services/supabaseService'; // Import fetch single
        import { format, parse } from 'date-fns';

        // This hook encapsulates mutation logic, requiring dispatch and transactions state
        export function useTransactionMutations(dispatch, transactions) {
            const { toast } = useToast();

            // --- Helper for Handling All Mutations ---
            const handleMutation = useCallback(async (mutationFn, successAction, successToast, failureToast) => {
                dispatch({ type: 'MUTATION_START' });
                try {
                    const result = await mutationFn();
                     // If mutationFn returns data, use it as payload, otherwise use successAction.payload
                    const payloadForResult = result !== undefined ? result : successAction.payload;
                    dispatch({ type: successAction.type, payload: payloadForResult });

                    if (successToast) {
                        toast({
                            title: successToast.title,
                            description: successToast.description,
                            variant: 'default',
                        });
                    }
                    return result ?? true; // Return result or true for success indication
                } catch (err) {
                    console.error(`${failureToast.title} error:`, err);
                    dispatch({ type: 'MUTATION_ERROR' }); // Reset loading, error handled by toast
                    toast({
                        title: failureToast.title,
                        description: err.message || failureToast.description,
                        variant: 'destructive',
                    });
                    return false; // Indicate failure
                }
            }, [dispatch, toast]);

            // --- Specific Mutation Functions ---
            const addTransaction = useCallback(async (transactionInput) => {
                const isIncome = transactionInput.type === 'income';
                return handleMutation(
                    async () => {
                        const insertedDbRecord = await _internalAddTransaction(transactionInput);
                        // Map the result from DB before sending to reducer
                        return isIncome ? mapIncomeData(insertedDbRecord) : mapExpenseData(insertedDbRecord);
                    },
                    { type: 'ADD_SUCCESS', payload: undefined }, // Payload determined by mutationFn result
                    {
                        title: isIncome ? 'Receita adicionada' : 'Despesa adicionada',
                        description: `${transactionInput.description || transactionInput.name} adicionado(a).`,
                    },
                    {
                        title: 'Erro ao adicionar',
                        description: 'Não foi possível salvar a transação.',
                    }
                 );
            }, [handleMutation]);

            const deleteTransaction = useCallback(async (id, type) => {
                const transactionToDelete = transactions.find(t => t.id === id);
                return handleMutation(
                    () => _internalDeleteTransaction(id, type),
                    { type: 'DELETE_SUCCESS', payload: { id } }, // Pass id for reducer
                    {
                        title: 'Transação removida',
                        description: `"${transactionToDelete?.description || 'A transação'}" foi removida.`,
                    },
                    {
                        title: 'Erro ao remover',
                        description: 'Não foi possível remover a transação.',
                    }
                );
            }, [handleMutation, transactions]); // Needs transactions state

            const updateTransaction = useCallback(async (transactionInput) => {
                 const isIncome = transactionInput.type === 'income';
                 return handleMutation(
                     async () => {
                        if (!transactionInput.type) throw new Error("Tipo (income/expense) é obrigatório.");
                        const updatedDbRecord = await _internalUpdateTransaction(transactionInput);
                        // Map the result from DB before sending to reducer
                        return isIncome ? mapIncomeData(updatedDbRecord) : mapExpenseData(updatedDbRecord);
                     },
                     { type: 'UPDATE_SUCCESS', payload: undefined }, // Payload determined by mutationFn result
                     {
                         title: 'Transação atualizada',
                         description: `${transactionInput.description || transactionInput.name} atualizado(a).`,
                     },
                     {
                         title: 'Erro ao atualizar',
                         description: 'Não foi possível salvar as alterações.',
                     }
                  );
            }, [handleMutation]);

            const updateRecurringValueFromDate = useCallback(async (originalTransactionId, newAmount, effectiveDateStr) => {
                 // Find the transaction in local state primarily for display info (description, etc.)
                 const localTransactionInfo = transactions.find(t => t.id === originalTransactionId);

                 if (!localTransactionInfo) {
                      toast({ title: "Erro", description: "Transação original não encontrada localmente.", variant: "destructive" });
                      return false;
                 }
                 if (!['monthly', 'yearly'].includes(localTransactionInfo.frequency)) {
                     toast({ title: "Erro", description: "Ação aplicável apenas a transações mensais ou anuais.", variant: "destructive" });
                     return false;
                 }

                 return handleMutation(
                     async () => {
                        // --- NEW APPROACH: Fetch original data directly from DB ---
                        const originalDbRecord = await apiFetchSingleTransaction(originalTransactionId, localTransactionInfo.type);

                        // Pass the fetched DB record and other necessary info from local state
                        const { updatedOldRecord, insertedNewRecord } = await _internalUpdateRecurringValue(
                            originalDbRecord, // Fresh data from DB
                            newAmount,
                            effectiveDateStr,
                            localTransactionInfo.type, // Pass these from local state as they are needed for the new record
                            localTransactionInfo.description,
                            localTransactionInfo.frequency,
                            localTransactionInfo.paymentMethod,
                            localTransactionInfo.category
                        );
                        // Map results before returning for the reducer
                        const mappedUpdatedOld = localTransactionInfo.type === 'income' ? mapIncomeData(updatedOldRecord) : mapExpenseData(updatedOldRecord);
                        const mappedNew = localTransactionInfo.type === 'income' ? mapIncomeData(insertedNewRecord) : mapExpenseData(insertedNewRecord);
                        return { updatedOld: mappedUpdatedOld, insertedNew: mappedNew };
                     },
                     { type: 'UPDATE_RECURRING_SUCCESS', payload: undefined }, // Payload determined by mutationFn result
                     {
                         title: "Recorrência Atualizada",
                         description: `Valor de "${localTransactionInfo.description}" atualizado a partir de ${format(parse(effectiveDateStr, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}.`,
                     },
                     {
                         title: 'Erro ao atualizar recorrência',
                         description: 'Não foi possível aplicar a alteração de valor.',
                     }
                 );

            }, [handleMutation, transactions, toast]); // Needs transactions state and toast

            // Return the mutation functions
            return {
                addTransaction,
                deleteTransaction,
                updateTransaction,
                updateRecurringValueFromDate,
            };
        }
  