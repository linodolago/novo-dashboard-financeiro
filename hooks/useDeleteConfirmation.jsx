
    import React, { useState, useCallback } from 'react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import { buttonVariants } from '@/components/ui/button';

    const useDeleteConfirmation = (onConfirm) => {
        const [isOpen, setIsOpen] = useState(false);
        const [itemToDelete, setItemToDelete] = useState(null);

        const openDialog = useCallback((item) => {
            setItemToDelete(item);
            setIsOpen(true);
        }, []);

        const closeDialog = useCallback(() => {
            setItemToDelete(null);
            setIsOpen(false);
        }, []);

        const handleConfirm = useCallback(() => {
            if (itemToDelete) {
                onConfirm(itemToDelete);
            }
            closeDialog();
        }, [itemToDelete, onConfirm, closeDialog]);

        const ConfirmationDialog = useCallback(() => (
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                             Tem certeza que deseja excluir "{itemToDelete?.description}"? Esta ação não pode ser desfeita e removerá a transação original e todas as suas ocorrências futuras (se aplicável).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} className={buttonVariants({ variant: "destructive" })}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        ), [isOpen, itemToDelete, closeDialog, handleConfirm]);

        return { openDialog, ConfirmationDialog };
    };

    export default useDeleteConfirmation;
  