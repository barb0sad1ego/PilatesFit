// src/hooks/useChallenge.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { classesApi, progressApi } from '../lib/api';

interface UseChallenge {
  challengeType: '7days' | '28days';
  day: number;
}

export const useChallenge = ({ challengeType, day }: UseChallenge) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalDays = challengeType === '7days' ? 7 : 28;

  // Buscar dados da aula
  useEffect(() => {
    const fetchClassData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Obter idioma atual
        const currentLanguage = localStorage.getItem('userLanguage') || 'pt-BR';
        
        // Buscar dados da aula
        const classData = await classesApi.getClass(challengeType, day, currentLanguage);
        
        // Verificar se o usuário já completou esta aula
        const isCompleted = await classesApi.isCompleted(user.id, classData.id);
        
        setClassData(classData);
        setCompleted(isCompleted);
      } catch (error: any) {
        console.error('Erro ao buscar dados da aula:', error);
        setError(error.message || 'Erro ao carregar a aula. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [user, challengeType, day]);

  // Marcar aula como concluída
  const markAsCompleted = async () => {
    if (!user || !classData || completed) return;
    
    try {
      setSaving(true);
      
      // Marcar aula como concluída
      await classesApi.markAsCompleted(user.id, classData.id);
      
      // Calcular novo progresso
      const completedDays = day;
      const newProgress = completedDays / totalDays;
      
      // Atualizar progresso do desafio
      await progressApi.updateUserProgress(user.id, challengeType, newProgress);
      
      // Verificar conquistas
      if (challengeType === '7days' && day === 7) {
        // Desbloquear conquista de completar desafio de 7 dias
        await progressApi.unlockAchievement(user.id, 'challenge_7days_completed');
      } else if (challengeType === '28days') {
        if (day === 7) {
          // Desbloquear conquista de completar 7 dias do desafio de 28 dias
          await progressApi.unlockAchievement(user.id, 'challenge_28days_week1');
        } else if (day === 14) {
          // Desbloquear conquista de completar 14 dias do desafio de 28 dias
          await progressApi.unlockAchievement(user.id, 'challenge_28days_week2');
        } else if (day === 21) {
          // Desbloquear conquista de completar 21 dias do desafio de 28 dias
          await progressApi.unlockAchievement(user.id, 'challenge_28days_week3');
        } else if (day === 28) {
          // Desbloquear conquista de completar o desafio de 28 dias
          await progressApi.unlockAchievement(user.id, 'challenge_28days_completed');
        }
      }
      
      // Atualizar estado local
      setCompleted(true);
    } catch (error: any) {
      console.error('Erro ao marcar como concluído:', error);
      setError(error.message || 'Erro ao salvar progresso. Tente novamente mais tarde.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    error,
    classData,
    completed,
    saving,
    markAsCompleted,
    totalDays
  };
};
