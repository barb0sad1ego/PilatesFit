// src/pages/challenge/[type]/day/[day].tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import ClassView from '../../../../components/class/ClassView';
import { AuthProvider } from '../../../../components/auth/AuthContext';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';

export default function ChallengeDayPage() {
  const router = useRouter();
  const { type, day } = router.query;
  
  // Verificar se os parâmetros são válidos
  const challengeType = type === '7days' || type === '28days' ? type : '7days';
  const dayNumber = parseInt(day as string) || 1;

  return (
    <AuthProvider>
      <ProtectedRoute>
        <ClassView 
          challengeType={challengeType as '7days' | '28days'} 
          day={dayNumber} 
        />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export async function getStaticPaths() {
  // Pré-renderizar algumas combinações comuns
  const paths = [
    { params: { type: '7days', day: '1' } },
    { params: { type: '28days', day: '1' } },
  ];
  
  return {
    paths,
    fallback: 'blocking', // Gerar outras páginas sob demanda
  };
}
