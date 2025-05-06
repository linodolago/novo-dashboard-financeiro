
    import React, { useState, useEffect, useRef } from 'react';
        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        import { Label } from '@/components/ui/label';
        import { useFinance } from '@/context/FinanceContext';
        import { formatInputDate, parseDateString, formatCurrency } from '@/lib/utils';
        import { isAfter, startOfDay, format, isValid } from 'date-fns'; // Import isValid

        const UpdateRecurringDialog = ({ open, onOpenChange, transactionToUpdate }) => {
            const { updateRecurringValueFromDate } = useFinance();
            const [newAmount, setNewAmount] = useState('');
            const [effectiveDate, setEffectiveDate] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [errorMessage, setErrorMessage] = useState('');
            const inputRef = useRef(null);
            const prevOpen = useRef(open);

            const originalAmount = transactionToUpdate?.amount || 0;
            // Parse and validate original start date immediately
            const parsedOriginalStartDate = transactionToUpdate?.date ? startOfDay(parseDateString(transactionToUpdate.date)) : null;
            const isOriginalStartDateValid = parsedOriginalStartDate && isValid(parsedOriginalStartDate);


            useEffect(() => {
                if (open && !prevOpen.current && transactionToUpdate) {
                    const initialValue = transactionToUpdate.amount.toString().replace('.', ',');
                    setNewAmount(initialValue);

                    if (isOriginalStartDateValid) {
                        const today = startOfDay(new Date());
                        // Default date logic based on valid original start date
                        const defaultDate = isAfter(parsedOriginalStartDate, today)
                                            ? new Date(parsedOriginalStartDate.getTime() + 86400000) // Day after original start
                                            : today; // Today
                        setEffectiveDate(formatInputDate(defaultDate));
                        setErrorMessage(''); // Clear previous errors
                    } else {
                        // Fallback if original start date is invalid
                        setEffectiveDate(formatInputDate(new Date()));
                        setErrorMessage('Erro interno: Data de início original da transação é inválida.');
                    }
                     setTimeout(() => inputRef.current?.focus(), 100);
                }

                if (!open && prevOpen.current) {
                    setNewAmount('');
                    setEffectiveDate('');
                    setErrorMessage('');
                    setIsSubmitting(false);
                }
                prevOpen.current = open;
            }, [open, transactionToUpdate, isOriginalStartDateValid, parsedOriginalStartDate]); // Use validated date state


            const validateInput = () => {
                 const cleanedAmount = newAmount.replace(',', '.');
                 const parsedAmount = parseFloat(cleanedAmount);
                 const parsedEffectiveDate = effectiveDate ? startOfDay(parseDateString(effectiveDate)) : null; // Use startOfDay here

                 if (isNaN(parsedAmount) || parsedAmount < 0) {
                     return "O novo valor deve ser um número positivo ou zero.";
                 }
                 if (!effectiveDate || !parsedEffectiveDate || !isValid(parsedEffectiveDate)) { // Check isValid
                     return "A data de início da alteração é obrigatória e deve ser válida.";
                 }
                  if (!isOriginalStartDateValid) { // Use the validated state
                      return "Erro interno: A data de início original da transação é inválida.";
                  }

                 // Ensure effective date is strictly after original start date (comparing day only)
                 if (!isAfter(parsedEffectiveDate, parsedOriginalStartDate)) {
                     return "A data de início da alteração deve ser estritamente posterior à data de início original da transação.";
                 }
                 return '';
            };


            const handleSubmit = async (e) => {
                e.preventDefault();
                setErrorMessage('');

                const validationError = validateInput();
                 if (validationError) {
                     setErrorMessage(validationError);
                     return;
                 }

                if (!transactionToUpdate?.id) {
                     setErrorMessage("Erro: ID da transação original não encontrado.");
                    return;
                }

                const cleanedAmount = newAmount.replace(',', '.');
                const finalAmount = parseFloat(cleanedAmount);

                setIsSubmitting(true);
                const success = await updateRecurringValueFromDate(
                    transactionToUpdate.id,
                    finalAmount,
                    effectiveDate // Pass the original string format
                );

                if (success) {
                    onOpenChange(false);
                } else {
                    // Keep the dialog open, error message is shown via toast by the hook
                     setIsSubmitting(false);
                }
            };

            const handleAmountChange = (e) => {
                setNewAmount(e.target.value);
            };


            const handleOpenChangeWrapper = (isOpen) => {
                if (!isSubmitting) {
                    onOpenChange(isOpen);
                }
            };

             // Format valid original start date, otherwise show N/A
            const formattedOriginalStartDate = isOriginalStartDateValid ? format(parsedOriginalStartDate, 'dd/MM/yyyy') : 'N/A';

            return (
                <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
                    <DialogContent className="sm:max-w-[450px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">Atualizar Valor Recorrente</DialogTitle>
                                <DialogDescription>
                                    Altere o valor de "{transactionToUpdate?.description}" a partir de uma data específica. O valor anterior ({formatCurrency(originalAmount)}) será mantido até a data anterior à selecionada.
                                </DialogDescription>
                            </DialogHeader>

                             <div className="grid gap-4 py-4">
                                 <div className="grid gap-2">
                                     <Label htmlFor="new-amount">Novo Valor</Label>
                                     <Input
                                         ref={inputRef}
                                         id="new-amount"
                                         placeholder="R$ 0,00"
                                         type="text"
                                         inputMode="decimal"
                                         value={newAmount}
                                         onChange={handleAmountChange}
                                         required
                                         disabled={isSubmitting}
                                     />
                                 </div>
                                 <div className="grid gap-2">
                                     <Label htmlFor="effective-date">Aplicar Novo Valor a Partir de</Label>
                                     <Input
                                         id="effective-date"
                                         type="date"
                                         value={effectiveDate}
                                         onChange={(e) => setEffectiveDate(e.target.value)}
                                         required
                                         disabled={isSubmitting || !isOriginalStartDateValid} // Disable if original date is invalid
                                         aria-describedby="date-help"
                                     />
                                     <p id="date-help" className="text-xs text-muted-foreground">
                                         O novo valor será aplicado neste dia e nos meses/anos seguintes. A data deve ser posterior à data de início original ({formattedOriginalStartDate}).
                                     </p>
                                 </div>

                                 {errorMessage && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                                 )}
                             </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50"
                                    disabled={isSubmitting || !isOriginalStartDateValid} // Disable submit if original date invalid
                                >
                                    {isSubmitting ? 'Atualizando...' : 'Confirmar Atualização'}
                                </Button>
                                 <Button type="button" variant="outline" onClick={() => handleOpenChangeWrapper(false)} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            );
        };

        export default UpdateRecurringDialog;
  