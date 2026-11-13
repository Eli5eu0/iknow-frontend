# iKnow
# FRONTEND DEVELOPMENT GUIDELINES & IMPLEMENTATION BRIEF

**Versão:** 1.0  
**Projeto:** iKnow  
**Documento de referência:** Software Architecture Document (SAD) v1.0  
**Estado:** Diretrizes aprovadas para implementação do MVP

---

# 1. APRESENTAÇÃO DO PROJETO

## 1.1. O que é o iKnow?

O iKnow é uma plataforma digital que aproxima candidatos e empresas através de um sistema automatizado de correspondência entre competências profissionais e oportunidades.

A plataforma permite que candidatos construam os seus perfis profissionais, descubram oportunidades compatíveis com as suas competências e acompanhem as suas candidaturas.

Por outro lado, permite que empresas criem os seus perfis, publiquem oportunidades, definam requisitos e encontrem candidatos com maior compatibilidade.

O principal elemento diferenciador da plataforma é o seu mecanismo de Weighted Matching, que calcula automaticamente o grau de compatibilidade entre candidatos e oportunidades.

## 1.2. Objetivo do frontend

O objetivo é desenvolver uma aplicação web moderna, intuitiva, responsiva e funcional, capaz de representar todas as funcionalidades previstas na arquitetura do iKnow.

O frontend deverá:

- Proporcionar uma experiência de utilização simples.
- Apresentar interfaces diferentes para candidatos e empresas.
- Facilitar a criação e gestão de perfis.
- Permitir a publicação e consulta de oportunidades.
- Apresentar recomendações geradas pelo algoritmo de correspondência.
- Facilitar a gestão de candidaturas.
- Comunicar exclusivamente com o backend através da API REST.
- Garantir segurança, consistência visual e acessibilidade.

## 1.3. Público-alvo

A plataforma terá três papéis:

| Utilizador | Finalidade |
|---|---|
| Candidate | Procurar oportunidades e desenvolver a carreira profissional. |
| Company | Encontrar talentos e gerir oportunidades. |
| Admin | Administrar e supervisionar a plataforma. |

O desenvolvimento deverá priorizar as experiências de candidatos e empresas.

O painel administrativo poderá ter uma interface inicial simples, ficando as funcionalidades administrativas avançadas para uma versão posterior.

---

# 2. TECNOLOGIAS OBRIGATÓRIAS

O frontend deverá respeitar a stack definida na arquitetura técnica do projeto.

| Tecnologia | Utilização |
|---|---|
| React | Biblioteca principal da interface. |
| TypeScript | Tipagem estática e segurança do código. |
| Vite | Ambiente de desenvolvimento e build. |
| Tailwind CSS | Estilização e sistema de design. |
| React Router | Navegação e gestão de rotas. |
| TanStack Query | Gestão de dados provenientes da API. |
| React Hook Form | Gestão de formulários. |
| Zod | Validação de formulários e estruturas de dados. |
| Lucide React | Biblioteca de ícones. |
| Vitest | Testes unitários. |
| React Testing Library | Testes de componentes. |

### 2.1. Regras tecnológicas

1. Utilizar TypeScript em todos os componentes e serviços.
2. Evitar a utilização de `any`, salvo situações justificadas.
3. Não misturar regras de negócio com componentes visuais.
4. Não duplicar chamadas à API em diferentes componentes.
5. Centralizar configurações e serviços.
6. Utilizar componentes reutilizáveis.
7. Não instalar bibliotecas adicionais sem necessidade justificada.
8. Manter as dependências atualizadas e compatíveis entre si.

---

# 3. IDENTIDADE VISUAL E DIREÇÃO DE DESIGN

## 3.1. Conceito visual

O iKnow deverá transmitir:

- Profissionalismo.
- Confiança.
- Modernidade.
- Tecnologia.
- Oportunidade.
- Conexão entre talentos e empresas.

