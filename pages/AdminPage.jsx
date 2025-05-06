
    import React, { useState, useEffect, useMemo } from 'react';
    // Import admin functions from profileService
    import {
        fetchAllProfiles,
        updateUserProfileStatus,
        updateUserProfileRole
    } from '@/services/profileService';
    import { useToast } from "@/components/ui/use-toast";
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card } from "@/components/ui/card";
    import { Loader2, Search, ShieldAlert } from 'lucide-react';
    import { motion } from 'framer-motion';

    const AdminPage = () => {
        const [profiles, setProfiles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [searchTerm, setSearchTerm] = useState('');
        const { toast } = useToast();

        const fetchProfilesData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use the service function
                const data = await fetchAllProfiles();
                setProfiles(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar usuários.');
                toast({ title: "Erro", description: err.message || 'Falha ao carregar usuários.', variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchProfilesData();
        }, []); // Fetch on component mount

        const handleStatusChange = async (profileId, currentStatus) => {
            const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
            try {
                // Use the service function
                await updateUserProfileStatus(profileId, newStatus);
                // Update local state optimistically or based on response
                setProfiles(prev =>
                    prev.map(p => p.id === profileId ? { ...p, status: newStatus } : p)
                );
                toast({ title: "Sucesso", description: `Status do usuário atualizado para ${newStatus}.` });
            } catch (err) {
                toast({ title: "Erro", description: `Falha ao atualizar status: ${err.message}`, variant: "destructive" });
            }
        };

         const handleRoleChange = async (profileId, newRole) => {
            try {
                // Use the service function
                await updateUserProfileRole(profileId, newRole);
                 // Update local state optimistically or based on response
                setProfiles(prev =>
                    prev.map(p => p.id === profileId ? { ...p, role: newRole } : p)
                );
                toast({ title: "Sucesso", description: `Papel do usuário atualizado para ${newRole}.` });
            } catch (err) {
                toast({ title: "Erro", description: `Falha ao atualizar papel: ${err.message}`, variant: "destructive" });
            }
        };


        const filteredProfiles = useMemo(() => {
            if (!searchTerm) return profiles;
            const lowerSearchTerm = searchTerm.toLowerCase();
            return profiles.filter(profile =>
                profile.email?.toLowerCase().includes(lowerSearchTerm) ||
                profile.first_name?.toLowerCase().includes(lowerSearchTerm) ||
                profile.last_name?.toLowerCase().includes(lowerSearchTerm)
            );
        }, [profiles, searchTerm]);

        return (
            <motion.div
                className="container mx-auto p-4 md:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento de Usuários</h1>

                <div className="mb-6 flex items-center space-x-4">
                    <div className="relative flex-grow">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input
                             type="text"
                             placeholder="Pesquisar por nome ou email..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="pl-10 w-full"
                         />
                    </div>
                     {/* Add User Button - Functionality requires backend setup beyond client-side SDK */}
                     {/* <Button disabled title="Funcionalidade indisponível">Adicionar Usuário</Button> */}
                </div>

                {loading && (
                     <div className="flex justify-center items-center py-10">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                 )}

                 {error && !loading && (
                     <div className="text-center py-10 text-red-600">
                         <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
                         <p>Ocorreu um erro:</p>
                         <p>{error}</p>
                         <Button onClick={fetchProfilesData} variant="outline" className="mt-4">Tentar Novamente</Button>
                     </div>
                 )}

                 {!loading && !error && (
                    <Card className="overflow-hidden border shadow-sm">
                         <Table>
                             <TableHeader>
                                 <TableRow>
                                     <TableHead>Email</TableHead>
                                     <TableHead>Nome</TableHead>
                                     <TableHead>Papel</TableHead>
                                     <TableHead>Status</TableHead>
                                     <TableHead className="text-center">Bloquear/Desbloquear</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {filteredProfiles.length > 0 ? (
                                     filteredProfiles.map((profile) => (
                                         <TableRow key={profile.id}>
                                             <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                                             <TableCell>{profile.first_name || ''} {profile.last_name || ''}</TableCell>
                                             <TableCell>
                                                  <Select
                                                     value={profile.role}
                                                     onValueChange={(newRole) => handleRoleChange(profile.id, newRole)}
                                                     // Prevent changing the role of the primary admin easily via UI
                                                     disabled={profile.email === 'Linolagoneto@gmail.com'}
                                                  >
                                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                                      <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="user">Usuário</SelectItem>
                                                      <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                             </TableCell>
                                             <TableCell>
                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {profile.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                                 </span>
                                              </TableCell>
                                             <TableCell className="text-center">
                                                 <Switch
                                                     checked={profile.status === 'blocked'}
                                                     onCheckedChange={() => handleStatusChange(profile.id, profile.status)}
                                                     aria-label={profile.status === 'active' ? 'Bloquear usuário' : 'Desbloquear usuário'}
                                                     id={`status-switch-${profile.id}`}
                                                      // Prevent blocking the primary admin easily via UI
                                                      disabled={profile.email === 'Linolagoneto@gmail.com'}
                                                 />
                                             </TableCell>
                                         </TableRow>
                                     ))
                                 ) : (
                                     <TableRow>
                                         <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                             {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário registrado ainda.'}
                                         </TableCell>
                                     </TableRow>
                                 )}
                             </TableBody>
                         </Table>
                    </Card>
                 )}
            </motion.div>
        );
    };

    export default AdminPage;
  