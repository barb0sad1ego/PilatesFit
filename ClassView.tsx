// src/components/class/ClassView.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface ClassViewProps {
  challengeType: '7days' | '28days';
  day: number;
}

interface ClassData {
  id: string;
  title: string;
  video_url: string;
  description?: string;
  completed: boolean;
}

const ClassView: React.FC<ClassViewProps> = ({ challengeType, day }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalDays = challengeType === '7days' ? 7 : 28;

  // Buscar dados da aula
  useEffect(() => {
    const fetchClassData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Buscar dados da aula
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('challenge_type', challengeType)
          .eq('day', day)
          .eq('language', localStorage.getItem('userLanguage') || 'pt-BR')
          .single();
        
        if (classError) {
          console.error('Erro ao buscar aula:', classError);
          setError('Erro ao carregar a aula. Tente novamente mais tarde.');
          return;
        }
        
        // Verificar se o usuário já completou esta aula
        const { data: progressData, error: progressError } = await supabase
          .from('user_class_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('class_id', classData.id)
          .single();
        
        if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Erro ao buscar progresso:', progressError);
        }
        
        setClassData({
          id: classData.id,
          title: classData.title,
          video_url: classData.video_url,
          description: classData.description,
          completed: !!progressData
        });
      } catch (error) {
        console.error('Erro ao buscar dados da aula:', error);
        setError('Erro ao carregar a aula. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [user, challengeType, day]);

  // Marcar aula como concluída
  const markAsCompleted = async () => {
    if (!user || !classData) return;
    
    try {
      setSaving(true);
      
      // Inserir registro de conclusão
      const { error: progressError } = await supabase
        .from('user_class_progress')
        .insert([
          {
            user_id: user.id,
            class_id: classData.id,
            completed_at: new Date().toISOString()
          }
        ]);
      
      if (progressError) {
        console.error('Erro ao salvar progresso:', progressError);
        setError('Erro ao salvar progresso. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar progresso geral do desafio
      const { data: challengeProgress, error: challengeError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const progressField = challengeType === '7days' 
        ? 'challenge_7days_progress' 
        : 'challenge_28days_progress';
      
      if (challengeError && challengeError.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso do desafio:', challengeError);
      }
      
      // Calcular novo progresso
      const completedDays = day;
      const newProgress = completedDays / totalDays;
      
      // Inserir ou atualizar progresso
      if (!challengeProgress) {
        await supabase
          .from('user_progress')
          .insert([
            {
              user_id: user.id,
              [progressField]: newProgress
            }
          ]);
      } else {
        // Só atualiza se o novo progresso for maior que o atual
        if (newProgress > (challengeProgress[progressField] || 0)) {
          await supabase
            .from('user_progress')
            .update({ [progressField]: newProgress })
            .eq('user_id', user.id);
        }
      }
      
      // Atualizar estado local
      setClassData({
        ...classData,
        completed: true
      });
      
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      setError('Erro ao salvar progresso. Tente novamente mais tarde.');
    } finally {
      setSaving(false);
    }
  };

  // Navegar para o dia anterior
  const goToPreviousDay = () => {
    if (day > 1) {
      router.push(`/challenge/${challengeType}/day/${day - 1}`);
    }
  };

  // Navegar para o próximo dia
  const goToNextDay = () => {
    if (day < totalDays) {
      router.push(`/challenge/${challengeType}/day/${day + 1}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-4">
          Aula não encontrada.
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {classData.title}
      </h1>
      <div className="text-sm text-gray-500 mb-6">
        {t('class.day')} {day} {challengeType === '7days' ? '(7 dias)' : '(28 dias)'}
      </div>
      
      {/* Vídeo */}
      <div className="bg-black aspect-video w-full mb-6 rounded-lg overflow-hidden">
        <iframe
          src={classData.video_url}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Descrição */}
      {classData.description && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <p className="text-gray-700">{classData.description}</p>
        </div>
      )}
      
      {/* Botões de navegação e conclusão */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={goToPreviousDay}
            disabled={day <= 1}
            className={`px-4 py-2 rounded-md ${
              day <= 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('class.previous_day')}
          </button>
          
          <button
            onClick={goToNextDay}
            disabled={day >= totalDays}
            className={`px-4 py-2 rounded-md ${
              day >= totalDays
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('class.next_day')}
          </button>
        </div>
        
        <button
          onClick={markAsCompleted}
          disabled={classData.completed || saving}
          className={`px-4 py-2 rounded-md ${
            classData.completed
              ? 'bg-[#A1F0DD] text-gray-700 cursor-not-allowed'
              : saving
              ? 'bg-[#A675F5] opacity-75 text-white cursor-wait'
              : 'bg-[#A675F5] hover:bg-[#8A5AD5] text-white'
          }`}
        >
          {classData.completed
            ? t('class.congratulations')
            : saving
            ? t('common.loading')
            : t('class.mark_completed')}
        </button>
      </div>
    </div>
  );
};

export default ClassView;
