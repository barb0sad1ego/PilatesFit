// src/components/dashboard/ChallengeCard.tsx
import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface ChallengeCardProps {
  type: '7days' | '28days';
  progress?: number;
  image?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  type, 
  progress = 0,
  image = '/placeholder-challenge.jpg'
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const title = type === '7days' 
    ? t('dashboard.challenge_7days') 
    : t('dashboard.challenge_28days');
  
  const description = type === '7days'
    ? 'Comece com um desafio curto e intenso de 7 dias'
    : 'Transforme seu corpo e mente com nosso desafio completo de 28 dias';
  
  const days = type === '7days' ? 7 : 28;
  const hasStarted = progress > 0;
  
  const handleStartChallenge = () => {
    router.push(`/challenge/${type}/day/${hasStarted ? Math.ceil(progress * days) : 1}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagem do desafio */}
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Conteúdo */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {/* Barra de progresso */}
        {progress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[#A675F5] h-2.5 rounded-full" 
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {Math.ceil(progress * days)}/{days} {t('progress.days_completed')}
            </div>
          </div>
        )}
        
        {/* Botão */}
        <button
          onClick={handleStartChallenge}
          className="w-full bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A675F5] focus:ring-opacity-50 transition-colors"
        >
          {hasStarted 
            ? t('dashboard.continue_challenge') 
            : t('dashboard.start_challenge')}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
