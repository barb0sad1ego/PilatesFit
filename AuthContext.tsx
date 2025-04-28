// src/components/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, supabase } from '../../lib/supabase';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificar usuário atual ao carregar
    const checkUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Verificar se é admin
          const adminStatus = await auth.isAdmin();
          setIsAdmin(adminStatus);
          
          // Verificar se está autorizado
          const authorized = await auth.checkAuthorization(currentUser.email || '');
          setIsAuthorized(authorized);
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setIsLoading(true);
      
      if (session?.user) {
        // Verificar se é admin
        const adminStatus = await auth.isAdmin();
        setIsAdmin(adminStatus);
        
        // Verificar se está autorizado
        const authorized = await auth.checkAuthorization(session.user.email || '');
        setIsAuthorized(authorized);
      } else {
        setIsAdmin(false);
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await auth.signIn({ email, password });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await auth.signUp({ email, password });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await auth.resetPassword(email);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isLoading,
    isAdmin,
    isAuthorized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
