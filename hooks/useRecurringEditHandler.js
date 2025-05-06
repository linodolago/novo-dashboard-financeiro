
    import React, { useCallback } from 'react';
    import { useToast } from "@/components/ui/use-toast";
    import { useFinance } from '@/context/FinanceContext';

    // Builds payload for UPDATING an existing transaction
    const buildUpdatePayload = (state) => ({
        id: state.effectiveTransactionId,
        description: state.description.trim(),
        amount: parseFloat(state.amount),
        category: state.transactionType === 'expense' ? state.category : null,
        paymentMethod: state.transactionType === 'expense' ? state.paymentMethod : null,
        bankAccount: state.transactionType === 'income' ? state.bankAccount : null,
        frequency: state.frequency,
        type: state.transactionType,
        date: state.date,
    });


    export function useRecurringEditHandler(state, setters, onOpenChange) {
        const { updateTransaction } = useFinance();
        const { toast } = useToast();
        const { setIsSubmitting, setIsRecurringEditOptionsOpen, setPendingUpdateData } = setters;

        // Called when the main form submit happens for a recurring edit
        const initiateRecurringEdit = useCallback(() => {
            if (!state.effectiveTransactionId || !state.originalTransactionData) {
                 throw new Error("Dados da transação original ainda não carregados. Tente novamente.");
            }
            const currentUpdateData = buildUpdatePayload(state);
            setPendingUpdateData(currentUpdateData);
            setIsRecurringEditOptionsOpen(true);
            // No submission happens here yet, return false to indicate waiting
            return false;
        }, [state, setPendingUpdateData, setIsRecurringEditOptionsOpen]);


        // Called by the RecurringEditOptionsDialog confirm handler
        const handleConfirmedUpdate = useCallback(async (updateData, options) => {
            if (!updateData?.id) throw new Error("Missing ID for update.");
            setIsSubmitting(true);
            let success = false;
            let errorMessage = "Ocorreu um erro ao atualizar a transação recorrente.";
            try {
                success = !!await updateTransaction(updateData, options);
            } catch (error) {
                 console.error("Error during confirmed transaction update:", error);
                 errorMessage = error.message || errorMessage;
                 success = false;
            } finally {
                 setIsSubmitting(false);
                 if (success) {
                     toast({ title: "Sucesso", description: "Transação recorrente atualizada." });
                     setIsRecurringEditOptionsOpen(false); // Close options dialog
                     onOpenChange(false); // Close main dialog
                 } else {
                     toast({ title: "Erro", description: errorMessage, variant: "destructive" });
                     // Keep options dialog open on error? Or close? Let's close it.
                     setIsRecurringEditOptionsOpen(false);
                 }
            }
        }, [updateTransaction, toast, setIsSubmitting, setIsRecurringEditOptionsOpen, onOpenChange]);

        return {
            initiateRecurringEdit,
            handleConfirmedUpdate,
            buildUpdatePayload, // Expose if needed elsewhere, maybe not
        };
    }
  