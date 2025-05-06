
    import {
            insertTransaction as apiInsertTransaction,
            removeTransaction as apiRemoveTransaction,
            updateTransaction as apiUpdateTransaction,
            fetchSingleTransaction as apiFetchSingleTransaction // Import the new fetch function
        } from '@/services/supabaseService';
        import { calculatePreviousDay, formatDateToDB } from '@/lib/utils';
        import { isValid, startOfDay, isAfter, format, parse } from 'date-fns';

        export async function _internalAddTransaction(transactionInput) {
          const payload = {
            ...transactionInput,
            end_date: transactionInput.end_date || null
          };
          payload.amount = parseFloat(payload.amount);
          // Ensure start_date is formatted correctly if it's coming directly
          if (transactionInput.date) {
              payload.start_date = formatDateToDB(parse(transactionInput.date, 'yyyy-MM-dd', new Date()));
              delete payload.date; // Remove the UI date field
          }
           // Ensure end_date is formatted correctly if it's coming directly
           if (transactionInput.end_date) {
               payload.end_date = formatDateToDB(parse(transactionInput.end_date, 'yyyy-MM-dd', new Date()));
           } else {
               payload.end_date = null;
           }

          return await apiInsertTransaction(payload);
        }

        export async function _internalDeleteTransaction(id, type) {
          await apiRemoveTransaction(id, type);
        }

        export async function _internalUpdateTransaction(transactionInput) {
          const payload = {
            ...transactionInput,
          };
          payload.amount = parseFloat(payload.amount);
           // Ensure start_date is formatted correctly if it's coming directly
           if (transactionInput.date) {
               payload.start_date = formatDateToDB(parse(transactionInput.date, 'yyyy-MM-dd', new Date()));
               delete payload.date; // Remove the UI date field
           }
            // Ensure end_date is formatted correctly if it's coming directly
            if (transactionInput.end_date) {
                payload.end_date = formatDateToDB(parse(transactionInput.end_date, 'yyyy-MM-dd', new Date()));
            } else {
                payload.end_date = null;
            }

          return await apiUpdateTransaction(payload);
        }

        // Now accepts the freshly fetched original DB record
        export async function _internalUpdateRecurringValue(originalDbRecord, newAmount, effectiveDateStr, originalType, originalDescription, originalFrequency, originalPaymentMethod, originalCategory) {
            // --- Detailed Check for Original DB Record ---
            if (!originalDbRecord) {
                console.error("Update Recurring Error: originalDbRecord object is missing.");
                throw new Error("Erro interno: Dados originais do banco não encontrados.");
            }
            if (!originalDbRecord.id) {
                console.error("Update Recurring Error: originalDbRecord.id is missing.", originalDbRecord);
                throw new Error("Erro interno: ID nos dados originais do banco está faltando.");
            }
            if (!originalDbRecord.start_date) {
                console.error("Update Recurring Error: originalDbRecord.start_date is missing.", originalDbRecord);
                throw new Error("Erro interno: Data de início ('start_date') nos dados originais do banco está faltando.");
            }
            if (!originalDbRecord.user_id) {
                 console.error("Update Recurring Error: originalDbRecord.user_id is missing.", originalDbRecord);
                 throw new Error("Dados da transação original estão incompletos ou inválidos (user_id faltando nos dados originais do banco).");
            }


            // --- Date Validation and Parsing ---
            const effectiveDate = startOfDay(parse(effectiveDateStr, 'yyyy-MM-dd', new Date()));
            if (!isValid(effectiveDate)) {
                throw new Error("Data efetiva inválida. Por favor, selecione uma data válida.");
            }

            // Parse and validate original start date from DB record
            const originalStartDate = startOfDay(parse(originalDbRecord.start_date, 'yyyy-MM-dd', new Date()));
             if (!isValid(originalStartDate)) {
                 console.error("Original start date invalid:", originalDbRecord.start_date);
                 throw new Error(`Erro interno: A data de início original (${originalDbRecord.start_date}) da transação é inválida.`);
             }

            // Ensure effectiveDate is strictly after originalStartDate (comparing day only)
            if (!isAfter(effectiveDate, originalStartDate)) {
                throw new Error(`A data efetiva (${format(effectiveDate, 'dd/MM/yyyy')}) deve ser estritamente posterior à data de início original (${format(originalStartDate, 'dd/MM/yyyy')}).`);
            }

            // --- Calculate End Date for Original ---
            const newEndDateForOriginal = calculatePreviousDay(effectiveDate);
            if (!newEndDateForOriginal || !isValid(newEndDateForOriginal)) {
                 throw new Error(`Não foi possível calcular uma data final válida (dia anterior a ${format(effectiveDate, 'dd/MM/yyyy')}) para a transação antiga.`);
            }
            const formattedEndDate = formatDateToDB(newEndDateForOriginal);


            // --- Prepare Payloads ---
            // 1. Update the end_date of the original transaction using originalDbRecord
            const finalUpdatePayload = {
                id: originalDbRecord.id,
                type: originalType, // Pass type explicitly
                user_id: originalDbRecord.user_id, // Use user_id from DB record
                name: originalDbRecord.name,
                amount: originalDbRecord.amount,
                category: originalDbRecord.category,
                payment_method: originalDbRecord.payment_method,
                periodicity: originalDbRecord.periodicity,
                start_date: originalDbRecord.start_date, // Keep original DB format
                end_date: formattedEndDate,
            };
             if (finalUpdatePayload.type === 'income') delete finalUpdatePayload.category;

            console.log("Payload for UPDATE:", JSON.stringify(finalUpdatePayload, null, 2));


            // 2. Insert a new transaction with the new amount and start date
            const newTransactionPayload = {
                user_id: originalDbRecord.user_id, // Use user_id from DB record
                name: originalDescription, // Use description from mapped data passed as arg
                amount: parseFloat(newAmount),
                periodicity: originalFrequency, // Use frequency from mapped data passed as arg
                payment_method: originalPaymentMethod, // Use paymentMethod from mapped data passed as arg
                start_date: formatDateToDB(effectiveDate), // Format the parsed effective date
                end_date: null,
                type: originalType, // Pass type explicitly
                ...(originalType === 'expense' && originalCategory && { category: originalCategory }), // Use category from mapped data passed as arg
            };

            console.log("Payload for INSERT:", JSON.stringify(newTransactionPayload, null, 2));


            // --- Payload Validation (Simplified) ---
            if (isNaN(newTransactionPayload.amount) || newTransactionPayload.amount < 0) {
                 throw new Error("Valor inválido para a nova transação recorrente.");
            }
            if (newTransactionPayload.type === 'expense' && !newTransactionPayload.category) {
                 if (originalCategory) {
                     newTransactionPayload.category = originalCategory;
                 } else {
                     console.warn("Warning: Category missing for new recurring expense, derived from original data:", originalDbRecord);
                 }
            }


            // --- Database Operations ---
            try {
                const updatedOldRecord = await apiUpdateTransaction(finalUpdatePayload);
                const insertedNewRecord = await apiInsertTransaction(newTransactionPayload);
                return { updatedOldRecord, insertedNewRecord };
            } catch (error) {
                console.error("Database error during recurring update:", error);
                throw new Error(`Erro no banco de dados ao atualizar recorrência: ${error.message}`);
            }
        }
  