// src/hooks/useMaterials.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { materialsApi } from '../lib/api';

export const useMaterials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsByCategory, setMaterialsByCategory] = useState<Record<string, any[]>>({});

  // Buscar materiais
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Obter idioma atual
        const currentLanguage = localStorage.getItem('userLanguage') || 'pt-BR';
        
        // Buscar materiais
        const materialsData = await materialsApi.getMaterials(currentLanguage);
        
        setMaterials(materialsData);
        
        // Agrupar por categoria
        const groupedMaterials = materialsData.reduce((acc, material) => {
          if (!acc[material.category]) {
            acc[material.category] = [];
          }
          acc[material.category].push(material);
          return acc;
        }, {} as Record<string, any[]>);
        
        setMaterialsByCategory(groupedMaterials);
      } catch (error: any) {
        console.error('Erro ao buscar materiais:', error);
        setError(error.message || 'Erro ao carregar materiais. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [user]);

  return {
    loading,
    error,
    materials,
    materialsByCategory
  };
};
