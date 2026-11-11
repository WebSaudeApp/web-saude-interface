# Web Saúde — interface

Front-end Next.js da plataforma de busca de unidades de saúde.

A organização segue a arquitetura do BrCris (`brcris-interface-busca`): Pages Router, configs por entidade, services, BFF em `pages/api` e layout global. O domínio, o visual e o backend são do Web Saúde. Nada de Elasticsearch nem código do BrCris.

## Stack

- Next.js 15 + React 18 + TypeScript
- Sass
- SWR
- Yarn
- Backend previsto: Node.js + PostgreSQL (`WEB_SAUDE_API_URL`)

Use **Yarn**. Não use npm neste repositório.

## Camadas

```
src/
  pages/           rotas e BFF (/api)
  components/      layout, search, resultView, details
  configs/         Unidades, filtros, rotas, campos de exibição
  services/        ApiClient, UnidadeService, AuthService
  contexts/        tema e autenticação
  hooks/           SWR e papéis
  types/           entidades e busca
  lib/             proxy do backend
  styles/          tokens visuais
```

## Rotas

| Área       | Caminho                                                     |
| ---------- | ----------------------------------------------------------- |
| Home       | `/`                                                         |
| Cidade     | `/city`                                                     |
| Resultados | `/units`                                                    |
| Detalhe    | `/units/[id]`                                               |
| Auth       | `/login` `/register` `/verify-email` `/recover-password`    |
| Paciente   | `/profile` `/favorites` `/reviews`                          |
| Gestor     | `/manager/units` `/manager/units/new` `/manager/units/[id]` |
| Admin      | `/admin`                                                    |

## Como rodar

```bash
yarn
copy .env.example .env.local
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000).

Outros comandos:

```bash
yarn build
yarn lint
yarn format
```

## Commits

Mensagens no padrão `tipo(#issue): descrição curta em português`.

O número entre parênteses é a issue. A descrição fica em minúsculas, sem ponto final.

| Tipo       | Quando usar                       |
| ---------- | --------------------------------- |
| `feat`     | funcionalidade nova               |
| `fix`      | correção de bug                   |
| `chore`    | tarefa de manutenção              |
| `refactor` | mudança sem alterar comportamento |

Exemplos:

```text
feat(#1): adiciona busca de unidades
fix(#12): corrige paginação dos resultados
chore(#4): atualiza dependências do yarn
refactor(#8): extrai serviço de autenticação
```

Não usar `Closes #N` no corpo do commit, a menos que a issue peça isso.

## GitHub Actions

O workflow `.github/workflows/ci.yml` roda em push e pull request para `main`/`master`:

1. `yarn install --frozen-lockfile`
2. `yarn lint`
3. `yarn format:check`
4. `yarn build`

O `yarn.lock` precisa estar no repositório. Sem ele o CI falha.
