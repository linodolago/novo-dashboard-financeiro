
    import React from 'react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import { buttonVariants } from '@/components/ui/button';

    const DeleteTransactionDialog = ({ open, onOpenChange, transactionToDelete, onConfirm }) => {
      return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a transação "{transactionToDelete?.description}"? Esta ação não pode ser desfeita e removerá a transação original e todas as suas ocorrências futuras (se aplicável).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default DeleteTransactionDialog;
  