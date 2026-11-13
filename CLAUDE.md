# CLAUDE.md — Frontend iKnow

Instruções permanentes para o Claude Code. Lê este ficheiro **antes de qualquer tarefa**.

Documentos de referência (em `docs/`):
- `docs/guia-visual-frontend.md` — identidade visual, padrões de interface, regras
- `docs/contrato-api.md` — endpoints, autenticação, estados, paginação, decisões D01–D12
- `docs/wireframes.png` — os dois wireframes aprovados

Se houver conflito: **contrato da API > este ficheiro > guia visual**. Se algo não estiver definido em nenhum, **pergunta**. Não decidas em silêncio.

---

## 1. Regras inegociáveis

1. **Não inventes endpoints, campos nem valores de enum.** A fonte da verdade é o `openapi.json` do backend. Se um campo de que precisas não existir, pára e reporta.
2. **Não faças commits, pushes nem merges** sem autorização explícita. Trabalha na branch `develop` ou em `feat/<nome>`. Nunca na `main`.
3. **Tokens:** access token **só em memória** (store Zustand **não persistida**). Nunca em `localStorage`, `sessionStorage` ou cookies legíveis por JS. O refresh token vive em cookie HttpOnly gerido pelo backend.
4. **Nada de dados fictícios apresentados como reais.** Mocks ficam isolados em `src/mocks/` e só são activados por variável de ambiente.
5. **Nenhuma dependência nova sem justificação** escrita no pedido de aprovação.
6. **Separa o que está aprovado do que é proposta.** Tudo o que estiver marcado `[PROPOSTA]` neste ficheiro precisa de confirmação antes de ser implementado.
7. Toda a comunicação HTTP passa pelo cliente centralizado. Componentes e páginas **nunca** chamam `fetch` directamente.
8. A interface está em português. O código (nomes de variáveis, funções, ficheiros) está em inglês.

---

## 2. Stack

| Área | Tecnologia | Estado |
|---|---|---|
| Framework / build | React + TypeScript (strict) + Vite | Aprovado |
| Estilos | Tailwind CSS + shadcn/ui | Aprovado |
| Ícones | lucide-react | Aprovado |
| Formulários / validação | react-hook-form + zod + @hookform/resolvers | Aprovado |
| Estado global | zustand | Aprovado |
| Routing | react-router-dom | Necessário (não consta do guia, mas é indispensável) |
| Tipos da API | openapi-typescript (devDependency) | Necessário para gerar tipos a partir do OpenAPI |
| Cache de pedidos | @tanstack/react-query | **[PROPOSTA]**: justificar antes de instalar |

Variáveis de ambiente (`.env.example`):
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 3. Identidade visual (tokens)

Configura no Tailwind/shadcn (variáveis CSS em `src/styles/globals.css`):

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#F5C518` | Botões principais, item activo da sidebar, destaques |
| `primary-hover` | `#DDAF08` | Hover/active de elementos primários |
| `foreground` | `#171717` | Títulos e texto forte. **Também é o texto sobre o amarelo** (contraste) |
| `background` | `#F5F5F2` | Fundo da aplicação |
| `card` | `#FFFFFF` | Cartões, formulários, sidebar |
| `muted-foreground` | `#737373` | Texto secundário |
| `border` | `#E5E5E0` | Bordas subtis |
| `destructive` | `#DC2626` | Erros e acções destrutivas |
| `success` | `#16A34A` | Confirmações |

- Fonte **Inter** (pesos 400, 500, 600, 700), carregada localmente via `@fontsource/inter` ou Google Fonts.
- `--radius: 0.75rem` (cantos moderadamente arredondados).
- Sombras: só `shadow-sm` nos cartões e `shadow-md` no hover.
- O amarelo **destaca, não domina**: nunca como fundo de áreas grandes, excepto no banner.
- Foco visível em todos os elementos interactivos (`ring-2 ring-primary ring-offset-2`).
- Desktop primeiro (mínimo 1280px), mas usa flex/grid sem larguras fixas que impeçam a adaptação futura.

---

## 4. Leitura dos wireframes

### 4.1. Padrão A — Dashboard (wireframe 1)

