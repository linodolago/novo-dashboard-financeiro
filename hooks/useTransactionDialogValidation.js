
    import React, { useCallback } from 'react';

    export function useTransactionDialogValidation(state) {
        const {
            description, amount, category, paymentMethod, bankAccount, date,
            transactionType
        } = state;

        const validateBasicFields = useCallback(() => {
            if (!description?.trim() || !amount || parseFloat(amount) <= 0 || !date) {
                return { valid: false, message: "Preencha todos os campos obrigatórios corretamente." };
            }
            if (transactionType === 'expense' && (!category || !paymentMethod)) {
                return { valid: false, message: "Selecione a categoria e a forma de pagamento." };
            }
            if (transactionType === 'income' && !bankAccount) {
                return { valid: false, message: "Selecione o banco." };
            }
            return { valid: true, message: "" };
        }, [description, amount, date, transactionType, category, paymentMethod, bankAccount]);


        const validateForm = useCallback(() => {
            const basicValidation = validateBasicFields();
            if (!basicValidation.valid) return basicValidation;

            return { valid: true, message: "" };

        }, [validateBasicFields]);

        return {
            validateBasicFields,
            validateForm,
        };
    }
  