
    import React from 'react';
    import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
    import { motion } from 'framer-motion';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload; // Access the full data object
            return (
                <div className="bg-background p-2 rounded-md shadow-md border border-border text-sm">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-muted-foreground">Faixa: {data.range}</p>
                </div>
            );
        }
        return null;
    };

    const FinancialSecurityChart = ({ chartData }) => {
        if (!chartData || chartData.length === 0) {
            return <div className="text-center text-muted-foreground py-4">Calculando gráfico...</div>;
        }

        return (
            <motion.div
                className="h-[200px] w-full mt-4"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5 }}
             >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        barCategoryGap="20%" // Add some gap between bars
                    >
                        {/* YAxis shows category names */}
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            width={80} // Adjust width to fit names
                        />
                        {/* XAxis is hidden */}
                        <XAxis type="number" hide={true} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={15}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        );
    };

    export default FinancialSecurityChart;
  