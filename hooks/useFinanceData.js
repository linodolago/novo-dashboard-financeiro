
    import { useToast } from '@/components/ui/use-toast';

    // THIS HOOK IS DEPRECATED AND NO LONGER FUNCTIONAL.
    // Data is now managed by specific hooks (useTransactions, useCategories, etc.)
    // and accessed via the useFinance() context hook, backed by Supabase.
    export function useFinanceData() {
    	console.warn("DEPRECATED: useFinanceData hook is no longer functional. Use the specific hooks (useTransactions, etc.) via useFinance() context hook instead.");
    	const { toast } = useToast();

        // Return an empty, non-functional structure to prevent immediate crashes
        // in components that might still import it temporarily.
        return {
            transactions: [],
            categories: [],
            paymentMethods: [], // No longer provides default payment methods
            plans: [], // Replaced financialGoal with plans array
            banks: [], // Added banks array

            // Deprecated functions now do nothing except show a warning
            addTransaction: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: addTransaction não funciona mais.", variant: "destructive"}); return null;},
            deleteTransaction: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: deleteTransaction não funciona mais.", variant: "destructive"}); return false;},
            updateTransaction: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: updateTransaction não funciona mais.", variant: "destructive"}); return null;},
            addCategory: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: addCategory não funciona mais.", variant: "destructive"}); return null;},
            addPlan: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: addPlan não funciona mais.", variant: "destructive"}); return null;},
            updatePlan: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: updatePlan não funciona mais.", variant: "destructive"}); return null;},
            deletePlan: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: deletePlan não funciona mais.", variant: "destructive"}); return false;},
            addBank: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: addBank não funciona mais.", variant: "destructive"}); return null;},

            loading: true, // Indicate loading as it provides no data
            error: "useFinanceData is deprecated and provides no data.", // Set an error message
            refetchData: async () => {toast({title: "Função Obsoleta", description:"useFinanceData: refetchData não funciona mais.", variant: "destructive"});},
            currentDate: new Date(), // Keep minimal state if needed elsewhere temporarily
            setCurrentDate: () => {toast({title: "Função Obsoleta", description:"useFinanceData: setCurrentDate não funciona mais.", variant: "destructive"});},
        };
    }
  