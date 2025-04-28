// src/pages/index.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import WelcomeScreen from '../components/welcome/WelcomeScreen';

export default function Home() {
  return (
    <WelcomeScreen />
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
