
    import { useMemo } from 'react';

    // Encapsulates the logic for combining loading and error states from multiple sources
    const useAggregateState = (hooks) => {
        const isLoading = useMemo(() => hooks.some(hook => hook.loading), [hooks]);
        const error = useMemo(() => hooks.reduce((acc, hook) => acc || hook.error, null), [hooks]);

        // More specific initial loading: Check if transactions are loading AND empty AND no error yet
        const isTransactionsLoading = useMemo(() => hooks.find(h => h.transactions !== undefined)?.loading ?? false, [hooks]);
        const transactionsEmpty = useMemo(() => hooks.find(h => h.transactions !== undefined)?.transactions?.length === 0 ?? true, [hooks]);
        const noTransactionError = useMemo(() => !(hooks.find(h => h.transactions !== undefined)?.error ?? false), [hooks]);

        const isInitiallyLoading = useMemo(() => isTransactionsLoading && transactionsEmpty && noTransactionError, [
            isTransactionsLoading,
            transactionsEmpty,
            noTransactionError,
        ]);


        return { isLoading, isInitiallyLoading, error };
    };

    export default useAggregateState;
  