
    import React, { useState, useCallback } from 'react';

    export function useTransactionDialogVisibility(coreSetters, onOpenChangeExternal) {
        const [isAddBankDialogOpen, setIsAddBankDialogOpenState] = useState(false);
        const [isRecurringEditOptionsOpen, setIsRecurringEditOptionsOpenState] = useState(false);
        const [isSubmitting, setIsSubmittingState] = useState(false);

        const { resetFormState } = coreSetters; // Get resetFormState from coreSetters

        const setIsSubmitting = useCallback((value) => {
            setIsSubmittingState(value);
        }, []);

        const setIsAddBankDialogOpen = useCallback((value) => {
            setIsAddBankDialogOpenState(value);
        }, []);

        const setIsRecurringEditOptionsOpen = useCallback((value) => {
            setIsRecurringEditOptionsOpenState(value);
            // Reset submitting state when options dialog closes, in case it was left open
            if (!value) {
                setIsSubmittingState(false);
            }
        }, []);

        // Handle closing the main dialog
        const handleMainDialogOpenChange = useCallback((isOpen) => {
            // Prevent closing if submitting or options dialog is open
            if (!isSubmitting && !isRecurringEditOptionsOpen) {
                if (!isOpen) {
                    resetFormState(); // Reset form only when main dialog closes naturally
                }
                onOpenChangeExternal(isOpen); // Call the external handler passed from App.jsx
            }
        }, [isSubmitting, isRecurringEditOptionsOpen, resetFormState, onOpenChangeExternal]);

        const visibilityState = {
            isAddBankDialogOpen,
            isRecurringEditOptionsOpen,
            isSubmitting,
        };

        const visibilitySetters = {
            setIsAddBankDialogOpen,
            setIsRecurringEditOptionsOpen,
            setIsSubmitting,
            handleMainDialogOpenChange,
        };

        return {
            visibilityState,
            visibilitySetters,
        };
    }
  