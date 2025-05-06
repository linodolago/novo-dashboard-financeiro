
    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from "@/components/ui/use-toast";
    import { motion } from 'framer-motion';

    const Auth = () => {
      const [loading, setLoading] = useState(false);
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
      const { toast } = useToast();

      const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          let error;
          if (isSignUp) {
            // Sign Up
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            error = signUpError;
            if (!error) {
              toast({ title: "Verifique seu e-mail!", description: "Um link de confirmação foi enviado para o seu e-mail." });
            }
          } else {
            // Sign In
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            error = signInError;
            // No toast on successful sign in, the app will just reload via the auth listener
          }

          if (error) throw error;

        } catch (error) {
          console.error('Authentication error:', error);
          toast({
            title: "Erro de Autenticação",
            description: error.error_description || error.message || "Ocorreu um erro.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-sm shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">{isSignUp ? 'Criar Conta' : 'Acessar Painel'}</CardTitle>
                <CardDescription>{isSignUp ? 'Preencha os campos para registrar.' : 'Entre com seu e-mail e senha.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      required
                      minLength={6} // Supabase default minimum
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={loading}>
                    {loading ? 'Processando...' : (isSignUp ? 'Registrar' : 'Entrar')}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={loading}>
                  {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Registrar'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          {/* Toaster should be rendered at the App level */}
        </div>
      );
    };

    export default Auth;
  