```
┌────────────┬─────────────────────────────────────────────────┐
│ [□] iKnow  │            ┌──────────────────────┐             │
│            │            │       BANNER         │             │
│ ─ Menu     │            └──────────────────────┘             │
│ ─ Menu     │ ──────────────────────────────────────────────  │
│ ─ Menu     │ Título da secção (ex.: "Oportunidades")         │
│ ─ Menu     │ subtítulo / link "Ver todas"                    │
│ ─ Menu     │ ┌──────┐ ┌──────┐ ┌──────┐ ┌───               │
│            │ │ img  │ │ img  │ │ img  │ │ img → (continua) │
│            │ │(●)── │ │(●)── │ │(●)── │ │(●)                 │
│ (●) Nome   │ └──────┘ └──────┘ └──────┘ └───               │
│     conta  │ ─── ─── ──── ─── (elementos complementares)     │
└────────────┴─────────────────────────────────────────────────┘
```

Interpretação para implementar:
- **Sidebar** (largura inicial 256px, fixa, fundo branco, borda direita): logótipo no topo, navegação ao centro, bloco de perfil em baixo (avatar, nome, menu com "Conta" e "Terminar sessão").
- **Banner**: cartão largo, centrado, fundo amarelo ou com imagem, com texto de boas-vindas ou com um aviso contextual (ex.: estado da verificação da empresa).
- **Fila de cartões**: o 4.º cartão aparece cortado, o que indica **scroll horizontal** (carrossel) no painel. Nas páginas de listagem completa usa grelha com paginação.
- **Cartão**: imagem/capa em cima, círculo (logótipo da empresa ou avatar) com duas linhas de texto (título e informação secundária).
- **Linha inferior**: secção complementar (ex.: candidaturas recentes, ou paginação nas listagens).

### 4.2. Padrão B — Split Layout (wireframe 2)

```
┌──────────────────────────┬───────────────────────────────┐
│   ┌──────────────────┐   │                               │
│   │ Título           │   │           IMAGEM              │
│   │ [ campo        ] │   │                               │
│   │ [ campo        ] │   │                               │
│   │ [  Submeter    ] │   │  Título curto                 │
│   │ (□) (□) (□)      │   │  Texto explicativo            │
│   └──────────────────┘   │                               │
└──────────────────────────┴───────────────────────────────┘
```

- Duas colunas 50/50, **sem sidebar**, ecrã inteiro.
- Esquerda: `FormCard` centrado verticalmente (largura máxima de 420px).
- Direita: imagem de fundo com texto sobreposto no canto inferior esquerdo.
- **Os três botões pequenos do fundo do formulário:** o contrato **não tem login social**, por isso **não implementes OAuth**. Usa esse espaço para links secundários ("Criar conta", "Já tenho conta") ou para o indicador de passos do onboarding. **[PROPOSTA]**: confirmar.
- As imagens são placeholders neutros até haver ilustrações definitivas (questão por validar n.º 5).

---

## 5. Mapa de páginas

Derivado dos endpoints do contrato. Os nomes de rota são **[PROPOSTA]** até serem aprovados.

### 5.1. Públicas (Split Layout, sem sidebar)

| Rota | Página | Endpoints |
|---|---|---|
| `/entrar` | Login | `GET /auth/csrf`, `POST /auth/login` |
| `/registar` | Registo (escolha Candidato/Empresa + dados) | `POST /auth/register` |

### 5.2. Candidato (AppLayout com sidebar)

| Rota | Página | Padrão | Endpoints |
|---|---|---|---|
| `/painel` | Painel | Dashboard: banner + carrossel de recomendações + candidaturas recentes | `GET /matching/recommendations`, `GET /applications/me` |
| `/oportunidades` | Explorar oportunidades | Grelha + paginação | `GET /opportunities` |
| `/oportunidades/:id` | Detalhe da oportunidade + candidatar | Detalhe | `GET /opportunities/{id}`, `GET /companies/{id}`, `POST /opportunities/{id}/applications` |
| `/candidaturas` | As minhas candidaturas | Lista com estado | `GET /applications/me` |
| `/candidaturas/:id` | Detalhe da candidatura + desistir | Detalhe | `GET /applications/{id}`, `POST /applications/{id}/withdraw` |
| `/perfil` | O meu perfil (dados, competências, experiências, formação) | Detalhe com secções editáveis | `/candidates/me*`, `GET /skills` |
| `/notificacoes` | Notificações | Lista | `/notifications*` |
| `/conta` | Conta (dados, palavra-passe, eliminar) | Formulário | `/users/me*` |