A interface deverá apresentar uma aparência profissional e contemporânea, evitando tanto o excesso de elementos decorativos como interfaces excessivamente simples.

O produto deverá parecer uma plataforma profissional real, e não apenas um protótipo académico.

## 3.2. Direção estética

Adotar uma linguagem visual baseada em:

- Minimalismo funcional.
- Hierarquia visual clara.
- Espaçamento consistente.
- Tipografia moderna.
- Cartões com estrutura organizada.
- Bordas discretas.
- Ícones simples e consistentes.
- Microinterações subtis.
- Feedback visual para todas as ações relevantes.

A inspiração estética poderá seguir padrões de qualidade encontrados em plataformas profissionais de SaaS, sem copiar diretamente a identidade ou os layouts de outros produtos.

## 3.4. Tipografia

Recomenda-se utilizar uma família tipográfica moderna, como Inter.

Hierarquia sugerida:

- Títulos principais: 28–36 px.
- Títulos de secção: 20–24 px.
- Subtítulos: 16–18 px.
- Texto normal: 14–16 px.
- Texto auxiliar: 12–13 px.

A legibilidade deverá ter prioridade sobre elementos decorativos.

## 3.5. Sistema de espaçamento

Adotar uma escala consistente de espaçamento baseada em múltiplos de 4 px.

Exemplo:

- 4 px: espaçamento mínimo.
- 8 px: elementos próximos.
- 12 px: espaçamento interno pequeno.
- 16 px: espaçamento padrão.
- 24 px: separação entre componentes.
- 32 px: separação entre secções.
- 48 px: separação entre áreas principais.

## 3.6. Componentes visuais

Os seguintes elementos deverão possuir estilos consistentes:

- Botões.
- Inputs.
- Selects.
- Textareas.
- Modais.
- Dropdowns.
- Cards.
- Badges.
- Tabelas.
- Paginação.
- Menus.
- Tooltips.
- Alertas.
- Notificações.
- Indicadores de carregamento.

---

# 4. ARQUITETURA DO FRONTEND

## 4.1. Organização arquitetural

O frontend deverá ser desenvolvido de forma modular, com separação entre:

1. Apresentação.
2. Navegação.
3. Gestão de estado.
4. Comunicação com a API.
5. Validação.
6. Tipagem.
7. Autenticação e permissões.

Os componentes deverão ser independentes sempre que possível.

## 4.2. Estrutura de diretórios

A estrutura proposta é:

