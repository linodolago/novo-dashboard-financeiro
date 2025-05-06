
    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useFinance } from '@/context/FinanceContext';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import { User, LogOut } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";
    import UserProfileDialog from './UserProfileDialog'; // Import the dialog

    const UserMenu = () => {
        const { session } = useFinance();
        const { toast } = useToast();
        const [profileDialogOpen, setProfileDialogOpen] = useState(false);

        const handleLogout = async () => {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                // No need for toast, app will re-render via Auth listener in context
            } catch (error) {
                console.error('Error logging out:', error);
                toast({
                    title: "Erro",
                    description: "Não foi possível sair da conta.",
                    variant: "destructive",
                });
            }
        };

        const getInitials = (email) => {
            if (!email) return '?';
            return email[0].toUpperCase();
        };

        const userEmail = session?.user?.email;
        const userName = session?.user?.user_metadata?.full_name;

        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-9 w-9">
                                {/* Add AvatarImage if you store profile picture URLs */}
                                {/* <AvatarImage src={session?.user?.user_metadata?.avatar_url} alt={userName || userEmail} /> */}
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                    {userName ? userName[0].toUpperCase() : getInitials(userEmail)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                {userName && <p className="text-sm font-medium leading-none">{userName}</p>}
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair da conta</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dialog */}
                <UserProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
            </>
        );
    };

    export default UserMenu;
  