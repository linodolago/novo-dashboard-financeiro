
    import React, { useState, useMemo, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import { formatCurrency, parseDateString } from '@/lib/utils';
    import { compareDesc, compareAsc } from 'date-fns';
    import { useFinance } from '@/context/FinanceContext';
    import TransactionDialog from './TransactionDialog';
    import TransactionTable from './TransactionTable';
    import { useToast } from '@/components/ui/use-toast';
    import useDeleteConfirmation from '@/hooks/useDeleteConfirmation'; // Import the extracted hook

    // Helper to separate and sort transactions
    const categorizeAndSortTransactions = (transactions) => {
        const recurring = [];
        const spot = [];
        let recTotal = 0;
        let spTotal = 0;

        transactions.forEach(t => {
            if (t.frequency !== 'once' || t.isRecurringInstance) {
                recurring.push(t);
                recTotal += t.amount;
            } else {
                spot.push(t);
                spTotal += t.amount;
            }
        });

        spot.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : parseDateString(a.date);
            const dateB = b.createdAt ? new Date(b.createdAt) : parseDateString(b.date);
            return compareDesc(dateA, dateB);
        });

        recurring.sort((a, b) => compareAsc(parseDateString(a.date), parseDateString(b.date)));

        return {
            recurringTransactions: recurring,
            spotTransactions: spot,
            recurringTotal: recTotal,
            spotTotal: spTotal
        };
    };

    const TransactionListView = ({ open, onOpenChange, type, transactions }) => {
        const { deleteTransaction, transactions: persistedTransactions } = useFinance(); // Renamed for clarity
        const { toast } = useToast();
        const [editDialogOpen, setEditDialogOpen] = useState(false);
        const [transactionToEdit, setTransactionToEdit] = useState(null);

        const title = type === 'income' ? 'Receitas do Mês' : 'Despesas do Mês';
        const description = type === 'income' ? 'Lista de todas as receitas registradas no mês atual.' : 'Lista de todas as despesas registradas no mês atual.';

        const {
            recurringTransactions,
            spotTransactions,
            recurringTotal,
            spotTotal
        } = useMemo(() => categorizeAndSortTransactions(transactions), [transactions]);

        // Safely find the original transaction definition
        const findOriginalTransaction = useCallback((transactionInstance) => {
            // Ensure persistedTransactions is available and is an array before searching
            if (!Array.isArray(persistedTransactions)) {
                console.error("Persisted transactions not available yet for finding original.");
                return null; // Return null if data isn't ready
            }
            if (!transactionInstance) return null;

            if (transactionInstance.isRecurringInstance && transactionInstance.original_id) {
                return persistedTransactions.find(t => t.id === transactionInstance.original_id);
            }
            // If it's not an instance or doesn't have original_id, try finding by its own id (for spot or initial recurring)
            return persistedTransactions.find(t => t.id === transactionInstance.id);
        }, [persistedTransactions]);

        const handleActualDelete = useCallback(async (transactionToDelete) => {
            // Use the original transaction ID for deletion
            if (!transactionToDelete?.id) {
                 toast({ title: "Erro", description: "ID da transação inválido para exclusão.", variant: "destructive" });
                 return;
            }
            await deleteTransaction(transactionToDelete.id, transactionToDelete.type);
        }, [deleteTransaction, toast]);

        const { openDialog: openDeleteDialog, ConfirmationDialog: DeleteConfirmationDialog } = useDeleteConfirmation(handleActualDelete);

        const handleDeleteClick = useCallback((transaction) => {
            const originalTransaction = findOriginalTransaction(transaction);
            if (!originalTransaction) {
                toast({
                    title: "Erro",
                    description: "Não foi possível encontrar a transação original para exclusão. Tente novamente mais tarde.",
                    variant: "destructive",
                });
                return;
            }
            openDeleteDialog(originalTransaction);
        }, [findOriginalTransaction, openDeleteDialog, toast]);

        const handleEditClick = useCallback((transaction) => {
             const originalTransaction = findOriginalTransaction(transaction);
             if (!originalTransaction) {
                 toast({
                     title: "Erro",
                     description: "Não foi possível encontrar a transação original para edição. Tente novamente mais tarde.",
                     variant: "destructive",
                 });
                 return;
             }
             setTransactionToEdit(originalTransaction);
             setEditDialogOpen(true);
        }, [findOriginalTransaction, toast]);


        return (
            <>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-card-foreground">{title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {description}
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-grow overflow-y-auto pr-4 -mr-4">
                            <Accordion type="multiple" defaultValue={['recurring', 'spot']} className="w-full">
                                <AccordionItem value="recurring" className="border rounded-md mb-4 shadow-sm bg-background">
                                    <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">
                                        <div className="flex justify-between w-full items-center">
                                            <span>Recorrentes ({recurringTransactions.length})</span>
                                            <span className={`font-semibold mr-4 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(recurringTotal)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4">
                                        <TransactionTable
                                            transactions={recurringTransactions}
                                            type={type}
                                            onEditClick={handleEditClick}
                                            onDeleteClick={handleDeleteClick}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="spot" className="border rounded-md shadow-sm bg-background">
                                    <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">
                                        <div className="flex justify-between w-full items-center">
                                            <span>Pontuais ({spotTransactions.length})</span>
                                             <span className={`font-semibold mr-4 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(spotTotal)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4">
                                         <TransactionTable
                                            transactions={spotTransactions}
                                            type={type}
                                            onEditClick={handleEditClick}
                                            onDeleteClick={handleDeleteClick}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                             {transactions.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    Nenhuma transação encontrada para este mês.
                                </div>
                            )}

                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                {transactionToEdit && (
                    <TransactionDialog
                        key={`edit-${transactionToEdit.id}`}
                        open={editDialogOpen}
                        onOpenChange={(isOpen) => {
                            setEditDialogOpen(isOpen);
                            if (!isOpen) setTransactionToEdit(null);
                        }}
                        type={transactionToEdit.type}
                        transactionToEdit={transactionToEdit}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog />
            </>
        );
    };

    export default TransactionListView;
  