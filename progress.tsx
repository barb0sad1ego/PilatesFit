// src/pages/progress.tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProgressView from '../components/progress/ProgressView';
import { AuthProvider } from '../components/auth/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function ProgressPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ProgressView />
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
