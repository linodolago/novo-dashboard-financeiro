
    import React from 'react';
    import { DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';

    const TransactionDialogFooter = ({
        isSubmitting,
        isEditing,
        transactionType,
        isSubmitDisabled,
    }) => {
        return (
            <DialogFooter className="mt-6">
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={isSubmitDisabled}
                >
                    {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : `Adicionar ${transactionType === 'income' ? 'Receita' : 'Despesa'}`)}
                </Button>
            </DialogFooter>
        );
    };

    export default TransactionDialogFooter;
  