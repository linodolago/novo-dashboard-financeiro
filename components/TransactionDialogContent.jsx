
    import React from 'react';
    import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import TransactionDialogFormFields from './TransactionDialogFormFields';
    import TransactionDialogFooter from './TransactionDialogFooter';

    const TransactionDialogContent = ({
        handleSubmit,
        isEditing,
        transactionType,
        description, setDescription,
        amount, setAmount,
        category, setCategory,
        paymentMethod, setPaymentMethod,
        bankAccount, setBankAccount,
        frequency, setFrequency,
        date, setDate,
        categories,
        paymentMethods,
        banks,
        openAddBankDialog,
        isSubmitting,
        isSubmitDisabled,
    }) => {
        return (
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">
                        {isEditing ? `Editar ${transactionType === 'income' ? 'Receita' : 'Despesa'}` : `Nova ${transactionType === 'income' ? 'Receita' : 'Despesa'}`}
                    </DialogTitle>
                </DialogHeader>

                <TransactionDialogFormFields
                    description={description} setDescription={setDescription}
                    amount={amount} setAmount={setAmount}
                    category={category} setCategory={setCategory}
                    paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                    bankAccount={bankAccount} setBankAccount={setBankAccount}
                    frequency={frequency} setFrequency={setFrequency}
                    date={date} setDate={setDate}
                    type={transactionType}
                    categories={categories}
                    paymentMethods={paymentMethods}
                    banks={banks}
                    onOpenAddBankDialog={openAddBankDialog}
                    isSubmitting={isSubmitting}
                    isEditing={isEditing}
                />

                <TransactionDialogFooter
                    isSubmitting={isSubmitting}
                    isEditing={isEditing}
                    transactionType={transactionType}
                    isSubmitDisabled={isSubmitDisabled}
                />
            </form>
        );
    };

    export default TransactionDialogContent;
  