```text
frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── cards/
│   │   ├── tables/
│   │   ├── feedback/
│   │   └── layout/
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── CandidateLayout.tsx
│   │   ├── CompanyLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── candidate/
│   │   ├── company/
│   │   └── admin/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── candidates/
│   │   ├── companies/
│   │   ├── opportunities/
│   │   ├── matching/
│   │   ├── applications/
│   │   └── notifications/
│   │
│   ├── hooks/
│   │
│   ├── services/
│   │   ├── api/
│   │   └── queries/
│   │
│   ├── contexts/
│   │
│   ├── schemas/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │
│   ├── config/
│   │
│   ├── styles/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

A estrutura poderá ser ajustada durante a implementação, desde que sejam preservadas a modularidade e a separação de responsabilidades.

## 4.3. Regras de organização

**components/ui:** componentes básicos reutilizáveis.

**components/layout:** navegação, cabeçalhos, barras laterais e estruturas visuais.

**features:** funcionalidades específicas de cada domínio.

**services/api:** comunicação com o backend.

**types:** interfaces e tipos TypeScript.

**schemas:** esquemas de validação Zod.

**hooks:** hooks personalizados.

**routes:** definição e proteção das rotas.

**utils:** funções auxiliares reutilizáveis.

Não criar componentes gigantes que concentrem múltiplas funcionalidades.

---

# 5. ESTRUTURA DE NAVEGAÇÃO

O iKnow deverá possuir experiências distintas para os diferentes tipos de utilizadores.

## 5.1. Navegação pública

Rotas:

- `/`
- `/about`
- `/opportunities`
- `/opportunities/:id`
- `/login`
- `/register`
- `/forgot-password`

A navegação pública deverá permitir conhecer a plataforma, consultar oportunidades públicas e iniciar o processo de autenticação.

## 5.2. Navegação dos candidatos

Prefixo: `/candidate`

Menu principal:

1. Dashboard.
2. Explorar oportunidades.
3. Recomendações.
4. Minhas candidaturas.
5. Meu perfil.
6. Notificações.
7. Definições.

Rotas:

```text
/candidate/dashboard
/candidate/opportunities
/candidate/opportunities/:id
/candidate/recommendations
/candidate/applications
/candidate/applications/:id
/candidate/profile
/candidate/notifications
/candidate/settings
```

## 5.3. Navegação das empresas

Prefixo: `/company`

Menu principal:

1. Dashboard.
2. Minhas oportunidades.
3. Publicar oportunidade.
4. Candidatos compatíveis.
5. Candidaturas recebidas.
6. Perfil empresarial.
7. Notificações.
8. Definições.

Rotas:

```text
/company/dashboard
/company/opportunities
/company/opportunities/create
/company/opportunities/:id
/company/opportunities/:id/edit
/company/matches
/company/applications
/company/applications/:id
/company/profile
/company/notifications
/company/settings
```

## 5.4. Navegação administrativa

Prefixo: `/admin`

Rotas iniciais:

```text
/admin/dashboard
/admin/users
/admin/companies
/admin/opportunities
/admin/settings
```

O painel administrativo deverá ser implementado apenas na extensão necessária ao MVP.

---

# 6. ESPECIFICAÇÃO DAS INTERFACES DOS CANDIDATOS

## 6.1. Dashboard do candidato

A dashboard deverá ser a primeira página apresentada após a autenticação de um candidato.

Deverá incluir:

**Cabeçalho de boas-vindas**

- Nome do utilizador.
- Mensagem de boas-vindas.
- Indicador de completude do perfil.
- Acesso rápido às notificações.

**Indicadores principais**

- Total de oportunidades compatíveis.
- Total de candidaturas.
- Candidaturas em análise.
- Candidaturas aprovadas.

**Recomendações recentes**

Apresentar oportunidades recomendadas pelo algoritmo de Weighted Matching.

Cada cartão deverá mostrar:

- Título da oportunidade.
- Nome da empresa.
- Localização.
- Tipo de oportunidade.
- Percentagem de compatibilidade.
- Botão para consultar detalhes.

**Atividades recentes**

Apresentar atualizações relevantes sobre candidaturas e oportunidades.

## 6.2. Explorar oportunidades

Página dedicada à pesquisa de oportunidades.

Funcionalidades:

- Pesquisa por título.
- Filtro por localização.
- Filtro por tipo de oportunidade.
- Filtro por nível de experiência.
- Filtro por competências.
- Ordenação por data.
- Ordenação por compatibilidade, quando existir.

Os filtros deverão funcionar em conjunto.

Cada oportunidade deverá ser apresentada através de um cartão reutilizável.

## 6.3. Detalhes da oportunidade

A página deverá apresentar:

- Título.
- Empresa responsável.
- Descrição.
- Localização.
- Tipo de oportunidade.
- Nível de experiência.
- Competências obrigatórias.
- Competências desejáveis.
- Formação pretendida.
- Data de publicação.
- Estado da oportunidade.

Quando existir um match calculado para o candidato autenticado, apresentar a pontuação de compatibilidade e a respetiva decomposição.

Deverá existir uma ação para apresentar candidatura, desde que a oportunidade esteja ativa e o candidato ainda não tenha uma candidatura registada.

## 6.4. Recomendações

Esta página será uma das funcionalidades centrais do produto.

Apresentar oportunidades ordenadas pela pontuação de compatibilidade.

Cada cartão deverá apresentar:

- Percentagem de compatibilidade.
- Nome da oportunidade.
- Empresa.
- Competências correspondentes.
- Competências em falta, quando conhecidas.
- Pontuação por critério.
- Acesso aos detalhes.

A pontuação deverá ser explicável.

Não apresentar percentagens como probabilidades de contratação.

Não inventar resultados de correspondência no frontend.

## 6.5. Meu perfil

O perfil deverá ser dividido em secções:

**Informações gerais**
- Nome.
- Localização.
- Resumo profissional.
- Disponibilidade.

**Competências**
- Adicionar competência.
- Remover competência.
- Definir nível de proficiência.
- Registar anos de experiência.

**Experiência profissional**
- Cargo.
- Empresa.
- Descrição.
- Data de início.
- Data de término.

**Formação académica**
- Instituição.
- Qualificação.
- Área de formação.
- Data de início.
- Data de conclusão.

A interface deverá permitir editar cada secção sem obrigar o utilizador a preencher novamente todo o perfil.

## 6.6. Minhas candidaturas

Apresentar as candidaturas do utilizador em lista ou cartões.

Estados possíveis:

- PENDING.
- REVIEWING.
- SHORTLISTED.
- ACCEPTED.
- REJECTED.
- WITHDRAWN.

Cada candidatura deverá apresentar:

- Nome da oportunidade.
- Empresa.
- Data de candidatura.
- Estado atual.
- Acesso aos detalhes.

Os estados deverão ser representados por badges com cores consistentes.

---

# 7. ESPECIFICAÇÃO DAS INTERFACES DAS EMPRESAS

## 7.1. Dashboard empresarial

A dashboard deverá apresentar:

**Indicadores principais**

- Total de oportunidades publicadas.
- Oportunidades ativas.
- Total de candidaturas recebidas.
- Candidaturas pendentes de análise.

**Resumo de atividade**

- Últimas candidaturas.
- Oportunidades recentemente atualizadas.
- Candidatos com maior compatibilidade.

**Ações rápidas**

- Publicar oportunidade.
- Consultar candidaturas.
- Consultar candidatos compatíveis.
- Editar perfil empresarial.

## 7.2. Perfil empresarial

Deverá permitir:

- Consultar e editar o nome da empresa.
- Atualizar a descrição.
- Definir setor de atividade.
- Atualizar localização.
- Adicionar website.
- Gerir informações de contacto.

## 7.3. Gestão de oportunidades

A empresa deverá conseguir:

- Criar oportunidades.
- Consultar oportunidades existentes.
- Editar oportunidades.
- Encerrar oportunidades.
- Consultar candidaturas relacionadas.

Cada oportunidade deverá possuir estados claros:

- DRAFT.
- ACTIVE.
- CLOSED.

Apenas oportunidades ativas deverão participar nas novas correspondências.

## 7.4. Publicação de oportunidades

O formulário deverá estar dividido em secções.

**Secção A — Informações gerais**
- Título.
- Descrição.
- Tipo de oportunidade.
- Localização.

**Secção B — Requisitos profissionais**
- Nível de experiência.
- Experiência mínima.
- Formação pretendida.

**Secção C — Competências**
- Seleção de competências.
- Nível exigido.
- Classificação como obrigatória ou desejável.

**Secção D — Disponibilidade**
- Regime de trabalho.
- Disponibilidade necessária.

O formulário deverá validar os dados antes do envio.

## 7.5. Candidatos compatíveis

Esta interface deverá apresentar candidatos ordenados por compatibilidade com uma oportunidade selecionada.

Cada cartão deverá apresentar:

- Nome do candidato, respeitando as permissões de privacidade.
- Resumo profissional.
- Competências.
- Experiência relevante.
- Pontuação de compatibilidade.
- Detalhes da correspondência.

A empresa deverá conseguir filtrar os resultados por pontuação e competências.

## 7.6. Gestão de candidaturas

A empresa deverá conseguir:

- Consultar candidaturas.
- Consultar informações profissionais autorizadas.
- Visualizar a pontuação de compatibilidade, quando disponível.
- Alterar o estado da candidatura.
- Consultar o histórico relevante do processo.

Não permitir alterações arbitrárias a candidaturas pertencentes a outras empresas.

---

# 8. SISTEMA DE MATCHING NO FRONTEND

O algoritmo pertence ao backend.

O frontend é responsável apenas por apresentar os resultados devolvidos pela API.

## 8.1. Apresentação da pontuação

Utilizar indicadores visuais claros:

- Percentagem de compatibilidade.
- Barra de progresso.
- Decomposição dos critérios.
- Competências correspondentes.
- Requisitos ainda não satisfeitos ou não informados.

## 8.2. Exemplo de apresentação

Uma oportunidade poderá apresentar:

**Compatibilidade: 85,5%**

- Competências: 90%.
- Experiência: 80%.
- Formação: 85%.
- Disponibilidade: 100%.
- Localização: 60%.

O frontend não deverá recalcular estes valores nem aplicar os pesos do algoritmo localmente.

## 8.3. Atualização automática

Quando um perfil ou oportunidade for alterado:

1. O frontend envia a atualização ao backend.
2. O backend regista a tarefa de correspondência.
3. O worker processa a tarefa.
4. O backend atualiza os resultados.
5. O frontend consulta novamente os dados.

Utilizar TanStack Query para atualizar os dados e invalidar as consultas relevantes.

Se o processamento ainda não tiver terminado, apresentar um estado informativo, como:

"Estamos a atualizar as suas correspondências."

Não apresentar resultados antigos como se fossem atuais.

---

# 9. AUTENTICAÇÃO E CONTROLO DE ACESSO

## 9.1. Registo

O formulário de registo deverá permitir selecionar o tipo de conta:

- Candidato.
- Empresa.

O papel ADMIN não poderá ser selecionado no registo público.

Os formulários deverão adaptar-se ao tipo de conta escolhido.

## 9.2. Login

O login deverá solicitar:

- Email.
- Palavra-passe.

Após autenticação, o utilizador deverá ser encaminhado para a área correspondente ao seu papel.

## 9.3. Gestão dos tokens

O frontend deverá respeitar a estratégia de autenticação definida com o backend.

Estratégia recomendada:

- Access Token mantido em memória.
- Refresh Token armazenado pelo backend num cookie HttpOnly, Secure e SameSite.
- Renovação de sessão através do endpoint de refresh.
- Reautenticação quando a sessão deixar de ser válida.

O frontend não deverá guardar tokens de autenticação em localStorage ou sessionStorage.

As chamadas que utilizem cookies deverão incluir `credentials: "include"` ou a configuração equivalente no cliente HTTP.

O backend deverá implementar proteção adequada contra CSRF e validação de origem nas operações sensíveis.

## 9.4. Proteção de rotas

Criar componentes de proteção:

- `ProtectedRoute`.
- `RoleGuard`.
- `PublicRoute`.

Regras:

- Utilizadores não autenticados não podem aceder às dashboards.
- Candidatos não podem aceder às áreas empresariais.
- Empresas não podem aceder às áreas dos candidatos.
- Administradores possuem uma área própria.

A proteção do frontend melhora a experiência, mas a autorização definitiva deverá ser sempre aplicada pelo backend.

---

# 10. INTEGRAÇÃO COM O BACKEND

## 10.1. Regra fundamental

O frontend deverá comunicar exclusivamente com o backend através dos endpoints REST definidos no SAD.

Não criar dados diretamente no PostgreSQL.

Não simular operações como se tivessem sido concluídas pelo servidor.

## 10.2. Configuração da API

Criar uma variável de ambiente:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

A URL deverá ser centralizada na configuração do cliente HTTP.

## 10.3. Organização dos serviços

Criar serviços separados:

```text
services/api/
├── client.ts
├── auth.service.ts
├── users.service.ts
├── candidates.service.ts
├── companies.service.ts
├── opportunities.service.ts
├── skills.service.ts
├── matching.service.ts
├── applications.service.ts
└── notifications.service.ts
```

Cada serviço deverá conter apenas as operações relacionadas com o seu domínio.

## 10.4. Tratamento das respostas

O frontend deverá tratar:

- 200 — Operação concluída.
- 201 — Recurso criado.
- 204 — Operação concluída sem conteúdo.
- 400 — Pedido inválido.
- 401 — Não autenticado.
- 403 — Sem autorização.
- 404 — Recurso não encontrado.
- 409 — Conflito.
- 422 — Erros de validação.
- 429 — Limite de pedidos excedido.
- 500 — Erro interno.

Criar tratamento centralizado de erros.

## 10.5. Contratos da API

O frontend deverá respeitar os contratos efetivamente implementados pelo backend.

Caso algum endpoint necessário ainda não exista, documentar a dependência e solicitar a sua implementação.

Não inventar respostas, propriedades ou estruturas JSON.

Utilizar dados simulados apenas em ambientes de desenvolvimento, devidamente identificados e separados dos serviços reais.

Recomenda-se utilizar OpenAPI/Swagger como referência para gerar ou manter os tipos de comunicação.

---

# 11. ESTADOS DA INTERFACE

Todas as páginas que dependam de dados da API deverão implementar quatro estados principais.

## 11.1. Loading

Apresentar indicadores de carregamento enquanto os dados são obtidos.

Evitar páginas completamente vazias durante as operações.

## 11.2. Success

Apresentar os dados obtidos e permitir a utilização normal da interface.

## 11.3. Empty State

Quando não existirem dados, apresentar mensagens adequadas.

Exemplos:

- Ainda não existem oportunidades disponíveis.
- Não foram encontradas correspondências.
- Ainda não existem candidaturas.
- Complete o seu perfil para melhorar as recomendações.

## 11.4. Error

Quando ocorrer uma falha:

- Informar o utilizador.
- Explicar o problema de forma compreensível.
- Permitir tentar novamente quando apropriado.
- Não expor mensagens internas, stack traces ou informações sensíveis.

---

# 12. RESPONSIVIDADE

O iKnow deverá funcionar em:

- Computadores.
- Portáteis.
- Tablets.
- Smartphones.

## 12.1. Desktop

Utilizar uma estrutura com sidebar, cabeçalho e área principal de conteúdo.

## 12.2. Tablet

Adaptar a sidebar para um menu recolhível e reorganizar cartões e tabelas.

## 12.3. Mobile

Utilizar navegação simplificada, cartões em coluna e formulários adequados a ecrãs pequenos.

As tabelas deverão possuir alternativas responsivas, como cartões ou rolagem horizontal controlada.

Não ocultar funcionalidades essenciais apenas porque o utilizador está num dispositivo móvel.

Breakpoints sugeridos:

- Mobile: abaixo de 640 px.
- Tablet: 640–1023 px.
- Desktop: 1024 px ou superior.

---

# 13. ACESSIBILIDADE E USABILIDADE

Aplicar boas práticas de acessibilidade:

- Utilizar HTML semântico.
- Associar labels aos campos.
- Permitir navegação por teclado.
- Garantir contraste adequado.
- Não depender exclusivamente das cores para comunicar estados.
- Utilizar textos alternativos em imagens.
- Apresentar mensagens de erro próximas dos campos.
- Garantir foco visual nos elementos interativos.

A interface deverá ser compreensível mesmo para utilizadores com pouca experiência em plataformas digitais.

---

# 14. DESEMPENHO E QUALIDADE

O frontend deverá:

- Evitar renderizações desnecessárias.
- Implementar paginação em listas extensas.
- Utilizar carregamento diferido quando apropriado.
- Otimizar imagens.
- Evitar dependências desnecessárias.
- Utilizar cache através do TanStack Query.
- Evitar pedidos repetidos à API.
- Implementar estados de carregamento.
- Manter componentes pequenos e reutilizáveis.

Não utilizar animações pesadas que prejudiquem a experiência.

---

# 15. TESTES OBRIGATÓRIOS

## 15.1. Testes de componentes

Verificar:

- Renderização correta.
- Interações.
- Formulários.
- Estados visuais.
- Mensagens de validação.

## 15.2. Testes de integração

Verificar:

- Login.
- Registo.
- Navegação protegida.
- Comunicação com a API.
- Criação de oportunidades.
- Atualização de perfis.
- Consulta de correspondências.
- Gestão de candidaturas.

## 15.3. Testes de fluxos completos

**Fluxo do candidato:**

1. Criar conta.
2. Iniciar sessão.
3. Completar perfil.
4. Adicionar competências.
5. Consultar recomendações.
6. Consultar oportunidade.
7. Apresentar candidatura.
8. Acompanhar o estado.

**Fluxo da empresa:**

1. Criar conta empresarial.
2. Iniciar sessão.
3. Completar perfil.
4. Publicar oportunidade.
5. Consultar candidatos compatíveis.
6. Consultar candidaturas.
7. Atualizar o estado de uma candidatura.

Ambos os fluxos deverão ser testados de ponta a ponta.

---

# 16. FUNCIONALIDADES FORA DO ÂMBITO DO FRONTEND MVP

Não implementar nesta fase sem aprovação:

- Chat em tempo real.
- Videochamadas.
- Inteligência artificial para análise de currículos.
- Machine Learning.
- Pagamentos.
- Assinaturas premium.
- Aplicação móvel nativa.
- Integrações externas de recrutamento.
- Sistema avançado de entrevistas.
- Recomendações calculadas localmente.

O frontend deverá concentrar-se nas funcionalidades estabelecidas na arquitetura do MVP.

---

# 17. ENTREGÁVEIS ESPERADOS DO PROGRAMADOR

O colega responsável pelo frontend deverá entregar:

### Entregável 1 — Fundação

- Projeto React + TypeScript + Vite.
- Tailwind CSS configurado.
- React Router configurado.
- Estrutura modular de pastas.
- Configuração de ambiente.

### Entregável 2 — Design System

- Paleta de cores.
- Tipografia.
- Sistema de espaçamento.
- Botões.
- Inputs.
- Cards.
- Badges.
- Modais.
- Componentes reutilizáveis.

### Entregável 3 — Autenticação

- Registo de candidatos.
- Registo de empresas.
- Login.
- Logout.
- Renovação de sessão.
- Proteção de rotas.

### Entregável 4 — Interface do candidato

- Dashboard.
- Perfil.
- Exploração de oportunidades.
- Recomendações.
- Detalhes de oportunidades.
- Candidaturas.
- Notificações.

### Entregável 5 — Interface empresarial

- Dashboard.
- Perfil empresarial.
- Gestão de oportunidades.
- Publicação de oportunidades.
- Candidatos compatíveis.
- Gestão de candidaturas.
- Notificações.

### Entregável 6 — Integração

- Cliente HTTP.
- Serviços.
- Tipos TypeScript.
- Gestão de estados.
- Tratamento de erros.
- Integração real com a API.

### Entregável 7 — Validação

- Testes de componentes.
- Testes de integração.
- Testes responsivos.
- Correção de erros.
- Documentação de execução.

---

# 18. CRITÉRIOS DE ACEITAÇÃO

O frontend será considerado concluído para o MVP quando:

1. O projeto iniciar sem erros.
2. A navegação funcionar corretamente.
3. Os dois tipos de utilizadores possuírem interfaces próprias.
4. A autenticação estiver integrada com o backend.
5. As rotas estiverem protegidas.
6. Os perfis puderem ser criados e atualizados.
7. As oportunidades puderem ser consultadas e geridas.
8. As recomendações forem apresentadas com os dados reais do backend.
9. As candidaturas puderem ser submetidas e acompanhadas.
10. As empresas puderem gerir as suas oportunidades e candidaturas.
11. A interface funcionar em diferentes resoluções.
12. Os estados de carregamento, erro e ausência de dados estiverem implementados.
13. Os testes essenciais forem aprovados.
14. Não existirem operações fictícias apresentadas como operações reais.

---

# 19. REGRAS DE TRABALHO E COLABORAÇÃO

Estas regras deverão ser respeitadas durante todo o desenvolvimento.

**Regra 1 — Respeitar a arquitetura**

Não alterar a stack tecnológica ou a arquitetura sem aprovação.

**Regra 2 — Não inventar funcionalidades**

Toda funcionalidade deverá estar prevista na documentação ou ser aprovada antes da implementação.

**Regra 3 — Não misturar responsabilidades**

Os cálculos de correspondência, regras de negócio e validações definitivas pertencem ao backend.

**Regra 4 — Reutilizar componentes**

Não desenvolver várias versões de um mesmo componente sem justificação.

**Regra 5 — Preservar consistência visual**

Todas as páginas deverão seguir o mesmo design system.

**Regra 6 — Trabalhar por etapas**

Cada módulo deverá ser desenvolvido, testado e validado antes da integração seguinte.

**Regra 7 — Documentar alterações**

Alterações importantes deverão ser registadas, especialmente quando afetarem contratos da API ou decisões arquiteturais.

**Regra 8 — Não comprometer a segurança**

Não expor tokens, credenciais, dados sensíveis ou informações internas.

**Regra 9 — Utilizar controlo de versões**

Todas as alterações deverão ser registadas no Git, com commits descritivos.

**Regra 10 — Não considerar protótipos como funcionalidades concluídas**

Uma página visualmente pronta não significa que esteja funcional. A integração com o backend deverá ser demonstrada.

---

# 20. ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

O desenvolvimento deverá seguir esta sequência:

| Fase | Trabalho | Resultado |
|---|---|---|
| 01 | Configuração do projeto | Frontend funcional |
| 02 | Design System | Base visual consistente |
| 03 | Layouts e navegação | Estrutura de navegação |
| 04 | Autenticação | Acesso seguro |
| 05 | Dashboard do candidato | Área do candidato |
| 06 | Dashboard da empresa | Área empresarial |
| 07 | Perfis e competências | Gestão de perfis |
| 08 | Oportunidades | Publicação e consulta |
| 09 | Matching | Recomendações automáticas |
| 10 | Candidaturas | Gestão dos processos |
| 11 | Notificações | Comunicação interna |
| 12 | Integração e testes | Frontend validado |

A implementação deverá ser incremental. Não é necessário aguardar que todas as páginas estejam concluídas para começar a validar a integração com o backend.

---

# 21. INSTRUÇÃO FINAL AO PROGRAMADOR

Desenvolve o frontend do iKnow respeitando integralmente as diretrizes deste documento e o Software Architecture Document (SAD) v1.0.

O objetivo não é criar apenas uma interface visual, mas sim construir uma aplicação funcional, modular, segura, responsiva e preparada para integração com o backend Python/FastAPI.

Prioriza a experiência dos candidatos e das empresas, assegurando que cada tipo de utilizador tenha acesso às funcionalidades adequadas ao seu papel.

Mantém uma arquitetura de componentes organizada, evita duplicação de código e garante que a interface consome exclusivamente os dados disponibilizados pela API.

Sempre que encontrares uma lacuna na documentação, não inventes uma solução definitiva. Regista a questão, apresenta uma proposta técnica e solicita validação antes de alterar as decisões arquiteturais.

**O resultado esperado é um frontend profissional, consistente e totalmente alinhado com a visão técnica e funcional do iKnow.**

---

**DOCUMENTO:** Frontend Development Guidelines & Implementation Brief  
**VERSÃO:** 1.0  
**PROJETO:** iKnow  
**REFERÊNCIA ARQUITETURAL:** SAD v1.0  
**ESTADO:** Pronto para entrega ao programador responsável pelo frontend.