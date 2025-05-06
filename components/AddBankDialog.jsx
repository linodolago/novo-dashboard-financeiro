
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    const AddBankDialog = ({ open, onOpenChange, onAddBank }) => {
        const [bankName, setBankName] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Reset name when dialog opens/closes
        useEffect(() => {
            if (!open) {
                setBankName('');
                setIsSubmitting(false);
            }
        }, [open]);

        const handleConfirmAdd = async () => {
            if (!bankName.trim()) return; // Basic validation

            setIsSubmitting(true);
            const success = await onAddBank(bankName.trim());
            setIsSubmitting(false);

            if (success) {
                onOpenChange(false); // Close dialog on successful addition
            }
            // Error toast is handled within the onAddBank function (useBanks hook)
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Banco</DialogTitle>
                        <DialogDescription>
                            Digite o nome do novo banco que deseja adicionar à lista.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-bank-name">Nome do Banco</Label>
                            <Input
                                id="new-bank-name"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="Ex: Banco Inter"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                              Cancelar
                            </Button>
                         </DialogClose>
                        <Button
                            type="button"
                            onClick={handleConfirmAdd}
                            disabled={isSubmitting || !bankName.trim()}
                        >
                            {isSubmitting ? 'Adicionando...' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default AddBankDialog;
  