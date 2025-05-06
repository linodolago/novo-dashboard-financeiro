
    import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useFinance } from '@/context/FinanceContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
    import { useToast } from "@/components/ui/use-toast";

    const UserProfileDialog = ({ open, onOpenChange }) => {
        const { session, refetchData } = useFinance(); // Use refetchData if needed after update
        const [name, setName] = useState('');
        const [loading, setLoading] = useState(false);
        const { toast } = useToast();

        useEffect(() => {
            if (session?.user?.user_metadata?.full_name) {
                setName(session.user.user_metadata.full_name);
            } else {
                 setName(''); // Reset if no name found
            }
        }, [session, open]); // Re-run when session changes or dialog opens

        const handleUpdateProfile = async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                const { data, error } = await supabase.auth.updateUser({
                    data: { full_name: name.trim() }
                });

                if (error) throw error;

                toast({ title: "Sucesso", description: "Nome atualizado." });
                // Optionally refetch data if other parts of the app depend on the name immediately
                // await refetchData();
                onOpenChange(false); // Close dialog on success
            } catch (error) {
                console.error('Error updating profile:', error);
                toast({
                    title: "Erro",
                    description: error.error_description || error.message || "Não foi possível atualizar o nome.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpdateProfile}>
                        <DialogHeader>
                            <DialogTitle>Perfil</DialogTitle>
                            <DialogDescription>
                                Atualize seu nome ou visualize seu e-mail.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="col-span-3 bg-muted"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Seu nome completo"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
                             </DialogClose>
                            <Button type="submit" disabled={loading || !name.trim()}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    export default UserProfileDialog;
  