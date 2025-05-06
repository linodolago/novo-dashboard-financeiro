
    import React, { useCallback } from 'react';
    import { useFinance } from '@/context/FinanceContext';
    import { useToast } from "@/components/ui/use-toast";

    // Payloads are now built using prepareSupabaseData in useTransactions hook

    // Add isSubmittingState as an argument
    export function useTransactionDialogActions(coreState, validation, setters, onOpenChangeExternal, isSubmittingState) {
        const { addTransaction, updateTransaction, addBank } = useFinance();
        const { toast } = useToast();
        const { validateForm } = validation;
        const {
            setIsSubmitting, // From visibility hook
            setBankAccount, // From core hook
            setIsAddBankDialogOpen, // From visibility hook
            resetFormState, // From core hook (passed through visibility hook)
            setIsRecurringEditOptionsOpen, // From visibility hook
            setPendingUpdateData // From core hook
        } = setters;


        // Simplified: Let useTransactions handle payload creation via prepareSupabaseData
        const handleAddNew = useCallback(async () => {
            const addPayload = { // Construct payload with current state (IDs are now correct)
                description: coreState.description.trim(),
                amount: coreState.amount,
                category: coreState.category, // Expecting ID
                paymentMethod: coreState.paymentMethod,
                bankAccount: coreState.bankAccount, // Expecting ID
                frequency: coreState.frequency,
                type: coreState.transactionType,
                date: coreState.date,
                end_date: coreState.frequency === 'once' ? null : undefined, // Let prepareSupabaseData handle undefined end_date
            };
            const success = !!await addTransaction(addPayload);
            if (!success) throw new Error("Falha ao adicionar transação.");
            return success;
        }, [coreState, addTransaction]);

        // Simplified: Let useTransactions handle payload creation via prepareSupabaseData
        const handleSimpleUpdate = useCallback(async () => {
             const updatePayload = { // Construct payload with current state
                 id: coreState.effectiveTransactionId,
                 description: coreState.description.trim(),
                 amount: coreState.amount,
                 category: coreState.category, // Expecting ID
                 paymentMethod: coreState.paymentMethod,
                 bankAccount: coreState.bankAccount, // Expecting ID
                 frequency: coreState.frequency,
                 type: coreState.transactionType,
                 date: coreState.date,
                 // end_date is handled within updateTransaction based on options/frequency
             };
             const success = !!await updateTransaction(updatePayload, {}); // Pass empty options
             if (!success) throw new Error("Falha ao atualizar transação.");
             return success;
        }, [coreState, updateTransaction]);


        const handleConfirmedUpdate = useCallback(async (updateData, options) => {
            if (!updateData?.id) {
                 toast({ title: "Erro", description: "ID da transação ausente para atualização.", variant: "destructive" });
                 setIsRecurringEditOptionsOpen(false);
                 return;
            }
            setIsSubmitting(true);
            let success = false;
            let errorMessage = "Ocorreu um erro ao atualizar a transação recorrente.";
            try {
                // updateData already contains necessary fields including ID
                success = !!await updateTransaction(updateData, options);
            } catch (error) {
                 console.error("Error during confirmed transaction update:", error);
                 errorMessage = error.message || errorMessage;
                 success = false;
            } finally {
                 setIsSubmitting(false);
                 setIsRecurringEditOptionsOpen(false);
                 if (success) {
                     toast({ title: "Sucesso", description: "Transação recorrente atualizada." });
                     onOpenChangeExternal(false);
                 } else {
                     toast({ title: "Erro", description: errorMessage, variant: "destructive" });
                 }
            }
        }, [updateTransaction, toast, setIsSubmitting, setIsRecurringEditOptionsOpen, onOpenChangeExternal]);


        const handleAddBankAction = useCallback(async (bankName) => {
            setIsSubmitting(true);
            const addedBank = await addBank(bankName);
            setIsSubmitting(false);
            if (addedBank) {
                // Set the BANK ID to the state, not the name
                setBankAccount(addedBank.id);
                setIsAddBankDialogOpen(false);
                toast({ title: "Sucesso", description: `Banco "${bankName}" adicionado.`});
                return true;
            } else {
                 // Error toast is handled within useBanks hook
                 return false;
            }
        }, [addBank, setBankAccount, setIsAddBankDialogOpen, setIsSubmitting, toast]);


        const handleSubmit = useCallback(async (e) => {
            e.preventDefault();
            setIsSubmitting(true);

            let success = false;
            let operationType = coreState.isEditing ? 'atualizada' : 'adicionada';
            let errorMessage = `Ocorreu um erro ao ${operationType === 'atualizada' ? 'atualizar' : 'adicionar'} a transação.`;
            let shouldCloseMainDialog = false;
            let optionsDialogOpened = false; // Flag to track if options dialog was triggered

            try {
                const validationResult = validateForm();
                if (!validationResult.valid) {
                    throw new Error(validationResult.message);
                }

                if (coreState.isEditing) {
                    if (!coreState.effectiveTransactionId || !coreState.originalTransactionData) {
                        throw new Error("Dados da transação original ainda não carregados. Tente novamente.");
                    }

                    if (coreState.originalTransactionData.frequency !== 'once') {
                        // Prepare payload for recurring options
                        const currentUpdateData = {
                            id: coreState.effectiveTransactionId,
                            description: coreState.description.trim(),
                            amount: coreState.amount,
                            category: coreState.category, // ID
                            paymentMethod: coreState.paymentMethod,
                            bankAccount: coreState.bankAccount, // ID
                            frequency: coreState.frequency,
                            type: coreState.transactionType,
                            date: coreState.date,
                        };
                        setPendingUpdateData(currentUpdateData);
                        setIsRecurringEditOptionsOpen(true);
                        optionsDialogOpened = true; // Set flag
                        // Don't set isSubmitting(false) here, let the options dialog handle it
                        return; // Exit handleSubmit early
                    } else {
                        success = await handleSimpleUpdate();
                        operationType = 'atualizada';
                        shouldCloseMainDialog = success;
                    }
                } else {
                    success = await handleAddNew();
                    operationType = 'adicionada';
                    shouldCloseMainDialog = success;
                }

            } catch (error) {
                console.error("Error during transaction submission:", error);
                errorMessage = error.message || errorMessage;
                success = false;
                shouldCloseMainDialog = false;
            } finally {
                 // Only run this logic if the options dialog was NOT opened
                 if (!optionsDialogOpened) {
                     setIsSubmitting(false); // Ensure submitting state is reset
                     if (success) {
                         toast({ title: "Sucesso", description: `Transação ${operationType}.` });
                         if (shouldCloseMainDialog) {
                             onOpenChangeExternal(false);
                         }
                     } else {
                         // Display specific validation/API errors
                          toast({ title: "Erro", description: errorMessage, variant: "destructive" });
                     }
                 }
                 // If optionsDialogOpened is true, the submitting state and toasts
                 // are handled by handleConfirmedUpdate or the closing of the options dialog.
            }
        }, [
            coreState, validateForm, handleAddNew, handleSimpleUpdate,
            onOpenChangeExternal, toast, setIsSubmitting, setPendingUpdateData, setIsRecurringEditOptionsOpen
            // No need to depend on isSubmittingState here anymore
        ]);


        return {
            handleSubmit,
            handleAddBankAction,
            handleConfirmedUpdate,
        };
    }
  