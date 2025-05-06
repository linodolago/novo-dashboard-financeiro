
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { useFinance } from '@/context/FinanceContext';
    import FinancialSecurityChart from '@/components/FinancialSecurityChart';
    import { formatCurrency } from '@/lib/utils';
    import { getSecurityChartData } from '@/lib/financeCalculations'; // Import helper

    const FinancialSecuritySection = () => {
        const { monthlyBalance, averageMonthlyExpense, financialSecurityInfo, loading } = useFinance();

        if (loading && !financialSecurityInfo) {
            // Optional: Show a placeholder or skeleton while loading initial data
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6"
                >
                    <Card className="animate-pulse">
                        <CardHeader>
                            <CardTitle className="text-lg bg-gray-300 h-6 w-48 rounded"></CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4 p-6">
                            <div className="h-6 bg-gray-300 w-3/4 mx-auto rounded"></div>
                            <div className="h-4 bg-gray-300 w-1/2 mx-auto rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                             <div className="flex justify-between text-sm mt-4">
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-300 w-24 rounded"></div>
                                    <div className="h-5 bg-gray-300 w-20 rounded"></div>
                                </div>
                                 <div className="space-y-1">
                                     <div className="h-4 bg-gray-300 w-32 rounded"></div>
                                     <div className="h-5 bg-gray-300 w-24 rounded"></div>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                 </motion.div>
            );
        }

        const chartData = getSecurityChartData(averageMonthlyExpense, financialSecurityInfo?.category);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">SEGURANÇA FINANCEIRA</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-2 p-6">
                        <p className="text-muted-foreground text-sm">Sua Segurança Financeira:</p>
                        <p className="text-2xl font-bold" style={{ color: financialSecurityInfo?.color }}>
                            {financialSecurityInfo?.category || 'Calculando...'}
                        </p>
                        <p className="text-muted-foreground text-sm pb-2">
                            {financialSecurityInfo?.description || ''}
                        </p>

                        <FinancialSecurityChart chartData={chartData} />

                        <div className="flex justify-between text-sm pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo atual (fim do mês)</p>
                                <p className="font-semibold">{formatCurrency(monthlyBalance?.balance ?? 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Gasto mensal médio</p>
                                <p className="font-semibold">{formatCurrency(averageMonthlyExpense ?? 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    export default FinancialSecuritySection;
  