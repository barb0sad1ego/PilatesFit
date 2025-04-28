// src/components/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../auth/AuthContext';
import ChallengeCard from './ChallengeCard';
import { supabase } from '../../lib/supabase';

interface UserProgress {
  challenge_7days: number;
  challenge_28days: number;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    challenge_7days: 0,
    challenge_28days: 0
  });
  const [loading, setLoading] = useState(true);

  // Buscar progresso do usuário
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar progresso:', error);
          return;
        }
        
        if (data) {
          setProgress({
            challenge_7days: data.challenge_7days_progress || 0,
            challenge_28days: data.challenge_28days_progress || 0
          });
        }
      } catch (error) {
        console.error('Erro ao buscar progresso:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('dashboard.title')}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChallengeCard 
            type="7days" 
            progress={progress.challenge_7days}
            image="/images/challenge-7days.jpg"
          />
          <ChallengeCard 
            type="28days" 
            progress={progress.challenge_28days}
            image="/images/challenge-28days.jpg"
          />
        </div>
      )}
      
      {/* Seção de progresso */}
      {(progress.challenge_7days > 0 || progress.challenge_28days > 0) && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('dashboard.your_progress')}
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            {progress.challenge_7days > 0 && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {t('dashboard.challenge_7days')}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.ceil(progress.challenge_7days * 7)}/7
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#A675F5] h-2.5 rounded-full" 
                    style={{ width: `${progress.challenge_7days * 100}%` }}
                  ></div>
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
                    {Math.ceil(progress.challenge_28days * 28)}/28
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#A675F5] h-2.5 rounded-full" 
                    style={{ width: `${progress.challenge_28days * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