### 5.3. Empresa (AppLayout com sidebar)

| Rota | Página | Padrão | Endpoints |
|---|---|---|---|
| `/empresa/onboarding` | Completar perfil (passos, guarda parcial) | Split Layout | `GET/PATCH /companies/me` |
| `/empresa/painel` | Painel: banner com estado da verificação + oportunidades | Dashboard | `GET /companies/me`, `GET /companies/me/opportunities` |
| `/empresa/oportunidades` | As minhas oportunidades (separadores DRAFT / ACTIVE / CLOSED) | Grelha | `GET /companies/me/opportunities` |
| `/empresa/oportunidades/nova` | Criar oportunidade | Formulário | `POST /opportunities`, `GET /skills` |
| `/empresa/oportunidades/:id` | Detalhe: publicar, fechar, eliminar rascunho, candidatos recomendados | Detalhe | `GET/PATCH/DELETE /opportunities/{id}`, `POST .../publish`, `POST .../close`, `GET /matching/opportunities/{id}/candidates`, `POST /matching/opportunities/{id}/refresh`, `GET /matching/jobs/{job_id}` |
| `/empresa/oportunidades/:id/editar` | Editar oportunidade | Formulário | `PATCH /opportunities/{id}` |
| `/empresa/candidaturas` | Candidaturas recebidas + mudar estado | Lista | `GET /companies/me/applications`, `PATCH /applications/{id}/status` |
| `/empresa/perfil` | Perfil da empresa | Detalhe/Formulário | `GET/PATCH /companies/me` |
| `/notificacoes`, `/conta` | Partilhadas com o candidato | — | — |

### 5.4. Lacunas do contrato: não implementar, reportar

- **Verificação empresarial:** o contrato descreve os estados (D08), mas **não lista endpoints** para submeter a verificação nem para o administrador decidir. Mostra só o estado, se vier em `GET /companies/me`. Não cries a página de submissão.
- **Área de administração:** não tem endpoints definidos. Não construir.
- **"Lista de talentos"** (referida no guia): não existe endpoint público de candidatos. O `TalentCard` usa-se apenas em `GET /matching/opportunities/{id}/candidates`.
- **Payload de `POST /auth/register`:** confirma no OpenAPI os campos e o nome do campo do tipo de utilizador.

---

## 6. Regras de negócio que o frontend tem de reflectir

- **Encaminhamento após login:** chama `GET /auth/me`. Se for uma empresa com o perfil incompleto, vai para `/empresa/onboarding` (D07). O campo que indica a conclusão do perfil **vem do OpenAPI**: não o inventes.
- **Publicar oportunidade:** o botão fica desactivado, com explicação, se o perfil estiver incompleto ou a verificação ≠ `VERIFIED`. O backend valida na mesma: trata o `403`/`409` com uma mensagem clara.
- **Eliminar oportunidade:** só aparece em `DRAFT`.
- **Matching:**
  - Mostra a pontuação (0–100) com a nota "não representa probabilidade de contratação".
  - Distingue **elegível** de **pontuação alta** (D09). Mostra um destaque vermelho para as competências obrigatórias em falta.
  - Mostra a cobertura dos critérios e quais foram excluídos (D10).
  - `INSUFFICIENT_DATA` aparece como "Dados insuficientes", **nunca** como uma pontuação.
  - Refresh: `POST .../refresh` devolve um `job_id`. Faz polling a `GET /matching/jobs/{job_id}` (a cada 2s, com backoff, máximo de ~60s) até `COMPLETED`/`FAILED`. A interface nunca bloqueia durante o processamento.
- **Candidatar sem competência obrigatória:** é permitido (D09, regra 5). Mostra um aviso antes de confirmar, mas não bloqueies.
- **Estados de candidatura:** badges distintos para `PENDING`, `REVIEWING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED` e `WITHDRAWN`. As transições permitidas são validadas pelo backend. Mostra o erro se forem recusadas.
- **Eliminar conta:** diálogo de confirmação que explica a desactivação imediata e os 30 dias de recuperação (D12). Depois limpa a sessão e redirecciona.

---

## 7. Arquitectura

