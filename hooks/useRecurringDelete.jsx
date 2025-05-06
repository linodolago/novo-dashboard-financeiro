
    import React, { useState, useCallback } from 'react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import RecurringDeleteOptionsDialog from '@/components/RecurringDeleteOptionsDialog'; // Import the new dialog
    import { buttonVariants } from '@/components/ui/button';
    import { useFinance } from '@/context/FinanceContext'; // To call deleteTransaction

    const useRecurringDelete = () => {
        const { deleteTransaction } = useFinance();
        const [isSimpleConfirmOpen, setIsSimpleConfirmOpen] = useState(false);
        const [isRecurringOptionsOpen, setIsRecurringOptionsOpen] = useState(false);
        const [transactionToDelete, setTransactionToDelete] = useState(null);
        const [isDeleting, setIsDeleting] = useState(false); // Loading state

        const openDeleteDialog = useCallback((transaction) => {
            if (!transaction || !transaction.id) {
                console.error("Invalid transaction passed to openDeleteDialog");
                return;
            }
            setTransactionToDelete(transaction);
            if (transaction.frequency === 'once') {
                setIsSimpleConfirmOpen(true);
            } else {
                setIsRecurringOptionsOpen(true);
            }
        }, []);

        const closeDialogs = useCallback(() => {
            setTransactionToDelete(null);
            setIsSimpleConfirmOpen(false);
            setIsRecurringOptionsOpen(false);
            setIsDeleting(false);
        }, []);

        // Handler for the simple confirmation (non-recurring)
        const handleSimpleConfirm = useCallback(async () => {
            if (!transactionToDelete) return;
            setIsDeleting(true);
            const success = await deleteTransaction(transactionToDelete.id, transactionToDelete.type);
            setIsDeleting(false);
            if (success) {
                closeDialogs();
            }
            // Toast notifications are handled within deleteTransaction hook
        }, [transactionToDelete, deleteTransaction, closeDialogs]);

        // Handler for the recurring options confirmation
        const handleRecurringConfirm = useCallback(async (options) => {
            if (!transactionToDelete || !options) return;

            setIsDeleting(true);
            let success = false;
            if (options.deleteOption === 'all') {
                // Call delete without endDate
                success = await deleteTransaction(transactionToDelete.id, transactionToDelete.type);
            } else if (options.deleteOption === 'end' && options.endDate) {
                // Call delete with endDate
                success = await deleteTransaction(transactionToDelete.id, transactionToDelete.type, { endDate: options.endDate });
            } else {
                 console.error("Invalid options received in handleRecurringConfirm", options);
                 setIsDeleting(false);
                 return; // Should not happen with proper validation in dialog
            }

            setIsDeleting(false);
             // Close dialogs regardless of success/failure, toast is handled internally
             closeDialogs();

        }, [transactionToDelete, deleteTransaction, closeDialogs]);


        // Component for the simple confirmation dialog
        const SimpleConfirmationDialog = useCallback(() => (
            <AlertDialog open={isSimpleConfirmOpen} onOpenChange={(open) => !open && closeDialogs()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                             Tem certeza que deseja excluir "{transactionToDelete?.description}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialogs} disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSimpleConfirm} className={buttonVariants({ variant: "destructive" })} disabled={isDeleting}>
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        ), [isSimpleConfirmOpen, transactionToDelete, closeDialogs, handleSimpleConfirm, isDeleting]);

        // Component rendering the recurring options dialog
        const RecurringOptionsDialogComponent = useCallback(() => (
            transactionToDelete && transactionToDelete.frequency !== 'once' ? (
                <RecurringDeleteOptionsDialog
                    open={isRecurringOptionsOpen}
                    onOpenChange={(open) => !open && closeDialogs()}
                    originalTransaction={transactionToDelete}
                    onConfirmDelete={handleRecurringConfirm}
                    isDeleting={isDeleting}
                />
            ) : null // Only render if needed
        ), [isRecurringOptionsOpen, transactionToDelete, closeDialogs, handleRecurringConfirm, isDeleting]);

        return {
            openDeleteDialog,
            SimpleConfirmationDialog,
            RecurringOptionsDialogComponent
        };
    };

    export default useRecurringDelete;
  