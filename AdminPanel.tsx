// src/components/admin/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminClassesTab from './AdminClassesTab';
import AdminMaterialsTab from './AdminMaterialsTab';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'materials'>('classes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se o usuário é admin
    if (!isAdmin) {
      setError('Acesso não autorizado');
    }
    setLoading(false);
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || 'Acesso não autorizado'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('admin.title')}
      </h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'classes'
                ? 'border-[#A675F5] text-[#A675F5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.classes')}
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'materials'
                ? 'border-[#A675F5] text-[#A675F5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.materials')}
          </button>
        </nav>
      </div>
      
      {/* Conteúdo da tab ativa */}
      {activeTab === 'classes' ? (
        <AdminClassesTab />
      ) : (
        <AdminMaterialsTab />
      )}
    </div>
  );
};

export default AdminPanel;
