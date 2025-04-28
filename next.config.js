/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['pt-BR', 'en-US', 'es-ES', 'fr-FR'],
    defaultLocale: 'pt-BR',
    localeDetection: false
  },
  output: 'standalone'
}

module.exports = nextConfig
