
    import React from 'react';
    import { useTransactionDialogCore } from './useTransactionDialogCore';
    import { useTransactionDialogVisibility } from './useTransactionDialogVisibility';
    import { useTransactionDialogValidation } from './useTransactionDialogValidation';
    import { useTransactionDialogActions } from './useTransactionDialogActions';
    import { useTransactionDialogData } from './useTransactionDialogData'; // Import the new data hook

    export function useTransactionDialog(type, transactionToEdit, onOpenChangeExternal) {
        // Core State & Setters
        const { coreState, coreSetters } = useTransactionDialogCore(type, transactionToEdit);

        // Visibility State & Setters - Pass coreSetters here
        const { visibilityState, visibilitySetters } = useTransactionDialogVisibility(coreSetters, onOpenChangeExternal);

        // Validation Hook
        const validation = useTransactionDialogValidation(coreState);

        // Action Hook - Pass the isSubmitting state from visibilityState
        const actions = useTransactionDialogActions(
            coreState,
            validation,
            { ...coreSetters, ...visibilitySetters }, // Combine setters
            onOpenChangeExternal,
            visibilityState.isSubmitting // Pass the isSubmitting state here
        );

        // Data Hook - Pass the current transactionType from coreState
        const data = useTransactionDialogData(coreState.transactionType);


        // Combine everything into the final return object
        return {
            // Core State
            ...coreState,

            // Visibility State
            ...visibilityState,

            // Core Setters - EXPLICITLY RETURN THEM
            ...coreSetters,

            // Visibility Setters (already combined in actions, but return handleMainDialogOpenChange)
            handleMainDialogOpenChange: visibilitySetters.handleMainDialogOpenChange,
            setIsAddBankDialogOpen: visibilitySetters.setIsAddBankDialogOpen, // Keep these if needed directly
            setIsRecurringEditOptionsOpen: visibilitySetters.setIsRecurringEditOptionsOpen, // Keep these if needed directly

            // Validation Functions
            ...validation,

            // Data Lists
            ...data, // Spread the data object (categories, paymentMethods, banks, persistedTransactions)

            // Actions
            ...actions,

            // Pass original transaction data if needed (already in coreState)
            // persistedTransactions is now part of data
        };
    }
  