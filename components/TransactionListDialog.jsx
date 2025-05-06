
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

const TransactionListDialog = ({ open, onOpenChange }) => {
  const { currentMonthTransactions, deleteTransaction, currentDate } = useFinance();

  // Sort transactions by date, most recent first
  const sortedTransactions = [...currentMonthTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Descending order
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Transações de {getMonthName(currentDate)}
          </DialogTitle>
          <DialogDescription>
            Lista de todas as receitas e despesas registradas neste mês.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] md:h-[500px] border rounded-md mt-4"> {/* Added ScrollArea */}
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[150px]">Categoria</TableHead>
                <TableHead className="w-[150px]">Pagamento</TableHead>
                <TableHead className="text-right w-[120px]">Valor</TableHead>
                <TableHead className="text-center w-[50px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className={transaction.isRecurringInstance ? 'opacity-70' : ''}>
                    <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category || 'N/A'}</TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {!transaction.isRecurringInstance && ( // Only allow deleting original transactions
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                           onClick={() => deleteTransaction(transaction.id)}
                           aria-label="Excluir transação"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      )}
                       {transaction.isRecurringInstance && (
                         <span className="text-xs text-gray-400" title="Instância recorrente, edite a original para alterar.">Rec.</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Nenhuma transação encontrada para este mês.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionListDialog;
