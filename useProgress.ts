// src/hooks/useProgress.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { progressApi } from '../lib/api';

export const useProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    challenge_7days_progress: 0,
    challenge_28days_progress: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);

  // Buscar progresso e conquistas
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Obter idioma atual
        const currentLanguage = localStorage.getItem('userLanguage') || 'pt-BR';
        
        // Buscar progresso
        const progressData = await progressApi.getUserProgress(user.id);
        
        // Buscar conquistas
        const achievementsData = await progressApi.getUserAchievements(user.id, currentLanguage);
        
        setProgress({
          challenge_7days_progress: progressData.challenge_7days_progress || 0,
          challenge_28days_progress: progressData.challenge_28days_progress || 0
        });
        
        setAchievements(achievementsData);
      } catch (error: any) {
        console.error('Erro ao buscar dados de progresso:', error);
        setError(error.message || 'Erro ao carregar dados de progresso. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [user]);

  return {
    loading,
    error,
    progress,
    achievements
  };
};
