// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Estas variáveis de ambiente precisarão ser configuradas em produção
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para autenticação
export type UserCredentials = {
  email: string;
  password: string;
};

// Funções de autenticação
export const auth = {
  // Registrar um novo usuário
  signUp: async ({ email, password }: UserCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  // Login de usuário
  signIn: async ({ email, password }: UserCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Recuperação de senha
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  },
  
  // Verificar se o usuário está autorizado
  checkAuthorization: async (email: string) => {
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return false;
    return !!data;
  },
  
  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Verificar se o usuário é admin
  isAdmin: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  },
};

// Webhook para receber compradores do Cartpanda
export const processCartpandaWebhook = async (payload: any) => {
  // Verificar se o payload contém as informações necessárias
  if (!payload || !payload.customer || !payload.customer.email) {
    throw new Error('Payload inválido');
  }
  
  const { email } = payload.customer;
  
  // Verificar se o email já existe na tabela de emails autorizados
  const { data: existingEmail } = await supabase
    .from('authorized_emails')
    .select('*')
    .eq('email', email)
    .single();
  
  // Se o email não existir, adicionar à tabela
  if (!existingEmail) {
    const { error } = await supabase
      .from('authorized_emails')
      .insert([{ email, created_at: new Date().toISOString() }]);
    
    if (error) throw error;
  }
  
  return { success: true };
};
