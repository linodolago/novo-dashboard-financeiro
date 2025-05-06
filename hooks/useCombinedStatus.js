
    import React, { useMemo } from 'react';

    export const useCombinedStatus = (...hooks) => {
        const isLoading = useMemo(() => hooks.some(hook => hook.loading), [hooks]);

        const isInitiallyLoading = useMemo(() => hooks.some(hook => hook.loading && (
            (hook.transactions?.length === 0 && hook.transactions !== undefined) || // Check transactions specifically
            (hook.categories?.length === 0 && hook.categories !== undefined) ||
            (hook.plans?.length === 0 && hook.plans !== undefined) ||
            (hook.userAddedBanks?.length === 0 && hook.userAddedBanks !== undefined && hook.banks?.length <= 1) // Check if only 'Other' exists initially
        )), [hooks]);

        const error = useMemo(() => hooks.reduce((acc, hook) => acc || hook.error, null), [hooks]);

        return { isLoading, isInitiallyLoading, error };
    };
  