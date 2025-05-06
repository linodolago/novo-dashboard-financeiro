
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useFinance } from '@/context/FinanceContext';

    const PlanDialog = ({ open, onOpenChange, planToEdit = null }) => {
      const { addPlan, updatePlan } = useFinance();
      const [name, setName] = useState('');
      const [targetValue, setTargetValue] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      const isEditing = planToEdit !== null;

      useEffect(() => {
        if (isEditing && planToEdit) {
          setName(planToEdit.name);
          setTargetValue(planToEdit.targetValue?.toString() ?? '');
        } else {
          // Reset form for adding
          setName('');
          setTargetValue('');
        }
      }, [planToEdit, open, isEditing]); // Reset when dialog opens or planToEdit changes

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !targetValue) return; // Basic validation

        setIsSubmitting(true);
        const planData = {
          name,
          targetValue: parseFloat(targetValue) || 0,
        };

        try {
          if (isEditing) {
            await updatePlan({ ...planData, id: planToEdit.id });
          } else {
            await addPlan(planData);
          }
          onOpenChange(false); // Close on success
        } catch (error) {
          // Error handled by toast in hooks
          console.error("Failed to save plan:", error);
        } finally {
          setIsSubmitting(false);
        }
      };

      // Close handler ensures state resets if closed manually
      const handleOpenChange = (isOpen) => {
          if (!isOpen) {
              setName('');
              setTargetValue('');
          }
          onOpenChange(isOpen);
      };

      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {isEditing ? 'Editar Plano Financeiro' : 'Novo Plano Financeiro'}
                </DialogTitle>
                 <DialogDescription>
                    Defina um nome e o valor que você deseja alcançar.
                 </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="plan-name">Nome do Plano</Label>
                  <Input
                    id="plan-name"
                    placeholder="Ex: Reforma da Casa, Viagem..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50} // Add reasonable max length
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="plan-target">Valor Alvo</Label>
                  <Input
                    id="plan-target"
                    placeholder="R$ 0,00"
                    type="number"
                    step="0.01"
                    min="0.01" // Target must be positive
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                    <p className="text-xs text-muted-foreground mt-1">
                         O sistema calculará automaticamente quando você alcançará este valor com base no seu fluxo de caixa.
                     </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Plano')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default PlanDialog;
  