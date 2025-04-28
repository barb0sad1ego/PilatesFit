// src/components/welcome/WelcomeScreen.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import LanguageSelector from '../LanguageSelector';
import { useLanguage } from '../../lib/i18n';

const WelcomeScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-4xl font-bold text-[#A675F5] mb-2">PilatesFit</div>
          <div className="h-1 w-24 bg-[#A1F0DD] mx-auto"></div>
        </div>
        
        {/* Título e subtítulo */}
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          {t('welcome.title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('welcome.subtitle')}
        </p>
        
        {/* Seletor de idioma */}
        <div className="mb-8">
          <LanguageSelector />
        </div>
        
        {/* Botão de continuar */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A675F5] focus:ring-opacity-50 transition-colors"
        >
          {t('welcome.continue')}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
