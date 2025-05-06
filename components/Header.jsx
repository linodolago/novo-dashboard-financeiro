
    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useFinance } from '@/context/FinanceContext';
    import { Button } from '@/components/ui/button';
    import { LogOut } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const Header = () => {
        const { session } = useFinance();
        const { toast } = useToast();
        const [loading, setLoading] = useState(false);

        const handleLogout = async () => {
            setLoading(true);
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                // No need for success toast, the app will re-render the Auth page automatically
            } catch (error) {
                console.error('Error logging out:', error);
                toast({
                    title: "Erro ao Sair",
                    description: error.message || "Não foi possível desconectar sua conta.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        return (
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center py-3 px-4 mb-4 bg-white shadow-sm rounded-lg max-w-6xl mx-auto"
            >
                <div className="text-sm text-gray-600">
                    {session?.user?.email ? `Logado como: ${session.user.email}` : 'Carregando usuário...'}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={loading}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loading ? 'Saindo...' : 'Sair da conta'}
                </Button>
            </motion.header>
        );
    };

    export default Header;
  