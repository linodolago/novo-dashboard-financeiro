
    import React, { useState, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { formatInputDate } from '@/lib/utils'; // Removed parseDateString as it's handled by parseISO
    import { isAfter, parseISO, format } from 'date-fns';

    const RecurringEditOptionsDialog = ({
        open,
        onOpenChange,
        originalTransaction,
        updatedData,
        onConfirm,
        isSubmitting,
    }) => {
        const [editOption, setEditOption] = useState('all'); // 'all', 'future'
        const [futureDate, setFutureDate] = useState('');
        const [validationError, setValidationError] = useState('');

        const resetState = useCallback(() => {
            setEditOption('all');
            setFutureDate('');
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
                 const nextDay = new Date(date.setDate(date.getDate() + 1));
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

            if (editOption === 'future') {
                if (!futureDate) {
                    setValidationError('Por favor, selecione a data de início das alterações.');
                    return false;
                }
                const parsedFutureDate = parseISO(futureDate);
                if (!isAfter(parsedFutureDate, originalStartDate)) {
                    setValidationError('A data de início das alterações deve ser posterior à data de início original da transação.');
                    return false;
                }
            }
            // Removed validation for 'end' option
            return true;
        }, [editOption, futureDate, originalTransaction]);

        const handleConfirmClick = useCallback(() => {
            if (!validateDates()) {
                return;
            }

            let options = {};
            if (editOption === 'future') {
                options.changeEffectiveDate = futureDate;
            }
            // Removed logic for 'end' option and options.newEndDate

            onConfirm(updatedData, options);
        }, [editOption, futureDate, updatedData, onConfirm, validateDates]);

        const minFutureDate = originalTransaction?.date ? getNextDay(originalTransaction.date) : '';

        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Opções de Edição Recorrente</DialogTitle>
                        <DialogDescription>
                            Como você deseja aplicar as alterações a esta transação recorrente?
                        </DialogDescription>
                    </DialogHeader>

                    <RadioGroup value={editOption} onValueChange={setEditOption} className="py-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="r-all" />
                            <Label htmlFor="r-all">Aplicar a todas as ocorrências (passadas e futuras)</Label>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="future" id="r-future" />
                                <Label htmlFor="r-future">Aplicar alterações a partir de:</Label>
                            </div>
                            {editOption === 'future' && (
                                <Input
                                    type="date"
                                    value={futureDate}
                                    onChange={(e) => setFutureDate(e.target.value)}
                                    className="ml-6 w-[calc(100%-1.5rem)]"
                                    min={minFutureDate} // Ensure date is after original start date
                                    disabled={isSubmitting}
                                />
                            )}
                        </div>

                        {/* Removed the entire section for the "Encerrar recorrência" (end) option */}

                    </RadioGroup>

                    {validationError && (
                        <p className="text-sm text-red-600 mt-2">{validationError}</p>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                        <Button onClick={handleConfirmClick} disabled={isSubmitting || !originalTransaction}>
                            {isSubmitting ? 'Salvando...' : 'Confirmar Edição'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default RecurringEditOptionsDialog;
  