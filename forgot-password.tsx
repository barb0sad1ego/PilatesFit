// src/pages/forgot-password.tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { AuthProvider } from '../components/auth/AuthContext';

export default function ForgotPassword() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm />
      </div>
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
