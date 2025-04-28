// src/components/materials/MaterialsList.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';

interface Material {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  category: string;
}

const MaterialsList: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Buscar materiais
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Buscar materiais no idioma atual
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('language', localStorage.getItem('userLanguage') || 'pt-BR')
          .order('category', { ascending: true })
          .order('title', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar materiais:', error);
          setError('Erro ao carregar materiais. Tente novamente mais tarde.');
          return;
        }
        
        setMaterials(data || []);
      } catch (error) {
        console.error('Erro ao buscar materiais:', error);
        setError('Erro ao carregar materiais. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [user]);

  // Agrupar materiais por categoria
  const materialsByCategory = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = [];
    }
    acc[material.category].push(material);
    return acc;
  }, {} as Record<string, Material[]>);

  // Abrir PDF
  const openPdf = (material: Material) => {
    setSelectedMaterial(material);
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
        {t('materials.title')}
      </h1>
      
      {/* Visualizador de PDF */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
          <div className="bg-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">{selectedMaterial.title}</h2>
            <button 
              onClick={() => setSelectedMaterial(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 bg-gray-100">
            <iframe 
              src={`${selectedMaterial.pdf_url}#toolbar=0`} 
              className="w-full h-full"
              title={selectedMaterial.title}
            ></iframe>
          </div>
        </div>
      )}
      
      {/* Lista de materiais */}
      {Object.keys(materialsByCategory).length === 0 ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
          Nenhum material disponível no momento.
        </div>
      ) : (
        Object.entries(materialsByCategory).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((material) => (
                <div 
                  key={material.id} 
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openPdf(material)}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-[#A675F5] rounded-full flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800">{material.title}</h3>
                  </div>
                  {material.description && (
                    <p className="text-gray-600 text-sm ml-13">{material.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MaterialsList;
