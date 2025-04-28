// src/lib/api.ts
import { supabase } from './supabase';

// Tipos para as aulas
export interface Class {
  id: string;
  title: string;
  day: number;
  challenge_type: '7days' | '28days';
  video_url: string;
  description?: string;
  language: string;
}

// Tipos para os materiais
export interface Material {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  category: string;
  language: string;
}

// API para gerenciar aulas
export const classesApi = {
  // Buscar todas as aulas
  getClasses: async (language: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('language', language)
      .order('challenge_type', { ascending: true })
      .order('day', { ascending: true });
    
    if (error) throw error;
    return data as Class[];
  },
  
  // Buscar aula específica
  getClass: async (challengeType: string, day: number, language: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('challenge_type', challengeType)
      .eq('day', day)
      .eq('language', language)
      .single();
    
    if (error) throw error;
    return data as Class;
  },
  
  // Marcar aula como concluída
  markAsCompleted: async (userId: string, classId: string) => {
    const { error } = await supabase
      .from('user_class_progress')
      .insert([
        {
          user_id: userId,
          class_id: classId,
          completed_at: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    return true;
  },
  
  // Verificar se aula foi concluída
  isCompleted: async (userId: string, classId: string) => {
    const { data, error } = await supabase
      .from('user_class_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// API para gerenciar materiais
export const materialsApi = {
  // Buscar todos os materiais
  getMaterials: async (language: string) => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('language', language)
      .order('category', { ascending: true })
      .order('title', { ascending: true });
    
    if (error) throw error;
    return data as Material[];
  },
  
  // Buscar material específico
  getMaterial: async (id: string) => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Material;
  }
};

// API para gerenciar progresso do usuário
export const progressApi = {
  // Buscar progresso do usuário
  getUserProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || { 
      user_id: userId, 
      challenge_7days_progress: 0, 
      challenge_28days_progress: 0 
    };
  },
  
  // Atualizar progresso do usuário
  updateUserProgress: async (userId: string, challengeType: '7days' | '28days', progress: number) => {
    const progressField = challengeType === '7days' 
      ? 'challenge_7days_progress' 
      : 'challenge_28days_progress';
    
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!existingProgress) {
      // Inserir novo registro
      const { error } = await supabase
        .from('user_progress')
        .insert([
          {
            user_id: userId,
            [progressField]: progress
          }
        ]);
      
      if (error) throw error;
    } else {
      // Atualizar registro existente apenas se o novo progresso for maior
      if (progress > (existingProgress[progressField] || 0)) {
        const { error } = await supabase
          .from('user_progress')
          .update({ [progressField]: progress })
          .eq('user_id', userId);
        
        if (error) throw error;
      }
    }
    
    return true;
  },
  
  // Buscar conquistas do usuário
  getUserAchievements: async (userId: string, language: string) => {
    // Buscar todas as conquistas
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('language', language)
      .order('id', { ascending: true });
    
    if (achievementsError) throw achievementsError;
    
    // Buscar conquistas desbloqueadas pelo usuário
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    
    if (unlockedError) throw unlockedError;
    
    // Mapear conquistas com status de desbloqueio
    const unlockedIds = unlockedAchievements?.map(item => item.achievement_id) || [];
    
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id)
    }));
  },
  
  // Desbloquear conquista
  unlockAchievement: async (userId: string, achievementId: string) => {
    // Verificar se já está desbloqueada
    const { data, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    // Se já estiver desbloqueada, retornar
    if (data) return true;
    
    // Desbloquear conquista
    const { error } = await supabase
      .from('user_achievements')
      .insert([
        {
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    return true;
  }
};
