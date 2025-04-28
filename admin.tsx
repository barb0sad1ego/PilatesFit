// src/pages/admin.tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AdminPanel from '../components/admin/AdminPanel';
import { AuthProvider } from '../components/auth/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AuthProvider>
      <ProtectedRoute adminOnly={true}>
        <AdminPanel />
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
