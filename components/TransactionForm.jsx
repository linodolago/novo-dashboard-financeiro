
    import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { Plus } from 'lucide-react';

    // --- Helper: Add Category UI ---
    const AddCategoryUI = ({ newCategoryName, setNewCategoryName, handleAddCategory, setShowAddCategory, isSubmitting }) => (
        <div className="flex gap-2 items-center">
            <Input
                id="new-category"
                placeholder="Nome da nova categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isSubmitting}
                className="flex-grow"
            />
            <Button type="button" size="icon" onClick={handleAddCategory} disabled={isSubmitting || !newCategoryName.trim()} aria-label="Adicionar Categoria">
                <Plus className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCategory(false)} disabled={isSubmitting}>
                Cancelar
            </Button>
        </div>
    );

    // --- Helper: Category Select/Add ---
     const CategorySelectOrAdd = ({ category, setCategory, categories, showAddCategory, setShowAddCategory, newCategoryName, setNewCategoryName, handleAddCategory, isSubmitting }) => (
        <div className="grid gap-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={showAddCategory ? "new-category" : "category"}>Categoria</Label>
                {!showAddCategory && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-500 hover:bg-blue-50"
                        onClick={() => setShowAddCategory(true)}
                        disabled={isSubmitting}
                    >
                        Nova Categoria
                        <Plus className="ml-1 h-4 w-4" />
                    </Button>
                )}
            </div>

            {showAddCategory ? (
                <AddCategoryUI
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    handleAddCategory={handleAddCategory}
                    setShowAddCategory={setShowAddCategory}
                    isSubmitting={isSubmitting}
                />
            ) : (
                 <Select value={category} onValueChange={setCategory} required disabled={isSubmitting}>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma categoria encontrada.</div>
                        )}
                    </SelectContent>
                 </Select>
            )}
        </div>
     );


    // --- Main Form Component ---
    const TransactionForm = ({
        description, setDescription,
        amount, setAmount,
        category, setCategory,
        paymentMethod, setPaymentMethod,
        frequency, setFrequency,
        date, setDate,
        endDate, setEndDate,
        type,
        categories,
        paymentMethods,
        showAddCategory, setShowAddCategory,
        newCategoryName, setNewCategoryName,
        handleAddCategory,
        isSubmitting,
        errorMessage
    }) => {
        return (
            <>
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

                    {/* Expense Fields */}
                    {type === 'expense' && (
                        <>
                            {/* Category */}
                             <CategorySelectOrAdd
                                 category={category}
                                 setCategory={setCategory}
                                 categories={categories}
                                 showAddCategory={showAddCategory}
                                 setShowAddCategory={setShowAddCategory}
                                 newCategoryName={newCategoryName}
                                 setNewCategoryName={setNewCategoryName}
                                 handleAddCategory={handleAddCategory}
                                 isSubmitting={isSubmitting}
                             />

                            {/* Payment Method */}
                            <div className="grid gap-2">
                                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod} required disabled={isSubmitting}>
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
                        <Select value={frequency} onValueChange={setFrequency} required disabled={isSubmitting}>
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

                    {/* Start Date */}
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

                     {/* End Date (Optional, relevant for recurring) */}
                    {frequency !== 'once' && (
                         <div className="grid gap-2">
                            <Label htmlFor="end-date">Data Final (Opcional)</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={isSubmitting}
                                aria-describedby="end-date-description"
                            />
                            <p id="end-date-description" className="text-xs text-muted-foreground">
                                Deixe em branco para que a recorrência continue indefinidamente. Se preenchido, a última ocorrência será na data final.
                            </p>
                         </div>
                     )}
                </div>
                 {errorMessage && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errorMessage}</p>
                 )}
            </>
        );
    };

    export default TransactionForm;
  