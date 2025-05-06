
    import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { Plus } from 'lucide-react';

    const TransactionDialogFormFields = ({
        description, setDescription,
        amount, setAmount,
        category, setCategory, // Expecting category ID
        paymentMethod, setPaymentMethod,
        bankAccount, setBankAccount, // Expecting bank ID
        frequency, setFrequency,
        date, setDate,
        type, // 'income' or 'expense'
        categories, // List of { id, name, ... }
        paymentMethods, // List of { id, name, ... } - Assuming simple structure
        banks, // List of { id, name, ... }
        onOpenAddBankDialog,
        isSubmitting
    }) => {
        return (
            <div className="grid gap-4 py-4">
                {/* Description */}
                <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                        id="description"
                        placeholder="Digite a descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Amount */}
                <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                        id="amount"
                        placeholder="R$ 0,00"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                 {/* Bank Account (Only for Income) */}
                 {type === 'income' && (
                     <div className="grid gap-2">
                         <div className="flex items-center justify-between mb-1">
                             <Label htmlFor="bankAccount">Banco</Label>
                             <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onOpenAddBankDialog}
                                disabled={isSubmitting}
                                className="p-1 h-auto"
                             >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar Banco
                             </Button>
                         </div>
                         {/* Set value to bank.id */}
                         <Select value={bankAccount || ''} onValueChange={setBankAccount} required disabled={isSubmitting}>
                             <SelectTrigger id="bankAccount">
                                 <SelectValue placeholder="Selecione o banco" />
                             </SelectTrigger>
                             <SelectContent>
                                 {banks.length > 0 ? (
                                     banks.map((bank) => (
                                         <SelectItem key={bank.id} value={bank.id}>
                                             {bank.name}
                                         </SelectItem>
                                     ))
                                 ) : (
                                     <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum banco cadastrado. Clique em 'Adicionar Banco'.</div>
                                 )}
                             </SelectContent>
                         </Select>
                     </div>
                 )}


                {/* Expense Fields */}
                {type === 'expense' && (
                    <>
                        {/* Category Select */}
                         <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                             {/* Set value to cat.id */}
                             <Select value={category || ''} onValueChange={setCategory} required disabled={isSubmitting}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma categoria disponível.</div>
                                    )}
                                </SelectContent>
                            </Select>
                         </div>

                        {/* Payment Method */}
                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                            {/* Assuming paymentMethods have simple 'name' as value for now */}
                            <Select value={paymentMethod || ''} onValueChange={setPaymentMethod} required disabled={isSubmitting}>
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.id} value={method.name}>
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}

                {/* Frequency */}
                <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select value={frequency || 'once'} onValueChange={setFrequency} required disabled={isSubmitting}>
                        <SelectTrigger id="frequency">
                            <SelectValue placeholder="Selecionar frequência" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="once">Única</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date */}
                <div className="grid gap-2">
                    <Label htmlFor="date">Data (Início)</Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                        aria-describedby="date-description"
                    />
                     <p id="date-description" className="text-xs text-muted-foreground">
                        Para transações recorrentes, esta é a data de início.
                     </p>
                </div>
            </div>
        );
    };

    export default TransactionDialogFormFields;
  