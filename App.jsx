
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Toaster } from '@/components/ui/toaster';
    import { FinanceProvider, useFinance } from '@/context/FinanceContext';
    import Header from '@/components/Header'; // Import Header
    import MonthNavigation from '@/components/MonthNavigation';
    import BalanceChart from '@/components/BalanceChart';
    import TransactionButtons from '@/components/TransactionButtons';
    import StatisticsSection from '@/components/StatisticsSection';
    import PlanProgress from '@/components/PlanProgress';
    import FinancialSecuritySection from '@/components/FinancialSecuritySection';
    import TransactionDialog from '@/components/TransactionDialog';
    import LowBalanceWarning from '@/components/LowBalanceWarning';
    // Auth component is now rendered conditionally within FinanceProvider

    const FinanceDashboard = () => {
        const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
        const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
        // useFinance hook provides loading/error states managed by AppStatusWrapper
        const { loading, session } = useFinance(); // Get session to ensure rendering only when logged in

        // Render dashboard only if session exists (handled by FinanceProvider now, but good practice)
        if (!session) {
            return null; // Or a minimal loading/placeholder if preferred
        }

        return (
            <div className="min-h-screen bg-gray-50 p-4 relative">
                 {/* AppStatusWrapper inside FinanceProvider handles loading/error states */}
                <motion.div
                    className={`max-w-6xl mx-auto`} // No need for opacity change here, handled by wrapper
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Header /> {/* Add Header here */}
                    <MonthNavigation />
                    <LowBalanceWarning />
                    <BalanceChart />
                    <TransactionButtons
                        onAddIncome={() => setIncomeDialogOpen(true)}
                        onAddExpense={() => setExpenseDialogOpen(true)}
                    />
                    <StatisticsSection />
                    <PlanProgress />
                    <FinancialSecuritySection />

                    {/* Transaction Dialogs */}
                    <TransactionDialog
                        key="add-income"
                        open={incomeDialogOpen}
                        onOpenChange={setIncomeDialogOpen}
                        type="income"
                    />
                    <TransactionDialog
                        key="add-expense"
                        open={expenseDialogOpen}
                        onOpenChange={setExpenseDialogOpen}
                        type="expense"
                    />
                    {/* Edit dialogs are handled within TransactionListView */}
                </motion.div>
            </div>
        );
    };


    const App = () => {
        return (
            // FinanceProvider now handles Auth check and renders Auth component or the Dashboard
            <FinanceProvider>
                <FinanceDashboard />
                <Toaster />
            </FinanceProvider>
        );
    };

    export default App;
  