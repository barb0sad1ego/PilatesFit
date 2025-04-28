# Guia de Instalação e Uso do PilatesFit

Este guia fornece instruções passo a passo para instalar, configurar e utilizar o aplicativo PilatesFit.

## Instalação

### Pré-requisitos
- Node.js 14+ instalado
- npm ou pnpm instalado
- Conta no Supabase (para backend)

### Passos para Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pilatesfit.git
cd pilatesfit
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. Configure o banco de dados Supabase:
   - Crie um novo projeto no Supabase
   - Execute os scripts SQL fornecidos para criar as tabelas necessárias
   - Configure a autenticação por e-mail no Supabase

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
pnpm dev
```

6. Acesse o aplicativo em `http://localhost:3000`

## Configuração do Banco de Dados

Execute os seguintes scripts SQL no Supabase SQL Editor:

```sql
-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de e-mails autorizados
CREATE TABLE authorized_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aulas
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  day INTEGER NOT NULL,
  challenge_type TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de materiais
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso nas aulas
CREATE TABLE user_class_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  class_id UUID REFERENCES classes(id) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Tabela de progresso geral
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  challenge_7days_progress FLOAT DEFAULT 0,
  challenge_28days_progress FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas do usuário
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Trigger para criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user();
```

## Uso do Aplicativo

### Para Usuários

1. **Tela de Boas-vindas**:
   - Selecione seu idioma preferido
   - Clique em "Continuar"

2. **Login/Cadastro**:
   - Faça login com seu e-mail e senha
   - Se for seu primeiro acesso, use a opção de cadastro
   - Se esqueceu sua senha, use a opção de recuperação

3. **Dashboard**:
   - Visualize os desafios disponíveis (7 e 28 dias)
   - Clique em um desafio para iniciá-lo ou continuá-lo

4. **Aula**:
   - Assista ao vídeo da aula
   - Marque como concluída ao finalizar
   - Navegue entre os dias usando os botões de navegação

5. **Progresso**:
   - Acompanhe seu progresso nos desafios
   - Visualize suas conquistas desbloqueadas

6. **Materiais**:
   - Acesse materiais complementares organizados por categoria
   - Visualize os PDFs diretamente no aplicativo

### Para Administradores

1. **Acesso ao Painel Administrativo**:
   - Faça login com uma conta de administrador
   - Acesse `/admin` na URL

2. **Gerenciamento de Aulas**:
   - Adicione, edite ou exclua aulas
   - Configure título, dia, categoria, link do vídeo e idioma
   - Use os filtros para encontrar aulas específicas

3. **Gerenciamento de Materiais**:
   - Adicione, edite ou exclua materiais
   - Configure título, descrição, categoria, URL do PDF e idioma
   - Use os filtros para encontrar materiais específicos

## Configuração do Webhook do Cartpanda

Para integrar com a plataforma Cartpanda:

1. No painel do Cartpanda, configure um webhook para enviar dados para:
   ```
   https://seu-dominio.com/api/webhook/cartpanda
   ```

2. Certifique-se de que o payload inclua pelo menos:
   ```json
   {
     "customer": {
       "email": "email_do_cliente@exemplo.com"
     }
   }
   ```

3. O webhook adicionará automaticamente o e-mail à tabela `authorized_emails` no Supabase.

## Solução de Problemas Comuns

### Problema: Usuário não consegue fazer login
**Solução**: Verifique se o e-mail está na tabela `authorized_emails` no Supabase.

### Problema: Vídeos não carregam
**Solução**: Verifique se as URLs dos vídeos estão corretas e se são URLs de incorporação válidas.

### Problema: Idioma não muda
**Solução**: Limpe o localStorage do navegador e tente novamente.

### Problema: Erro no painel administrativo
**Solução**: Verifique se o usuário tem a role "admin" na tabela profiles.

## Suporte

Para suporte técnico ou dúvidas sobre o aplicativo, entre em contato com a equipe de desenvolvimento.
