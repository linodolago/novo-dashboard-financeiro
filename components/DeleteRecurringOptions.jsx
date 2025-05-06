
    import React from 'react';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { formatInputDate } from '@/lib/utils';
    import { parseISO } from 'date-fns';

    const DeleteRecurringOptions = ({
        deleteOption,
        setDeleteOption,
        endDate,
        setEndDate,
        originalStartDate,
        isSubmitting,
    }) => {
        if (!originalStartDate) return null; // Need start date for min attribute

        return (
            <RadioGroup value={deleteOption} onValueChange={setDeleteOption} className="py-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="del-all-option" disabled={isSubmitting} />
                    <Label htmlFor="del-all-option">Excluir todas as ocorrências (passadas e futuras)</Label>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="future" id="del-future-option" disabled={isSubmitting}/>
                        <Label htmlFor="del-future-option">Encerrar recorrência a partir de:</Label>
                    </div>
                    {deleteOption === 'future' && (
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="ml-6 w-[calc(100%-1.5rem)]"
                            min={formatInputDate(new Date(originalStartDate))} // Prevent selecting before original start
                            disabled={isSubmitting}
                            // Prevent event propagation that might close the dialog
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault(); // Add preventDefault here
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onBlur={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            </RadioGroup>
        );
    };

    export default DeleteRecurringOptions;
  