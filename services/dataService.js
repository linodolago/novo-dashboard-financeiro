
    import { fetchTransactions } from './transactionService';
    import { fetchCategories } from './categoryService';
    import { fetchGoal } from './goalService';

    // --- Consolidated Initial Data Fetch ---
    // Fetches all necessary data for the main dashboard view for the logged-in user.
    export const fetchAllInitialData = async () => {
        try {
            // Use Promise.all to fetch data concurrently
            const [transactionsResult, categoriesData, goalData] = await Promise.all([
                fetchTransactions(), // Fetches both incomes and expenses
                fetchCategories(),
                fetchGoal(),
            ]);

            // Destructure the results from fetchTransactions
            const { incomesData, expensesData } = transactionsResult;

            // Return a structured object with all fetched data
            return {
                incomesData,
                expensesData,
                categoriesData,
                goalData,
            };
        } catch (error) {
            // Log the error and re-throw a user-friendly message
            console.error("Error fetching initial application data:", error);
            throw new Error("Falha ao carregar os dados iniciais do aplicativo.");
        }
    };
  