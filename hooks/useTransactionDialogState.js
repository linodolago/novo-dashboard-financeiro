
    import React, { useState, useEffect, useCallback } from 'react';
    import { formatInputDate, parseDateString } from '@/lib/utils';
    import { useFinance } from '@/context/FinanceContext';

    const findOriginalTransaction = (transaction, persistedTransactions) => {
        if (!Array.isArray(persistedTransactions)) return null;
        // If it's an instance, find the base recurring transaction
        if (transaction?.isRecurringInstance && transaction.original_id) {
            return persistedTransactions.find(t => t.id === transaction.original_id);
        }
        // Otherwise, assume it's the base transaction itself or a single one
        return persistedTransactions.find(t => t.id === transaction?.id);
    };

    const initializeState = (initialType, initialTransactionToEdit, persistedTransactions) => {
        const state = {
            description: '', amount: '', category: '', paymentMethod: '', bankAccount: '',
            frequency: 'once', date: formatInputDate(new Date()),
            isSubmitting: false, isEditing: false, effectiveTransactionId: null,
            originalTransactionData: null, // Store the full original transaction
            transactionType: initialType,
            isAddBankDialogOpen: false,
            isRecurringEditOptionsOpen: false, // New state for the options dialog
            pendingUpdateData: null, // Store data before showing options dialog
        };

        if (initialTransactionToEdit) {
            const originalTransaction = findOriginalTransaction(initialTransactionToEdit, persistedTransactions);
            if (originalTransaction) {
                state.isEditing = true;
                state.transactionType = originalTransaction.type;
                state.effectiveTransactionId = originalTransaction.id;
                state.originalTransactionData = originalTransaction; // Store original
                state.description = originalTransaction.description || '';
                state.amount = originalTransaction.amount?.toString() || '';
                state.category = originalTransaction.category || '';
                state.paymentMethod = originalTransaction.paymentMethod || '';
                state.bankAccount = originalTransaction.bankAccount || '';
                state.frequency = originalTransaction.frequency || 'once';
                const startDate = originalTransaction.date ? formatInputDate(parseDateString(originalTransaction.date)) : formatInputDate(new Date());
                state.date = startDate;
                // originalStartDate is now part of originalTransactionData
            } else if (Array.isArray(persistedTransactions)) {
                 console.error("Could not find original transaction data for editing. Persisted data might be loading.");
            }
        } else {
            state.transactionType = initialType;
        }

        return state;
    };


    export function useTransactionDialogState(initialType, initialTransactionToEdit) {
        const { transactions: persistedTransactions } = useFinance();
        const [state, setState] = useState(() => initializeState(initialType, initialTransactionToEdit, persistedTransactions));

        useEffect(() => {
            // Re-initialize if the transaction to edit changes or persisted data loads
            if (persistedTransactions || !initialTransactionToEdit) {
                 setState(initializeState(initialType, initialTransactionToEdit, persistedTransactions));
            }
        }, [initialTransactionToEdit, persistedTransactions, initialType]);

        const updateState = useCallback((updates) => {
            setState(prev => ({ ...prev, ...updates }));
        }, []);

        const setDescription = useCallback((value) => updateState({ description: value }), [updateState]);
        const setAmount = useCallback((value) => updateState({ amount: value }), [updateState]);
        const setCategory = useCallback((value) => updateState({ category: value }), [updateState]);
        const setPaymentMethod = useCallback((value) => updateState({ paymentMethod: value }), [updateState]);
        const setBankAccount = useCallback((value) => updateState({ bankAccount: value }), [updateState]);
        const setFrequency = useCallback((value) => updateState({ frequency: value }), [updateState]);
        const setDate = useCallback((value) => updateState({ date: value }), [updateState]);
        const setIsSubmitting = useCallback((value) => updateState({ isSubmitting: value }), [updateState]);
        const setIsAddBankDialogOpen = useCallback((value) => updateState({ isAddBankDialogOpen: value }), [updateState]);
        const setIsRecurringEditOptionsOpen = useCallback((value) => updateState({ isRecurringEditOptionsOpen: value }), [updateState]);
        const setPendingUpdateData = useCallback((value) => updateState({ pendingUpdateData: value }), [updateState]);


        const resetFormState = useCallback(() => {
             // Reset everything except potentially the initial type if needed
             setState(initializeState(initialType, null, persistedTransactions));
        }, [initialType, persistedTransactions]);

        return {
            state,
            updateState,
            resetFormState,
            description: state.description, setDescription,
            amount: state.amount, setAmount,
            category: state.category, setCategory,
            paymentMethod: state.paymentMethod, setPaymentMethod,
            bankAccount: state.bankAccount, setBankAccount,
            frequency: state.frequency, setFrequency,
            date: state.date, setDate,
            isSubmitting: state.isSubmitting, setIsSubmitting,
            isEditing: state.isEditing,
            transactionType: state.transactionType,
            originalTransactionData: state.originalTransactionData, // Expose original data
            effectiveTransactionId: state.effectiveTransactionId,
            isAddBankDialogOpen: state.isAddBankDialogOpen, setIsAddBankDialogOpen,
            isRecurringEditOptionsOpen: state.isRecurringEditOptionsOpen, setIsRecurringEditOptionsOpen,
            pendingUpdateData: state.pendingUpdateData, setPendingUpdateData,
        };
    }
  