
    import React from 'react';
    import { AlertCircle } from 'lucide-react';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { useFinance } from '@/context/FinanceContext';
    import { formatShortDate, formatCurrency } from '@/lib/utils'; // Import formatting utils
    import { motion } from 'framer-motion';

    const LowBalanceWarning = () => {
      const { negativeBalanceInfo } = useFinance();

      if (!negativeBalanceInfo || !negativeBalanceInfo.date) {
        return null; // No warning needed if no negative balance is projected
      }

      const formattedDate = formatShortDate(negativeBalanceInfo.date);
      const daysRemaining = negativeBalanceInfo.daysRemaining;
      const balanceValue = negativeBalanceInfo.balance; // Get the projected negative balance

      let message = '';
      if (daysRemaining > 1) {
        message = `Seu saldo pode ficar negativo em ${formattedDate} (daqui a ${daysRemaining} dias), atingindo ${formatCurrency(balanceValue)}.`;
      } else if (daysRemaining === 1) {
        message = `Seu saldo pode ficar negativo amanhã (${formattedDate}), atingindo ${formatCurrency(balanceValue)}.`;
      } else {
        message = `Seu saldo pode ficar negativo hoje (${formattedDate}) ou já está negativo, atingindo ${formatCurrency(balanceValue)}.`;
      }


      return (
        <motion.div
          className="mb-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção: Saldo Futuro Negativo!</AlertTitle>
            <AlertDescription>
              {message} Considere ajustar seus gastos ou aumentar suas receitas.
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    };

    export default LowBalanceWarning;
  