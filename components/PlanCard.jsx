
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Progress } from '@/components/ui/progress';
    import { Button } from '@/components/ui/button';
    import { Edit2, Trash2 } from 'lucide-react';
    import { formatCurrency } from '@/lib/utils';
    // format and ptBR are no longer needed for date formatting
    // import { format } from 'date-fns';
    // import { ptBR } from 'date-fns/locale';

    const PlanCard = ({ plan, availableBalance, onEdit, onDelete }) => {
        // projectedCompletionDate is no longer used
        const { id, name, targetValue, progress } = plan;

        // Calculate progress based on available balance (current month's closing balance)
        // Ensure targetValue is not zero to avoid division by zero
        const safeTargetValue = targetValue || 1;
        // Use the progress calculated based on availableBalance, passed via plan prop now
        const currentProgress = progress;


        return (
            <motion.div
                layout // Animate layout changes
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} // Animate exit
                transition={{ duration: 0.3 }}
                className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.666rem)] xl:w-[calc(25%-0.75rem)]" // Responsive width
            >
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                        <CardTitle className="text-base font-medium mr-2 truncate">{name}</CardTitle>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(plan)} aria-label={`Editar plano ${name}`} className="h-7 w-7">
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => onDelete(plan)} aria-label={`Excluir plano ${name}`} className="h-7 w-7">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between pt-2">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progresso</span>
                                <span className="text-xs font-semibold">{currentProgress}%</span>
                            </div>
                            <Progress value={currentProgress} className="w-full h-2 mb-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Disponível</p>
                                <p className="font-semibold truncate">{formatCurrency(availableBalance)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Meta</p>
                                <p className="font-semibold truncate">{formatCurrency(targetValue)}</p>
                            </div>
                             {/* Removed the projected completion date section */}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    export default PlanCard;
  