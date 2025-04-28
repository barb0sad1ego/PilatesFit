// src/components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isLoading, isAdmin, isAuthorized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirecionar para login se não estiver autenticado
        router.push('/login');
      } else if (!isAuthorized) {
        // Redirecionar para página de acesso não autorizado
        router.push('/unauthorized');
      } else if (adminOnly && !isAdmin) {
        // Redirecionar para dashboard se não for admin tentando acessar área restrita
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isAdmin, isAuthorized, adminOnly, router]);

  // Mostrar nada enquanto verifica autenticação
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A675F5]"></div>
    </div>;
  }

  // Se não estiver autenticado ou não autorizado, não renderiza o conteúdo
  if (!user || !isAuthorized || (adminOnly && !isAdmin)) {
    return null;
  }

  // Se estiver autenticado e autorizado, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
