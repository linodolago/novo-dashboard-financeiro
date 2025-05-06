
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { PlusCircle, MinusCircle, Eye } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useFinance } from '@/context/FinanceContext';
    import { formatCurrency } from '@/lib/utils';
    import TransactionListView from './TransactionListView'; // Import the new component

    const TransactionButtons = ({ onAddIncome, onAddExpense }) => {
        const { monthlyBalance, currentMonthTransactions, loading } = useFinance();
        const [incomeListOpen, setIncomeListOpen] = useState(false);
        const [expenseListOpen, setExpenseListOpen] = useState(false);

        const incomeTransactions = currentMonthTransactions.filter(t => t.type === 'income');
        const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');

        const buttonVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: (i) => ({
                opacity: 1,
                y: 0,
                transition: {
                    delay: 0.3 + i * 0.1, // Stagger animation
                    duration: 0.5
                }
            })
        };

        return (
            <>
                <div className="flex flex-wrap justify-center items-start gap-x-8 gap-y-6 my-6">

                    {/* Income Group */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Nova entrada */}
                        <motion.div
                            custom={0}
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Button
                                onClick={onAddIncome}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-6 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                                disabled={loading}
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span className="font-medium">Nova entrada</span>
                            </Button>
                        </motion.div>

                        {/* Ver Receitas */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            custom={2}
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Button
                                onClick={() => setIncomeListOpen(true)}
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                disabled={loading}
                            >
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">Ver Receitas</span>
                            </Button>
                            <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(monthlyBalance.income)}
                            </span>
                        </motion.div>
                    </div>

                    {/* Expense Group */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Novo gasto */}
                        <motion.div
                            custom={1}
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Button
                                onClick={onAddExpense}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-6 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                                disabled={loading}
                            >
                                <MinusCircle className="h-5 w-5" />
                                <span className="font-medium">Novo gasto</span>
                            </Button>
                        </motion.div>

                        {/* Ver Despesas */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            custom={3}
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Button
                                onClick={() => setExpenseListOpen(true)}
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                disabled={loading}
                            >
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">Ver Despesas</span>
                            </Button>
                            <span className="text-sm font-semibold text-red-600">
                                {formatCurrency(monthlyBalance.expense)}
                            </span>
                        </motion.div>
                    </div>

                </div>

                {/* Dialogs for listing transactions */}
                <TransactionListView
                    open={incomeListOpen}
                    onOpenChange={setIncomeListOpen}
                    type="income"
                    transactions={incomeTransactions}
                />
                <TransactionListView
                    open={expenseListOpen}
                    onOpenChange={setExpenseListOpen}
                    type="expense"
                    transactions={expenseTransactions}
                />
            </>
        );
    };

    export default TransactionButtons;
  