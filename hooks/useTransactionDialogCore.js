
    import React, { useState, useEffect, useCallback } from 'react';
    import { formatInputDate } from '@/lib/transactionUtils';

    export function useTransactionDialogCore(type, transactionToEdit) {
        const [description, setDescription] = useState('');
        const [amount, setAmount] = useState('');
        const [category, setCategory] = useState(''); // Will store category ID
        const [paymentMethod, setPaymentMethod] = useState('');
        const [bankAccount, setBankAccount] = useState(''); // Will store bank ID
        const [frequency, setFrequency] = useState('once');
        const [date, setDate] = useState(formatInputDate(new Date()));
        const [isEditing, setIsEditing] = useState(false);
        const [transactionType, setTransactionType] = useState(type || 'expense');
        const [effectiveTransactionId, setEffectiveTransactionId] = useState(null); // ID of the transaction being edited

        // State to hold the original data when editing, useful for comparisons or reverting
        const [originalTransactionData, setOriginalTransactionData] = useState(null);
        // State to hold the data payload just before showing recurring options
        const [pendingUpdateData, setPendingUpdateData] = useState(null);


        const resetFormState = useCallback(() => {
            setDescription('');
            setAmount('');
            setCategory('');
            setPaymentMethod('');
            setBankAccount('');
            setFrequency('once');
            setDate(formatInputDate(new Date()));
            setIsEditing(false);
            setEffectiveTransactionId(null);
            setOriginalTransactionData(null);
            setPendingUpdateData(null);
            // Keep transactionType as is unless specified otherwise
        }, []);

        // Effect to populate form when transactionToEdit changes
        useEffect(() => {
            if (transactionToEdit) {
                setDescription(transactionToEdit.description || '');
                setAmount(String(transactionToEdit.amount || ''));
                // Use the IDs for category and bank account state
                setCategory(transactionToEdit.category_id || '');
                setPaymentMethod(transactionToEdit.payment_method || '');
                setBankAccount(transactionToEdit.bank_account_id || '');
                setFrequency(transactionToEdit.frequency || 'once');
                setDate(formatInputDate(transactionToEdit.date));
                setIsEditing(true);
                setTransactionType(transactionToEdit.type || 'expense');
                setEffectiveTransactionId(transactionToEdit.id);
                setOriginalTransactionData(transactionToEdit); // Store original data
            } else {
                resetFormState();
                setTransactionType(type || 'expense'); // Reset type if needed
            }
        }, [transactionToEdit, type, resetFormState]);


        // Core state object
        const coreState = {
            description, amount, category, paymentMethod, bankAccount, frequency, date,
            isEditing, transactionType, effectiveTransactionId, originalTransactionData,
            pendingUpdateData
        };

        // Core setters object
        const coreSetters = {
            setDescription, setAmount, setCategory, setPaymentMethod, setBankAccount,
            setFrequency, setDate, resetFormState, setPendingUpdateData
            // We don't include setIsEditing, setTransactionType, setEffectiveTransactionId, setOriginalTransactionData directly here
            // as they are primarily managed by the useEffect hook based on transactionToEdit.
        };

        return { coreState, coreSetters };
    }
  