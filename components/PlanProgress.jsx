
    import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Alert, AlertDescription } from "@/components/ui/alert";
    import { AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
    import { useFinance } from '@/context/FinanceContext';
    import PlanCard from './PlanCard';
    import PlanDialog from './PlanDialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import { buttonVariants } from '@/components/ui/button';


    const PlanProgress = () => {
      const { planProjections, monthlyBalance, deletePlan } = useFinance();
      const [planDialogOpen, setPlanDialogOpen] = useState(false);
      const [planToEdit, setPlanToEdit] = useState(null);
      const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
      const [planToDelete, setPlanToDelete] = useState(null);

      const currentMonthBalance = monthlyBalance?.balance ?? 0;
      const canStartPlans = currentMonthBalance >= 0;

      const handleAddPlanClick = () => {
          setPlanToEdit(null); // Ensure we are adding, not editing
          setPlanDialogOpen(true);
      };

      const handleEditPlanClick = (plan) => {
          setPlanToEdit(plan);
          setPlanDialogOpen(true);
      };

      const handleDeletePlanClick = (plan) => {
          setPlanToDelete(plan);
          setDeleteAlertOpen(true);
      };

      const confirmDelete = async () => {
         if (planToDelete) {
             await deletePlan(planToDelete.id);
             setPlanToDelete(null);
         }
         setDeleteAlertOpen(false);
     };


      return (
        <>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">ACOMPANHAMENTO DE PLANOS</CardTitle>
                 {/* Show Add button only if balance is non-negative */}
                 {canStartPlans && (
                    <Button variant="outline" size="sm" onClick={handleAddPlanClick} className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Plano
                    </Button>
                )}
              </CardHeader>
              <CardContent>
                {!canStartPlans && (
                     <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-300 text-yellow-800">
                         <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                         <AlertDescription className="font-medium">
                            Seu saldo atual não é suficiente para iniciar planos. Adicione receitas ou reduza despesas.
                         </AlertDescription>
                     </Alert>
                 )}

                 {canStartPlans && planProjections.length === 0 && (
                    <div className="text-center py-8 flex flex-col items-center">
                        <p className="text-muted-foreground mb-4">Você ainda não possui planos financeiros.</p>
                        <Button variant="default" onClick={handleAddPlanClick}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar meu primeiro plano
                        </Button>
                    </div>
                )}

                {canStartPlans && planProjections.length > 0 && (
                  <AnimatePresence> {/* Wrap list for exit animations */}
                    <motion.div layout className="flex flex-wrap gap-4">
                       {planProjections.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                availableBalance={currentMonthBalance}
                                onEdit={handleEditPlanClick}
                                onDelete={handleDeletePlanClick}
                            />
                        ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Add/Edit Plan Dialog */}
           <PlanDialog
               key={planToEdit ? `edit-${planToEdit.id}` : 'add-plan'} // Ensure dialog remounts/resets
               open={planDialogOpen}
               onOpenChange={setPlanDialogOpen}
               planToEdit={planToEdit}
           />

           {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o plano "{planToDelete?.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      );
    };

    export default PlanProgress;
  