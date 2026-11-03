# Web Saúde — Interface

Front-end Next.js da plataforma de busca e gerenciamento de unidades de saúde.

O projeto segue arquitetura em camadas com Pages Router, BFF (Backend for Frontend) nas rotas internas de `pages/api`, gerenciamento de estado assíncrono via SWR, visual responsivo com Sass e exibição geográfica com Mapbox GL JS.

---

## 🚀 Tecnologias

- **Next.js 15** + **React 18** + **TypeScript** (Pages Router)
- **Sass (SCSS)** para estilização com tokens globais
- **SWR** para busca de dados em cache e revalidação
- **Mapbox GL JS** para mapas interativos e marcadores de estabelecimentos
- **Yarn** como gerenciador de pacotes
- **Backend Integrado:** NestJS + PostgreSQL (Supabase) + Elasticsearch (`WEB_SAUDE_API_URL`)

> **Importante:** Utilize **Yarn** para gerenciar dependências e rodar o projeto localmente para manter paridade com o CI.

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── common/       # Componentes reutilizáveis (Alert, BrandLink, Select, etc.)
│   ├── details/      # Visualização da unidade (UnidadeDetails fiel ao protótipo)
│   ├── layouts/      # Layout base, Header, Footer e Sidebar de conta
│   ├── resultView/   # Lista de resultados (ExploreUnitItem, UnidadeRow) e ResultsMap
│   └── search/       # Barra de busca (ExploreSearchBar), filtros e UseLocationButton
├── configs/          # Mocks, rotas, colunas e configurações de exibição
├── contexts/         # Contextos globais (AuthContext, ThemeContext)
├── hooks/            # Hooks de dados e funcionalidades (useUnidades, useFavorite, useGeolocation)
├── lib/              # Utilitários, adaptadores de API (estabelecimentoAdapter), geo e proxies
├── pages/
│   ├── api/          # BFF (proxy de busca, unidades, mídias e geocodificação)
│   ├── admin/        # Painel administrativo
│   ├── manager/      # Gestão de unidades pelo gestor
│   └── units/        # Página de detalhes da unidade por ID (/units/[id])
├── services/         # Clientes HTTP (ApiClient, UnidadeService, AuthService, AlertService)
├── styles/           # Tokens visuais e estilos globais (globals.scss)
└── types/            # Tipos e interfaces de domínio e da API
```

---

## 🗺️ Rotas da Aplicação

### Páginas

| Rota                 | Descrição                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `/`                  | **Home:** Busca combinada com filtros, scroll infinito e mapa interativo                          |
| `/city`              | Seleção rápida de estabelecimentos por cidade                                                     |
| `/units/[id]`        | **Detalhes da unidade:** dados reais da API, fotos via proxy, contatos, horários e especialidades |
| `/login`             | Autenticação de usuários                                                                          |
| `/register`          | Cadastro de novos usuários                                                                        |
| `/verify-email`      | Confirmação de conta com código                                                                   |
| `/recover-password`  | Redefinição de senha em duas etapas                                                               |
| `/profile`           | Dados cadastrais e perfil da conta                                                                |
| `/favorites`         | Unidades salvas pelo paciente                                                                     |
| `/reviews`           | Histórico de avaliações do paciente                                                               |
| `/manager/units`     | Listagem de unidades gerenciadas pelo gestor                                                      |
| `/manager/units/new` | Cadastro de nova unidade pelo gestor                                                              |
| `/admin`             | Painel de controle e aprovações do administrador                                                  |

> **Nota:** A antiga rota `/units` é redirecionada automaticamente para a home (`/`), onde a busca e os filtros estão centralizados.

### Rotas do BFF (`/api/*`)

- `GET /api/search` — Proxy de busca geográfica e textual com filtros para o backend.
- `GET /api/units/[id]` — Detalha unidade real direto do backend (PostgreSQL / Supabase).
- `GET /api/media/[id]` — Proxy de streaming binário de fotos gravadas no banco de dados.
- `GET /api/specialties` — Lista especialidades médicas ativas.
- `GET /api/reverse-geocode` — Resolução reversa de coordenadas via OpenStreetMap/Nominatim.
- `POST /api/auth/[...auth]` — Endpoints de autenticação, login e recuperação de conta.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env.local
```

Configurações disponíveis:

| Variável                   | Descrição                        | Exemplo                                                         |
| -------------------------- | -------------------------------- | --------------------------------------------------------------- |
| `WEB_SAUDE_API_URL`        | URL base da API NestJS           | `https://web-saude-api.onrender.com` ou `http://localhost:3000` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token de acesso da API do Mapbox | `pk.eyJ1...`                                                    |
| `NEXT_PUBLIC_APP_NAME`     | Nome de exibição da aplicação    | `Web Saúde`                                                     |

---

## 💻 Como Rodar o Projeto

1. Instale as dependências:

   ```bash
   yarn
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   yarn dev
   ```

3. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

### Outros Scripts

```bash
# Executar a verificação de linter
yarn lint

# Formatação e checagem de código com Prettier
yarn format
yarn format:check

# Gerar build de produção
yarn build

# Iniciar servidor em modo produção
yarn start
```

---

## 🏷️ Padrão de Commits

As mensagens devem seguir o formato `tipo(#issue): descrição em português e minúsculas`:

```text
feat(#32): integra detalhes da unidade com a api e alinha ao prototipo
fix(#10): corrige validação de e-mail na recuperação
chore(#1): atualiza dependências do yarn
```

---

## 🤖 Integração Contínua (CI)

O fluxo do GitHub Actions em `.github/workflows/ci.yml` é executado automaticamente em pushes e pull requests para as branches principais, validando:

1. `yarn install --frozen-lockfile`
2. `yarn lint`
3. `yarn format:check`
4. `yarn build`
