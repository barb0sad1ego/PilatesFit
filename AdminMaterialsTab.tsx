// src/components/admin/AdminMaterialsTab.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '../../lib/supabase';
import { Material } from '../../lib/api';

const AdminMaterialsTab: React.FC = () => {
  const { t } = useTranslation('common');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Buscar materiais
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('category', { ascending: true })
          .order('title', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar materiais:', error);
          setError('Erro ao carregar materiais. Tente novamente mais tarde.');
          return;
        }
        
        setMaterials(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar materiais:', error);
        setError(error.message || 'Erro ao carregar materiais. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);

  // Filtrar materiais
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = filterLanguage === '' || 
      material.language === filterLanguage;
    
    const matchesCategory = filterCategory === '' || 
      material.category === filterCategory;
    
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  // Obter categorias únicas
  const uniqueCategories = Array.from(new Set(materials.map(m => m.category)));

  // Adicionar novo material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMaterial) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .insert([editingMaterial]);
      
      if (error) {
        console.error('Erro ao adicionar material:', error);
        setError('Erro ao adicionar material. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de materiais
      setMaterials([...materials, { ...editingMaterial, id: Date.now().toString() }]);
      setIsAdding(false);
      setEditingMaterial(null);
    } catch (error: any) {
      console.error('Erro ao adicionar material:', error);
      setError(error.message || 'Erro ao adicionar material. Tente novamente mais tarde.');
    }
  };

  // Atualizar material existente
  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMaterial) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .update(editingMaterial)
        .eq('id', editingMaterial.id);
      
      if (error) {
        console.error('Erro ao atualizar material:', error);
        setError('Erro ao atualizar material. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de materiais
      setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
      setEditingMaterial(null);
    } catch (error: any) {
      console.error('Erro ao atualizar material:', error);
      setError(error.message || 'Erro ao atualizar material. Tente novamente mais tarde.');
    }
  };

  // Excluir material
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir material:', error);
        setError('Erro ao excluir material. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de materiais
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir material:', error);
      setError(error.message || 'Erro ao excluir material. Tente novamente mais tarde.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Filtros e busca */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.language')}
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os idiomas</option>
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
              <option value="es-ES">Espanhol</option>
              <option value="fr-FR">Francês</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.category')}
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas as categorias</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Botão de adicionar */}
      <div className="mb-4">
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingMaterial({
              id: '',
              title: '',
              description: '',
              pdf_url: '',
              category: 'Planos alimentares',
              language: 'pt-BR'
            });
          }}
          className="bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md"
        >
          {t('admin.add')}
        </button>
      </div>
      
      {/* Formulário de edição/adição */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {isAdding ? 'Adicionar Material' : 'Editar Material'}
            </h2>
            
            <form onSubmit={isAdding ? handleAddMaterial : handleUpdateMaterial}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.material_title')}
                  </label>
                  <input
                    type="text"
                    value={editingMaterial.title}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.category')}
                  </label>
                  <input
                    type="text"
                    value={editingMaterial.category}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    list="categories"
                  />
                  <datalist id="categories">
                    {uniqueCategories.map(category => (
                      <option key={category} value={category} />
                    ))}
                    <option value="Planos alimentares" />
                    <option value="Receitas" />
                    <option value="Materiais bônus" />
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.language')}
                  </label>
                  <select
                    value={editingMaterial.language}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="pt-BR">Português</option>
                    <option value="en-US">Inglês</option>
                    <option value="es-ES">Espanhol</option>
                    <option value="fr-FR">Francês</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.pdf_url')}
                  </label>
                  <input
                    type="url"
                    value={editingMaterial.pdf_url}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, pdf_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')}
                </label>
                <textarea
                  value={editingMaterial.description}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMaterial(null);
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A675F5] hover:bg-[#8A5AD5] text-white rounded-md"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Lista de materiais */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.material_title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.language')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhum material encontrado
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{material.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{material.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{material.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {material.language === 'pt-BR' ? 'Português' : 
                       material.language === 'en-US' ? 'Inglês' : 
                       material.language === 'es-ES' ? 'Espanhol' : 'Francês'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingMaterial(material);
                        setIsAdding(false);
                      }}
                      className="text-[#A675F5] hover:text-[#8A5AD5] mr-3"
                    >
                      {t('admin.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaterialsTab;
