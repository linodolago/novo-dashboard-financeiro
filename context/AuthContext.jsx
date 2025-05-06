
    import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import LoadingState from '@/components/ui/LoadingState';
    import { fetchUserProfile } from '@/services/profileService'; // Import from new service

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [profile, setProfile] = useState(null);
        const [isAdmin, setIsAdmin] = useState(false);
        const [loading, setLoading] = useState(true);
        const [authError, setAuthError] = useState(null);

        useEffect(() => {
            setLoading(true);
            setAuthError(null);

            // Function to fetch profile (using the dedicated service function)
            const loadProfile = async (userId) => {
                try {
                    const userProfile = await fetchUserProfile(userId); // Use service function
                    if (userProfile) {
                        setProfile(userProfile);
                        setIsAdmin(userProfile.role === 'admin');
                    } else {
                        // Profile might not exist immediately after signup due to trigger latency
                        setProfile(null);
                        setIsAdmin(false);
                        console.warn("Profile not found for user:", userId);
                    }
                } catch (error) {
                    console.error('Error loading profile:', error);
                    setAuthError(error.message || 'Erro ao buscar perfil do usuário.');
                    setProfile(null);
                    setIsAdmin(false);
                }
            };

            // Check initial session
             supabase.auth.getSession().then(async ({ data: { session }, error }) => {
                 if (error) {
                     console.error("Error getting initial session:", error);
                     setAuthError("Erro ao verificar sessão inicial.");
                 } else if (session) {
                     setUser(session.user);
                     await loadProfile(session.user.id);
                 }
                 setLoading(false);
             }).catch(err => {
                console.error("Exception getting initial session:", err);
                setAuthError("Erro inesperado ao verificar sessão.");
                setLoading(false);
             });


            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => { // Correctly destructure subscription
                setAuthError(null); // Clear previous errors on change
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setProfile(null); // Reset profile on auth change
                setIsAdmin(false);

                if (currentUser) {
                    setLoading(true); // Set loading while fetching profile
                    await loadProfile(currentUser.id);
                    setLoading(false);
                } else {
                     setLoading(false); // No user, no loading needed
                }

                 // Handle specific events if needed
                 if (event === 'SIGNED_IN') {
                    // console.log('User signed in:', currentUser);
                 } else if (event === 'SIGNED_OUT') {
                    // console.log('User signed out');
                 } else if (event === 'PASSWORD_RECOVERY') {
                    // console.log('Password recovery event');
                 } else if (event === 'USER_UPDATED') {
                    // Maybe refetch profile if relevant data changed
                    // console.log('User updated:', currentUser);
                     if (currentUser) {
                         await loadProfile(currentUser.id);
                     }
                 }
             });

            // Cleanup function: Use the correctly destructured subscription
            return () => {
                subscription?.unsubscribe();
            };
        }, []);

        const value = useMemo(() => ({
            user,
            profile,
            isAdmin,
            loading, // This reflects auth loading state
            authError,
            signIn: async (email, password) => {
                setLoading(true);
                setAuthError(null);
                try {
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        console.error("Sign in error:", error);
                        setAuthError(error.message || 'Falha ao entrar. Verifique suas credenciais.');
                        throw error;
                    }
                    // onAuthStateChange will handle setting user and profile
                } catch (error) {
                    setAuthError(error.message || 'Ocorreu um erro inesperado durante o login.');
                    setLoading(false); // Ensure loading is false on error
                    throw error; // Re-throw for component handling
                }
                // Loading is set to false by onAuthStateChange after profile fetch
            },
            signUp: async (email, password, firstName = '', lastName = '') => {
                setLoading(true);
                setAuthError(null);
                try {
                     const { data, error } = await supabase.auth.signUp({
                         email,
                         password,
                         options: {
                           data: { // This data is used by the handle_new_user trigger
                             first_name: firstName,
                             last_name: lastName,
                           }
                         }
                     });
                     if (error) {
                         console.error("Sign up error:", error);
                         setAuthError(error.message || 'Falha ao registrar. O usuário pode já existir.');
                         throw error;
                     }
                     // User needs to confirm email (if enabled in Supabase)
                     // onAuthStateChange will trigger eventually if successful (or after confirmation)
                     alert('Registro quase completo! Verifique seu e-mail para confirmação, se necessário.');
                     return data;
                 } catch (error) {
                     setAuthError(error.message || 'Ocorreu um erro inesperado durante o registro.');
                     setLoading(false);
                     throw error;
                 } finally {
                    // Don't set loading false here, wait for onAuthStateChange or error
                 }
            },
            signOut: async () => {
                setLoading(true);
                setAuthError(null);
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                        console.error("Sign out error:", error);
                        setAuthError(error.message || 'Falha ao sair.');
                        throw error;
                    }
                    // onAuthStateChange will handle setting user/profile to null
                } catch(error) {
                    setAuthError(error.message || 'Ocorreu um erro inesperado ao sair.');
                    throw error; // Re-throw for component handling
                } finally {
                    // Loading state will be handled by onAuthStateChange
                }
            },
            refreshProfile: async () => { // Manually trigger profile refresh if needed
                if (user) {
                   setLoading(true);
                   setAuthError(null);
                   try {
                       const userProfile = await fetchUserProfile(user.id); // Use service function
                       if (userProfile) {
                           setProfile(userProfile);
                           setIsAdmin(userProfile.role === 'admin');
                       } else {
                           setProfile(null);
                           setIsAdmin(false);
                       }
                   } catch (error) {
                       console.error("Error refreshing profile:", error);
                       setAuthError("Falha ao atualizar perfil.");
                   } finally {
                       setLoading(false);
                   }
                }
            }
        }), [user, profile, isAdmin, loading, authError]);

        // Show loading indicator only during initial auth check
        if (loading && !user && !profile) {
            return <LoadingState message="Verificando autenticação..." />;
        }

        return (
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        );
    };

    export const useAuth = () => {
        const context = useContext(AuthContext);
        if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
    };
  