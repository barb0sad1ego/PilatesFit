// src/lib/i18n.ts
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

// Idiomas suportados
export const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
];

// Hook para detectar o idioma do navegador
export const useDetectLanguage = () => {
  const [detectedLanguage, setDetectedLanguage] = useState('pt-BR');
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const browserLanguage = window.navigator.language;
      
      // Verificar se o idioma do navegador é um dos suportados
      const supportedLanguage = LANGUAGES.find(
        lang => browserLanguage.startsWith(lang.code.split('-')[0])
      );
      
      if (supportedLanguage) {
        setDetectedLanguage(supportedLanguage.code);
      }
    }
  }, []);
  
  return detectedLanguage;
};

// Hook para gerenciar o idioma
export const useLanguage = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const detectedLanguage = useDetectLanguage();
  
  // Mudar o idioma
  const changeLanguage = async (locale: string) => {
    // Salvar preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLanguage', locale);
    }
    
    // Mudar o idioma no router
    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale });
  };
  
  // Inicializar o idioma com base na preferência salva ou no idioma detectado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('userLanguage');
      
      if (savedLanguage && savedLanguage !== router.locale) {
        changeLanguage(savedLanguage);
      } else if (!router.locale && detectedLanguage) {
        changeLanguage(detectedLanguage);
      }
    }
  }, [detectedLanguage, router.locale]);
  
  return {
    currentLanguage: router.locale || 'pt-BR',
    changeLanguage,
    languages: LANGUAGES,
  };
};
