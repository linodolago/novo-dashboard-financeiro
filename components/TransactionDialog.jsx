
    import React from 'react';
    import { Dialog, DialogContent } from '@/components/ui/dialog';
    import TransactionDialogContent from './TransactionDialogContent'; // Import the new content component
    import AddBankDialog from './AddBankDialog';
    import RecurringEditOptionsDialog from './RecurringEditOptionsDialog';
    import { useTransactionDialog } from '@/hooks/useTransactionDialog';

    const TransactionDialog = ({ open, onOpenChange, type, transactionToEdit = null }) => {
        const hookResult = useTransactionDialog(type, transactionToEdit, onOpenChange);
        const {
            // Core State
            description, amount, category, paymentMethod, bankAccount, frequency, date,
            isEditing, transactionType, originalTransactionData, pendingUpdateData,

            // Visibility State
            isSubmitting, isAddBankDialogOpen, isRecurringEditOptionsOpen,

            // Core Setters (Now correctly returned)
            setDescription, setAmount, setCategory, setPaymentMethod, setBankAccount,
            setFrequency, setDate,

            // Visibility Setters
            setIsAddBankDialogOpen, setIsRecurringEditOptionsOpen, handleMainDialogOpenChange,

            // Validation
            validateForm,

            // Data Lists
            categories, paymentMethods, banks,

            // Actions
            handleSubmit, handleAddBankAction, handleConfirmedUpdate,
        } = hookResult;

        const validationResult = validateForm();
        const isSubmitDisabled = isSubmitting || isRecurringEditOptionsOpen || !validationResult.valid;

        const openAddBankDialog = () => setIsAddBankDialogOpen(true);

        return (
            <>
                {/* Main Transaction Dialog */}
                <Dialog open={open && !isRecurringEditOptionsOpen} onOpenChange={handleMainDialogOpenChange}>
                    <DialogContent className="sm:max-w-[480px]">
                        <TransactionDialogContent
                            handleSubmit={handleSubmit}
                            isEditing={isEditing}
                            transactionType={transactionType}
                            description={description} setDescription={setDescription}
                            amount={amount} setAmount={setAmount}
                            category={category} setCategory={setCategory}
                            paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                            bankAccount={bankAccount} setBankAccount={setBankAccount}
                            frequency={frequency} setFrequency={setFrequency}
                            date={date} setDate={setDate}
                            categories={categories}
                            paymentMethods={paymentMethods}
                            banks={banks}
                            openAddBankDialog={openAddBankDialog}
                            isSubmitting={isSubmitting}
                            isSubmitDisabled={isSubmitDisabled}
                        />
                    </DialogContent>
                </Dialog>

                {/* Add Bank Dialog */}
                <AddBankDialog
                     open={isAddBankDialogOpen}
                     onOpenChange={setIsAddBankDialogOpen}
                     onAddBank={handleAddBankAction}
                     isSubmitting={isSubmitting}
                />

                {/* Recurring Edit Options Dialog */}
                {originalTransactionData && (
                    <RecurringEditOptionsDialog
                        open={isRecurringEditOptionsOpen}
                        onOpenChange={setIsRecurringEditOptionsOpen}
                        originalTransaction={originalTransactionData}
                        updatedData={pendingUpdateData}
                        onConfirm={handleConfirmedUpdate}
                        isSubmitting={isSubmitting}
                    />
                )}
            </>
        );
    };

    export default TransactionDialog;
  