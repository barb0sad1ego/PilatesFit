# Documentação do PilatesFit

## Visão Geral

PilatesFit é um aplicativo web multilíngue para desafios de Pilates na parede, focado em estética corporal, flexibilidade e bem-estar. O aplicativo oferece desafios de 7 e 28 dias, com suporte para quatro idiomas (Português, Inglês, Espanhol e Francês).

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (autenticação, banco de dados)
- **Internacionalização**: next-i18next
- **Estilização**: Tailwind CSS

## Estrutura do Projeto

```
pilatesfit/
├── public/
│   └── locales/           # Arquivos de tradução
│       ├── pt-BR/
│       ├── en-US/
│       ├── es-ES/
│       └── fr-FR/
├── src/
│   ├── components/        # Componentes React
│   │   ├── admin/         # Componentes do painel administrativo
│   │   ├── auth/          # Componentes de autenticação
│   │   ├── class/         # Componentes de aula
│   │   ├── dashboard/     # Componentes do dashboard
│   │   ├── materials/     # Componentes de materiais
│   │   ├── progress/      # Componentes de progresso
│   │   └── welcome/       # Componentes de boas-vindas
│   ├── hooks/             # Hooks personalizados
│   ├── lib/               # Utilitários e APIs
│   └── pages/             # Páginas do Next.js
└── next-i18next.config.js # Configuração de internacionalização
```

## Funcionalidades Principais

### 1. Sistema Multilíngue
- Suporte para Português (pt-BR), Inglês (en-US), Espanhol (es-ES) e Francês (fr-FR)
- Detecção automática do idioma do navegador
- Seleção manual de idioma
- Armazenamento da preferência de idioma no localStorage

### 2. Autenticação
- Login e cadastro via e-mail e senha
- Recuperação de senha
- Verificação de acesso para usuários autorizados
- Proteção de rotas para áreas restritas
- Integração com webhook do Cartpanda para receber compradores

### 3. Dashboard
- Exibição dos desafios disponíveis (7 e 28 dias)
- Visualização do progresso atual
- Acesso às aulas e materiais

### 4. Aulas
- Reprodução de vídeos
- Marcação de aulas como concluídas
- Navegação entre dias
- Atualização automática do progresso

### 5. Progresso
- Visualização do progresso em cada desafio
- Exibição de conquistas desbloqueadas

### 6. Materiais
- Visualização de materiais complementares (PDFs)
- Organização por categorias
- Visualizador de PDF integrado

### 7. Painel Administrativo
- Gerenciamento de aulas (adicionar, editar, excluir)
- Gerenciamento de materiais (adicionar, editar, excluir)
- Filtros e busca
- Acesso restrito a administradores

## Fluxo de Navegação

1. **Tela de Boas-vindas**: O usuário seleciona o idioma e continua
2. **Login/Cadastro**: O usuário faz login ou se cadastra
3. **Dashboard**: Exibe os desafios disponíveis
4. **Aula**: O usuário assiste à aula e marca como concluída
5. **Progresso**: O usuário acompanha seu progresso
6. **Materiais**: O usuário acessa materiais complementares

## Banco de Dados

### Tabelas Principais

1. **users**: Usuários do sistema (gerenciado pelo Supabase Auth)
2. **profiles**: Perfis de usuários com informações adicionais
3. **authorized_emails**: E-mails autorizados a acessar o aplicativo
4. **classes**: Aulas dos desafios
5. **materials**: Materiais complementares
6. **user_class_progress**: Progresso do usuário nas aulas
7. **user_progress**: Progresso geral do usuário nos desafios
8. **achievements**: Conquistas disponíveis
9. **user_achievements**: Conquistas desbloqueadas pelos usuários

## Configuração do Ambiente

### Requisitos
- Node.js 14+
- npm ou pnpm

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Instalação
```bash
# Instalar dependências
npm install
# ou
pnpm install

# Iniciar servidor de desenvolvimento
npm run dev
# ou
pnpm dev

# Construir para produção
npm run build
# ou
pnpm build
```

## Implantação

O aplicativo pode ser implantado em qualquer plataforma que suporte Next.js, como Vercel, Netlify ou servidores próprios.

### Passos para Implantação na Vercel
1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Implante o aplicativo

## Webhook do Cartpanda

O aplicativo inclui um endpoint de webhook para integração com a plataforma Cartpanda:

```
/api/webhook/cartpanda
```

Este endpoint recebe os dados dos compradores e adiciona seus e-mails à tabela `authorized_emails` no Supabase, permitindo que eles acessem o aplicativo após a compra.

## Manutenção e Atualizações

### Adicionando Novos Idiomas
1. Crie uma nova pasta em `public/locales/` com o código do idioma
2. Copie os arquivos de tradução de um idioma existente
3. Traduza os textos
4. Adicione o novo idioma à lista em `src/lib/i18n.ts`

### Adicionando Novas Aulas
Use o painel administrativo para adicionar novas aulas aos desafios.

### Adicionando Novos Materiais
Use o painel administrativo para adicionar novos materiais complementares.

## Considerações de Segurança

- O acesso ao aplicativo é restrito a usuários autorizados
- O painel administrativo é restrito a usuários com role: admin
- As senhas são gerenciadas pelo Supabase Auth e armazenadas de forma segura
- As rotas protegidas verificam a autenticação e autorização do usuário

## Suporte e Contato

Para suporte técnico ou dúvidas sobre o aplicativo, entre em contato com a equipe de desenvolvimento.
