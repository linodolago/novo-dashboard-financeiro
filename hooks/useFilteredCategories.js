
    import React from 'react';

    export function useFilteredCategories(allCategories, transactionType) {
        const filteredCategories = React.useMemo(() => {
            if (!Array.isArray(allCategories)) return [];
            return allCategories.filter(cat => cat.type === transactionType);
        }, [allCategories, transactionType]);

        return filteredCategories;
    }
  