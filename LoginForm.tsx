// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from './AuthContext';

const LoginForm: React.FC = () => {
  const { t } = useTranslation('common');
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await signIn(email, password);
      setSuccess(t('auth.login_success'));
    } catch (err: any) {
      setError(err.message || t('auth.login_error'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#A675F5]">
          {t('auth.login')}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A675F5]"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A675F5]"
            required
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A675F5] focus:ring-opacity-50 transition-colors"
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </button>
          
          <a
            href="/forgot-password"
            className="inline-block align-baseline font-bold text-sm text-[#A675F5] hover:text-[#8A5AD5]"
          >
            {t('auth.forgot_password')}
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
