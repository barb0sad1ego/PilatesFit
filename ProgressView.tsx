// src/components/progress/ProgressView.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  unlocked: boolean;
}

interface UserProgress {
  challenge_7days: number;
  challenge_28days: number;
  achievements: Achievement[];
}

const ProgressView: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    challenge_7days: 0,
    challenge_28days: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Buscar progresso do usuário
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Buscar progresso dos desafios
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso:', progressError);
          setError('Erro ao carregar progresso. Tente novamente mais tarde.');
          return;
        }
        
        // Buscar conquistas
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('language', localStorage.getItem('userLanguage') || 'pt-BR')
          .order('id', { ascending: true });
        
        if (achievementsError) {
          console.error('Erro ao buscar conquistas:', achievementsError);
          setError('Erro ao carregar conquistas. Tente novamente mais tarde.');
          return;
        }
        
        // Buscar conquistas desbloqueadas pelo usuário
        const { data: unlockedData, error: unlockedError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);
        
        if (unlockedError) {
          console.error('Erro ao buscar conquistas desbloqueadas:', unlockedError);
        }
        
        // Mapear conquistas com status de desbloqueio
        const unlockedIds = unlockedData?.map(item => item.achievement_id) || [];
        const achievements = achievementsData.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          image_url: achievement.image_url,
          unlocked: unlockedIds.includes(achievement.id)
        }));
        
        setProgress({
          challenge_7days: progressData?.challenge_7days_progress || 0,
          challenge_28days: progressData?.challenge_28days_progress || 0,
          achievements
        });
      } catch (error) {
        console.error('Erro ao buscar dados de progresso:', error);
        setError('Erro ao carregar dados de progresso. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('progress.title')}
      </h1>
      
      {/* Barras de progresso */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {t('dashboard.your_progress')}
        </h2>
        
        {progress.challenge_7days > 0 && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('dashboard.challenge_7days')}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.ceil(progress.challenge_7days * 7)}/7 {t('progress.days_completed')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-[#A675F5] h-2.5 rounded-full" 
                style={{ width: `${progress.challenge_7days * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {Math.round(progress.challenge_7days * 100)}% {t('progress.completed')}
            </div>
          </div>
        )}
        
        {progress.challenge_28days > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('dashboard.challenge_28days')}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.ceil(progress.challenge_28days * 28)}/28 {t('progress.days_completed')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-[#A675F5] h-2.5 rounded-full" 
                style={{ width: `${progress.challenge_28days * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {Math.round(progress.challenge_28days * 100)}% {t('progress.completed')}
            </div>
          </div>
        )}
        
        {progress.challenge_7days === 0 && progress.challenge_28days === 0 && (
          <div className="text-center text-gray-500 py-4">
            Você ainda não iniciou nenhum desafio.
          </div>
        )}
      </div>
      
      {/* Conquistas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {t('progress.achievements')}
        </h2>
        
        {progress.achievements.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Nenhuma conquista disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border ${
                  achievement.unlocked 
                    ? 'border-[#A675F5] bg-purple-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    achievement.unlocked 
                      ? 'bg-[#A675F5] text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {achievement.unlocked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressView;
