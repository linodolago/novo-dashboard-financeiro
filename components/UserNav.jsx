
    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useFinance } from '@/context/FinanceContext';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Button } from "@/components/ui/button";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuGroup,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { LogOut, User } from 'lucide-react';
    import ProfileDialog from './ProfileDialog'; // Import the ProfileDialog
    import { useToast } from "@/components/ui/use-toast";

    export function UserNav() {
      const { session, handleLogout } = useFinance(); // Get session and logout function
      const [profileDialogOpen, setProfileDialogOpen] = useState(false);
      const { toast } = useToast();

      const user = session?.user;
      const userEmail = user?.email || '';
      const userName = user?.user_metadata?.full_name || userEmail; // Use full_name or fallback to email
      const avatarFallback = userName?.substring(0, 2).toUpperCase() || '??';

      const onLogoutClick = async () => {
        try {
          await handleLogout();
          // No need for toast here, context might handle it or app state change is enough
        } catch (error) {
           toast({
             title: "Erro ao Sair",
             description: error.message || "Não foi possível fazer logout.",
             variant: "destructive",
           });
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
                  {/* Add AvatarImage if you store avatar URLs */}
                  {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} /> */}
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Ver Perfil</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogoutClick} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dialog */}
          <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
        </>
      );
    }
  