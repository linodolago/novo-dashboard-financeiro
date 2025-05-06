
    import React, { useState } from 'react';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Button } from "@/components/ui/button";
    import { useFinance } from '@/context/FinanceContext';
    import { User, LogOut } from 'lucide-react';
    import ProfileDialog from './ProfileDialog'; // Import the dialog

    const getInitials = (email) => {
      if (!email) return "?";
      const parts = email.split('@')[0];
      if (parts.includes('.')) {
        return parts.split('.').map(n => n[0]).join('').toUpperCase();
      }
      return parts.substring(0, 2).toUpperCase();
    };

    const ProfileDropdown = () => {
      const { session, signOut } = useFinance();
      const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

      const user = session?.user;
      const userName = user?.user_metadata?.full_name;
      const userEmail = user?.email;
      const userAvatarUrl = user?.user_metadata?.avatar_url; // Assuming avatar URL might exist

      const handleLogout = async () => {
        await signOut();
        // Navigation/redirect handled by Auth listener in FinanceContext
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  {/* Add AvatarImage if you store avatar URLs */}
                  {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName || userEmail} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                    {getInitials(userEmail)}
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
              <DropdownMenuItem onSelect={() => setIsProfileDialogOpen(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Ver perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Edit Dialog */}
          <ProfileDialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
          />
        </>
      );
    };

    export default ProfileDropdown;
  