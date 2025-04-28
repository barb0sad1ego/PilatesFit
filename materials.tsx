// src/pages/materials.tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MaterialsList from '../components/materials/MaterialsList';
import { AuthProvider } from '../components/auth/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function MaterialsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MaterialsList />
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
