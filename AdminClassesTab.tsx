// src/components/admin/AdminClassesTab.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '../../lib/supabase';
import { Class } from '../../lib/api';

const AdminClassesTab: React.FC = () => {
  const { t } = useTranslation('common');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterChallenge, setFilterChallenge] = useState('');

  // Buscar aulas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('challenge_type', { ascending: true })
          .order('day', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar aulas:', error);
          setError('Erro ao carregar aulas. Tente novamente mais tarde.');
          return;
        }
        
        setClasses(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar aulas:', error);
        setError(error.message || 'Erro ao carregar aulas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  // Filtrar aulas
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = searchTerm === '' || 
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = filterLanguage === '' || 
      classItem.language === filterLanguage;
    
    const matchesChallenge = filterChallenge === '' || 
      classItem.challenge_type === filterChallenge;
    
    return matchesSearch && matchesLanguage && matchesChallenge;
  });

  // Adicionar nova aula
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClass) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .insert([editingClass]);
      
      if (error) {
        console.error('Erro ao adicionar aula:', error);
        setError('Erro ao adicionar aula. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de aulas
      setClasses([...classes, { ...editingClass, id: Date.now().toString() }]);
      setIsAdding(false);
      setEditingClass(null);
    } catch (error: any) {
      console.error('Erro ao adicionar aula:', error);
      setError(error.message || 'Erro ao adicionar aula. Tente novamente mais tarde.');
    }
  };

  // Atualizar aula existente
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClass) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .update(editingClass)
        .eq('id', editingClass.id);
      
      if (error) {
        console.error('Erro ao atualizar aula:', error);
        setError('Erro ao atualizar aula. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de aulas
      setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
      setEditingClass(null);
    } catch (error: any) {
      console.error('Erro ao atualizar aula:', error);
      setError(error.message || 'Erro ao atualizar aula. Tente novamente mais tarde.');
    }
  };

  // Excluir aula
  const handleDeleteClass = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir aula:', error);
        setError('Erro ao excluir aula. Tente novamente mais tarde.');
        return;
      }
      
      // Atualizar lista de aulas
      setClasses(classes.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir aula:', error);
      setError(error.message || 'Erro ao excluir aula. Tente novamente mais tarde.');
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
              placeholder="Buscar por título..."
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
              value={filterChallenge}
              onChange={(e) => setFilterChallenge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os desafios</option>
              <option value="7days">Desafio de 7 dias</option>
              <option value="28days">Desafio de 28 dias</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Botão de adicionar */}
      <div className="mb-4">
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingClass({
              id: '',
              title: '',
              day: 1,
              challenge_type: '7days',
              video_url: '',
              description: '',
              language: 'pt-BR'
            });
          }}
          className="bg-[#A675F5] hover:bg-[#8A5AD5] text-white font-bold py-2 px-4 rounded-md"
        >
          {t('admin.add')}
        </button>
      </div>
      
      {/* Formulário de edição/adição */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {isAdding ? 'Adicionar Aula' : 'Editar Aula'}
            </h2>
            
            <form onSubmit={isAdding ? handleAddClass : handleUpdateClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.class_title')}
                  </label>
                  <input
                    type="text"
                    value={editingClass.title}
                    onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.day')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editingClass.challenge_type === '7days' ? 7 : 28}
                    value={editingClass.day}
                    onChange={(e) => setEditingClass({ ...editingClass, day: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.category')}
                  </label>
                  <select
                    value={editingClass.challenge_type}
                    onChange={(e) => setEditingClass({ ...editingClass, challenge_type: e.target.value as '7days' | '28days' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="7days">Desafio de 7 dias</option>
                    <option value="28days">Desafio de 28 dias</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.language')}
                  </label>
                  <select
                    value={editingClass.language}
                    onChange={(e) => setEditingClass({ ...editingClass, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="pt-BR">Português</option>
                    <option value="en-US">Inglês</option>
                    <option value="es-ES">Espanhol</option>
                    <option value="fr-FR">Francês</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.video_link')}
                </label>
                <input
                  type="url"
                  value={editingClass.video_url}
                  onChange={(e) => setEditingClass({ ...editingClass, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')}
                </label>
                <textarea
                  value={editingClass.description || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(null);
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
      
      {/* Lista de aulas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.class_title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.day')}
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
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma aula encontrada
                </td>
              </tr>
            ) : (
              filteredClasses.map((classItem) => (
                <tr key={classItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{classItem.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Dia {classItem.day}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {classItem.challenge_type === '7days' ? 'Desafio 7 dias' : 'Desafio 28 dias'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {classItem.language === 'pt-BR' ? 'Português' : 
                       classItem.language === 'en-US' ? 'Inglês' : 
                       classItem.language === 'es-ES' ? 'Espanhol' : 'Francês'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingClass(classItem);
                        setIsAdding(false);
                      }}
                      className="text-[#A675F5] hover:text-[#8A5AD5] mr-3"
                    >
                      {t('admin.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem.id)}
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

export default AdminClassesTab;
