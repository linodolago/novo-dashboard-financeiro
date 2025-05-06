
    import React from 'react';
    import { useFinance } from '@/context/FinanceContext';
    import { useFilteredCategories } from './useFilteredCategories';

    export function useTransactionDialogData(transactionType) {
        const {
            categories: allCategories,
            paymentMethods: fixedPaymentMethods,
            banks: allBanks,
            persistedTransactions
        } = useFinance();

        const filteredCategories = useFilteredCategories(allCategories, transactionType);

        return {
            categories: filteredCategories,
            paymentMethods: fixedPaymentMethods,
            banks: allBanks,
            persistedTransactions,
        };
    }
  