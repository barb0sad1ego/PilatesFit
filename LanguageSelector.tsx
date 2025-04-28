// src/components/LanguageSelector.tsx
import React from 'react';
import { useTranslation } from 'next-i18next';
import { useLanguage, LANGUAGES } from '../lib/i18n';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">
        {t('welcome.language_selection')}
      </label>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === language.code
                ? 'bg-[#A675F5] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