```
src/
├── app/
│   ├── router/          # definição de rotas, guards (RequireAuth, RequireRole)
│   ├── providers/       # providers globais
│   └── layouts/         # AppLayout, AuthLayout (split)
├── modules/
│   ├── auth/            # pages/, components/, api.ts, schemas.ts, store.ts
│   ├── users/
│   ├── candidates/
│   ├── companies/
│   ├── opportunities/
│   ├── applications/
│   ├── matching/
│   └── notifications/
├── shared/
│   ├── components/      # Sidebar, PageHeader, EmptyState, LoadingState, ErrorState, Pagination...
│   ├── components/ui/   # componentes shadcn
│   ├── api/             # http-client.ts, errors.ts
│   ├── types/generated/ # gerado do OpenAPI. NÃO EDITAR À MÃO
│   ├── hooks/
│   └── utils/
├── config/              # env.ts (valida as variáveis com zod)
├── styles/
└── main.tsx
```

Cada módulo expõe `api.ts` (funções tipadas que usam o cliente HTTP), `schemas.ts` (zod para formulários) e `pages/`.

Script em `package.json`:
```
"gen:api": "openapi-typescript $VITE_API_BASE_URL/../../openapi.json -o src/shared/types/generated/api.ts"
```
(ajusta o URL ao caminho real do OpenAPI do backend)

---

## 8. Cliente HTTP e autenticação

`src/shared/api/http-client.ts` deve:
1. Prefixar `VITE_API_BASE_URL`, enviar e aceitar JSON, e usar `credentials: 'include'`.
2. Juntar `Authorization: Bearer <access_token>` a partir da store em memória.
3. Juntar `X-CSRF-Token` em `POST /auth/refresh`, `POST /auth/logout` e qualquer outro pedido autenticado por cookie. O token vem de `GET /auth/csrf`.
4. Num **401**, tentar **um** refresh. Pedidos concorrentes **partilham a mesma promessa** de refresh (single-flight). Se o refresh falhar, limpa a sessão e redirecciona para `/entrar?next=<rota>`. Nunca faças refresh do próprio pedido de refresh (evita ciclos).
5. Converter o formato de erro `{ error: { code, message, details, request_id } }` num `ApiError` tipado. O `422` mapeia `details` para os erros dos campos do formulário.
6. Tratar o `429` com uma mensagem "Demasiados pedidos, tenta novamente em instantes".

**Arranque da app:** como o access token está só em memória, perde-se ao recarregar. No arranque, tenta `POST /auth/refresh` (com CSRF) e depois `GET /auth/me`. Mostra um `LoadingState` de ecrã inteiro até resolver.

**Logout:** `POST /auth/logout`, limpar a store e redireccionar para `/entrar`.

---

## 9. Componentes partilhados

`AppLayout`, `AuthLayout` (split), `Sidebar`, `PageHeader`, `Banner`, `CardCarousel`, `CardGrid`, `OpportunityCard`, `TalentCard`, `FormCard`, `DetailSection`, `StatusBadge`, `MatchScore`, `Pagination`, `EmptyState`, `LoadingState` (skeletons), `ErrorState` (com "Tentar novamente" e `request_id` visível).

Cada componente interactivo cobre os estados: normal, hover, focus, disabled, loading, success, error, empty.

Os formulários mostram os erros **junto ao campo**. Os botões de submissão mostram o carregamento e ficam desactivados enquanto submetem. As acções mostram um toast de sucesso ou erro.

Não crias abstracções genéricas antes de haver pelo menos duas utilizações reais.

---

## 10. Fluxo de trabalho por tarefa

1. Lê este ficheiro e os documentos relevantes.
2. Confirma no OpenAPI os endpoints e os campos que vais usar.
3. Para decisões novas, apresenta um plano curto e **espera aprovação**.
4. Implementa.
5. Corre `npm run lint`, `npm run typecheck` e `npm run build`. Tudo tem de passar.
6. Entrega um resumo: ficheiros alterados, o que ficou por fazer, dúvidas e uma sugestão de mensagem de commit. **Não faças o commit.**

---

## 11. Critério de "concluído" para cada página

- Usa os tokens e o padrão de layout definidos acima.
- Tem os estados de carregamento, vazio e erro.
- Os tipos vêm de `shared/types/generated`.
- Os guards de rota correctos estão aplicados (autenticado e papel).
- Sem endpoints, campos ou funcionalidades inventados.
- `lint`, `typecheck` e `build` passam.
