
    import React, { useState, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { formatInputDate } from '@/lib/utils';
    import { isAfter, parseISO, format, addDays } from 'date-fns';

    const RecurringDeleteOptionsDialog = ({
        open,
        onOpenChange,
        originalTransaction,
        onConfirmDelete, // Expects ({ deleteOption: 'all' | 'end', endDate?: string })
        isDeleting,
    }) => {
        const [deleteOption, setDeleteOption] = useState('all'); // 'all', 'end'
        const [endDate, setEndDate] = useState('');
        const [validationError, setValidationError] = useState('');

        const resetState = useCallback(() => {
            setDeleteOption('all');
            setEndDate('');
            setValidationError('');
        }, []);

        const handleOpenChange = useCallback((isOpen) => {
            if (!isOpen) {
                resetState();
            }
            onOpenChange(isOpen);
        }, [onOpenChange, resetState]);

        const getNextDay = (dateString) => {
             if (!dateString) return '';
             try {
                  const date = parseISO(dateString);
                  // The earliest end date should be the day AFTER the start date
                  const nextDay = addDays(date, 1);
                  return format(nextDay, 'yyyy-MM-dd');
             } catch {
                 return '';
             }
         }

        const validateDates = useCallback(() => {
            setValidationError('');
            if (!originalTransaction?.date) {
                 setValidationError('Dados da transação original inválidos.');
                 return false;
            }
            const originalStartDate = parseISO(originalTransaction.date);

            if (deleteOption === 'end') {
                if (!endDate) {
                    setValidationError('Por favor, selecione a data de início do encerramento.');
                    return false;
                }
                const parsedEndDate = parseISO(endDate);
                 if (!isAfter(parsedEndDate, originalStartDate)) {
                     setValidationError('A data de encerramento deve ser posterior à data de início original da transação.');
                     return false;
                 }
            }
            return true;
        }, [deleteOption, endDate, originalTransaction]);

        const handleConfirmClick = useCallback(() => {
            if (!validateDates()) {
                return;
            }

            let options = { deleteOption };
            if (deleteOption === 'end') {
                options.endDate = endDate;
            }

            onConfirmDelete(options);
            // Dialog closing is handled by the caller hook after action completes
        }, [deleteOption, endDate, onConfirmDelete, validateDates]);

        const minEndDate = originalTransaction?.date ? getNextDay(originalTransaction.date) : '';

        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Opções de Exclusão Recorrente</DialogTitle>
                        <DialogDescription>
                            Como você deseja lidar com esta transação recorrente?
                        </DialogDescription>
                    </DialogHeader>

                    <RadioGroup value={deleteOption} onValueChange={setDeleteOption} className="py-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="rd-all" />
                            <Label htmlFor="rd-all">Excluir todas as ocorrências (passadas e futuras)</Label>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="end" id="rd-end" />
                                <Label htmlFor="rd-end">Encerrar recorrência a partir de:</Label>
                            </div>
                            {deleteOption === 'end' && (
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="ml-6 w-[calc(100%-1.5rem)]"
                                    min={minEndDate} // Ensure end date is after original start date
                                    disabled={isDeleting}
                                />
                            )}
                        </div>
                    </RadioGroup>

                    {validationError && (
                        <p className="text-sm text-red-600 mt-2">{validationError}</p>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>Cancelar</Button>
                        <Button onClick={handleConfirmClick} variant="destructive" disabled={isDeleting || !originalTransaction}>
                            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default RecurringDeleteOptionsDialog;
  