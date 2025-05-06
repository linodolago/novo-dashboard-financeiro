
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const balancePayload = payload.find(p => p.dataKey === 'balance');
    const expensePayload = payload.find(p => p.dataKey === 'expense');
    
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
        <p className="font-semibold">Dia {label}</p>
        {balancePayload && <p className="text-blue-500">Saldo (acumulado): {formatCurrency(balancePayload.value)}</p>}
        {expensePayload && expensePayload.value > 0 && <p className="text-red-500">Gastos (dia): {formatCurrency(expensePayload.value)}</p>}
      </div>
    );
  }

  return null;
};

const BalanceChart = () => {
  // Access the calculated dailyBalances directly from context
  const { dailyBalances } = useFinance(); 

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">COMO VAI O SEU MÊS:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyBalances} // Use the data from context
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)} 
                  tickLine={false}
                  axisLine={false}
                  width={80} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Saldo (acumulado)" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Gastos (dia)" 
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BalanceChart;
