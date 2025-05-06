
    import React from 'react';
    import { motion } from 'framer-motion';

    const TransactionDialogUpdateOptions = ({
        isEditing,
        frequency,
    }) => {

        const showOptions = isEditing && frequency !== 'once';

        if (!showOptions) {
            return null;
        }

        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4 border-t pt-4"
            >
                <p className="text-sm font-medium text-gray-700 mb-2">Opções de Edição Recorrente:</p>

                <p className="text-xs text-muted-foreground text-center mt-2">
                    As alterações serão aplicadas a todas as ocorrências (passadas e futuras) desta transação recorrente.
                </p>

            </motion.div>
        );
    };

    export default TransactionDialogUpdateOptions;
  