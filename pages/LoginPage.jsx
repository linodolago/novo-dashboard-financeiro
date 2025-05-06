
    import React, { useState } from 'react';
    import { useAuth } from '@/context/AuthContext';
    import { useNavigate, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from "@/components/ui/use-toast";
    import { Loader2 } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

    const LoginPage = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [firstName, setFirstName] = useState('');
        const [lastName, setLastName] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const { signIn, signUp, user } = useAuth();
        const navigate = useNavigate();
        const { toast } = useToast();

        // Redirect if already logged in
        React.useEffect(() => {
            if (user) {
                navigate('/', { replace: true });
            }
        }, [user, navigate]);

        const handleSignIn = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
                await signIn(email, password);
                toast({ title: "Login bem-sucedido!", description: "Redirecionando para o dashboard..." });
                navigate('/'); // Redirect handled by effect, but good practice
            } catch (err) {
                setError(err.message || 'Falha no login. Verifique suas credenciais.');
                toast({ title: "Erro no Login", description: err.message || 'Verifique suas credenciais.', variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        const handleSignUp = async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                toast({ title: "Erro no Registro", description: "As senhas não coincidem.", variant: "destructive" });
                return;
            }
             if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                toast({ title: "Erro no Registro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
                return;
             }
            setError('');
            setLoading(true);
            try {
                await signUp(email, password, firstName, lastName);
                // Don't navigate immediately, user might need email confirmation.
                // Show success message. AuthProvider shows an alert already.
                toast({ title: "Registro iniciado!", description: "Verifique seu e-mail para confirmação, se necessário." });
                // Clear form maybe? Or switch to login tab? For now, just clear state.
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');

            } catch (err) {
                setError(err.message || 'Falha no registro.');
                toast({ title: "Erro no Registro", description: err.message || 'Não foi possível registrar.', variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };


        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
                <Tabs defaultValue="signin" className="w-[400px]">
                     <TabsList className="grid w-full grid-cols-2">
                       <TabsTrigger value="signin">Entrar</TabsTrigger>
                       <TabsTrigger value="signup">Registrar</TabsTrigger>
                     </TabsList>
                     {/* Sign In Tab */}
                     <TabsContent value="signin">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Entrar</CardTitle>
                                <CardDescription>Acesse sua conta para gerenciar suas finanças.</CardDescription>
                            </CardHeader>
                             <form onSubmit={handleSignIn}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-signin">Email</Label>
                                        <Input
                                            id="email-signin"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password-signin">Senha</Label>
                                        <Input
                                            id="password-signin"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                     {error && <p className="text-sm text-red-600">{error}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                                    </Button>
                                </CardFooter>
                             </form>
                        </Card>
                     </TabsContent>
                     {/* Sign Up Tab */}
                     <TabsContent value="signup">
                         <Card>
                             <CardHeader>
                                 <CardTitle className="text-2xl">Registrar</CardTitle>
                                 <CardDescription>Crie sua conta gratuitamente.</CardDescription>
                             </CardHeader>
                             <form onSubmit={handleSignUp}>
                                 <CardContent className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <Label htmlFor="first-name">Nome</Label>
                                             <Input
                                                 id="first-name"
                                                 placeholder="Seu nome"
                                                 value={firstName}
                                                 onChange={(e) => setFirstName(e.target.value)}
                                                 required
                                                 disabled={loading}
                                             />
                                         </div>
                                          <div className="space-y-2">
                                             <Label htmlFor="last-name">Sobrenome</Label>
                                             <Input
                                                 id="last-name"
                                                 placeholder="Seu sobrenome"
                                                 value={lastName}
                                                 onChange={(e) => setLastName(e.target.value)}
                                                 disabled={loading}
                                             />
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="email-signup">Email</Label>
                                         <Input
                                             id="email-signup"
                                             type="email"
                                             placeholder="seu@email.com"
                                             value={email}
                                             onChange={(e) => setEmail(e.target.value)}
                                             required
                                             disabled={loading}
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="password-signup">Senha</Label>
                                         <Input
                                             id="password-signup"
                                             type="password"
                                             value={password}
                                             onChange={(e) => setPassword(e.target.value)}
                                             required
                                             minLength={6}
                                             disabled={loading}
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="confirm-password">Confirmar Senha</Label>
                                         <Input
                                             id="confirm-password"
                                             type="password"
                                             value={confirmPassword}
                                             onChange={(e) => setConfirmPassword(e.target.value)}
                                             required
                                             disabled={loading}
                                         />
                                     </div>
                                      {error && <p className="text-sm text-red-600">{error}</p>}
                                 </CardContent>
                                 <CardFooter>
                                     <Button type="submit" className="w-full" disabled={loading}>
                                         {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                                     </Button>
                                 </CardFooter>
                             </form>
                         </Card>
                     </TabsContent>
                </Tabs>
            </div>
        );
    };

    export default LoginPage;
  