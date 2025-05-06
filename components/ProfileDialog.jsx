
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useFinance } from '@/context/FinanceContext';

    const ProfileDialog = ({ open, onOpenChange }) => {
      const { session, updateUserMetadata } = useFinance();
      const [name, setName] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');

      useEffect(() => {
        if (session?.user?.user_metadata?.full_name) {
          setName(session.user.user_metadata.full_name);
        } else {
          // Fallback if name is not set in metadata
          setName('');
        }
        setError(''); // Reset error when dialog opens or session changes
      }, [session, open]); // Re-run when dialog opens or session changes

      const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
          setError('O nome não pode ficar em branco.');
          return;
        }
        setLoading(true);
        const updatedUser = await updateUserMetadata({ full_name: name.trim() });
        setLoading(false);
        if (updatedUser) {
          onOpenChange(false); // Close dialog on success
        } else {
          setError('Falha ao atualizar o nome. Tente novamente.'); // Error message is also shown via toast in context
        }
      };

      const handleOpenChange = (isOpen) => {
         if (!isOpen) {
             setError(''); // Clear error when closing
             // Optionally reset name to original if desired
             // setName(session?.user?.user_metadata?.full_name || '');
         }
         onOpenChange(isOpen);
      }

      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Atualize seu nome de exibição.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    disabled={loading}
                    required
                  />
                </div>
                 {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default ProfileDialog;
  