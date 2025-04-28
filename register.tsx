// src/pages/register.tsx
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import RegisterForm from '../components/auth/RegisterForm';
import { AuthProvider } from '../components/auth/AuthContext';

export default function Register() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm />
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
