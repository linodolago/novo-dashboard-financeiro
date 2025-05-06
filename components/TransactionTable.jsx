
    import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
    import { formatCurrency, parseDateString } from '@/lib/utils';
    import { format } from 'date-fns';

    const TransactionTable = ({ transactions, type, onEditClick, onDeleteClick }) => {
        if (!transactions || transactions.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-4">
                    Nenhuma transação encontrada neste grupo.
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-muted-foreground">Descrição</TableHead>
                        <TableHead className="text-muted-foreground">Data</TableHead>
                        {type === 'expense' && <TableHead className="text-muted-foreground">Categoria</TableHead>}
                        <TableHead className="text-muted-foreground">Forma Pag.</TableHead>
                        <TableHead className="text-muted-foreground">Frequência</TableHead>
                        <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                        <TableHead className="w-[50px] text-center text-muted-foreground">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className={`hover:bg-muted/50 ${transaction.isRecurringInstance ? 'opacity-70 italic' : ''}`}>
                            <TableCell className="font-medium text-foreground">{transaction.description}</TableCell>
                            <TableCell className="text-foreground">{format(parseDateString(transaction.date), 'dd/MM/yyyy')}</TableCell>
                            {type === 'expense' && <TableCell className="text-foreground">{transaction.category || 'N/A'}</TableCell>}
                            <TableCell className="text-foreground">{transaction.paymentMethod || 'N/A'}</TableCell>
                            <TableCell className="text-foreground">
                                {transaction.frequency === 'once' ? 'Única' :
                                    transaction.frequency === 'monthly' ? 'Mensal' :
                                        transaction.frequency === 'yearly' ? 'Anual' : transaction.frequency}
                                {transaction.isRecurringInstance ? ' (Rec.)' : ''}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditClick(transaction)} className="cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDeleteClick(transaction)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50 cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Excluir</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    export default TransactionTable;
  