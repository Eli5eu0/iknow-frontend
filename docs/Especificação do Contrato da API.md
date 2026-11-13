# iKnow — Especificação do Contrato da API

**Versão:** 1.0 — Decisões consolidadas  
**Estado:** Decisões funcionais e técnicas aprovadas  
**Arquitetura:** Frontend e backend independentes, com backend modular monolítico.

---

## 1. Padrões gerais

- API REST sob o prefixo `/api/v1/`.
- Comunicação em JSON.
- Nomenclatura `snake_case`.
- Identificadores UUID.
- Datas em ISO 8601.
- Documentação OpenAPI gerada pelo FastAPI e pelos esquemas Pydantic.
- Respostas e erros com estrutura consistente.

### 1.1. Formato de erro

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": null,
    "request_id": "uuid"
  }
}
```

Códigos HTTP previstos: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429` e `500`.

## 2. Autenticação e segurança

### 2.1. Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/csrf`

### 2.2. Decisões aprovadas

- Access token com validade de 15 minutos.
- Refresh token com validade de 7 dias.
- Rotação do refresh token em cada renovação.
- Refresh token armazenado exclusivamente em cookie HttpOnly.
- Access token mantido em memória no frontend.
- Nunca armazenar tokens em `localStorage` ou `sessionStorage`.
- Token CSRF associado à sessão, obtido através de `GET /auth/csrf` e enviado no cabeçalho `X-CSRF-Token`.
- Validação de `Origin` e `Referer`.
- Cookies com configurações adequadas de `Secure`, `HttpOnly` e `SameSite`.
- CORS com origens explicitamente autorizadas. Nunca utilizar `*` com credenciais.
- Operações autenticadas por cookies, especialmente refresh e logout, devem aplicar proteção CSRF.
- Reutilização de refresh token invalidado será tratada como possível comprometimento da sessão, com revogação da respetiva família de tokens.

O backend será responsável por validar a autenticidade dos tokens, as permissões e a validade da sessão.

## 3. Utilizadores e perfis

### 3.1. USERS

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`
- `DELETE /users/me`

### 3.2. CANDIDATES

- `GET /candidates/me`
- `PATCH /candidates/me`
- `GET /candidates/me/skills`
- `PUT /candidates/me/skills`
- `GET /candidates/me/experiences`
- `POST /candidates/me/experiences`
- `PATCH /candidates/me/experiences/{id}`
- `DELETE /candidates/me/experiences/{id}`
- `GET /candidates/me/educations`
- `POST /candidates/me/educations`
- `PATCH /candidates/me/educations/{id}`
- `DELETE /candidates/me/educations/{id}`

### 3.3. COMPANIES

- `GET /companies/me`
- `PATCH /companies/me`
- `GET /companies/{id}`
- `GET /companies/me/opportunities`

### 3.4. Registo empresarial — D07

**Aprovado: criação do perfil empresarial em duas etapas.**

1. O utilizador cria uma conta com o tipo `COMPANY`.
2. O sistema cria a conta e permite a autenticação.
3. Após o primeiro login, o utilizador é encaminhado para o preenchimento do perfil empresarial.
4. O perfil pode ser guardado parcialmente e concluído posteriormente.
5. A publicação de oportunidades depende da conclusão do perfil e da verificação empresarial.

O backend controla o estado de conclusão do perfil e impede operações para as quais os requisitos ainda não estejam satisfeitos.

## 4. Verificação empresarial — D08

**Aprovado: modelo de verificação progressiva.**

Uma empresa pode criar a conta e preencher o perfil sem passar imediatamente por uma verificação completa.

Contudo, a publicação de oportunidades só será permitida depois da aprovação da verificação.

Estados previstos:

- `NOT_SUBMITTED`: verificação ainda não submetida.
- `PENDING`: aguarda análise.
- `VERIFIED`: empresa verificada.
- `REJECTED`: verificação recusada.
- `SUSPENDED`: verificação ou autorização suspensa.

O processo será manual no MVP, através de um administrador.

O backend deverá controlar:
- Submissão e consulta do estado da verificação.
- Registo da decisão administrativa.
- Justificação de rejeições.
- Bloqueio de publicação quando a empresa não estiver verificada.
- Registo das alterações de estado para auditoria.

A estrutura deverá permitir introduzir mecanismos adicionais de verificação futuramente.

## 5. Competências

- `GET /skills`
- `GET /skills/{id}`

As competências serão entidades centralizadas, permitindo padronizar os dados dos candidatos e das oportunidades.

## 6. Oportunidades

### 6.1. Endpoints

- `GET /opportunities`
- `GET /opportunities/{id}`
- `POST /opportunities`
- `PATCH /opportunities/{id}`
- `POST /opportunities/{id}/publish`
- `POST /opportunities/{id}/close`
- `DELETE /opportunities/{id}` — apenas para oportunidades em rascunho.

### 6.2. Estados

- `DRAFT`
- `ACTIVE`
- `CLOSED`

Uma empresa só poderá publicar oportunidades se o seu perfil estiver concluído e a verificação estiver aprovada.

## 7. Correspondência — MATCHING

### 7.1. Endpoints

- `GET /matching/recommendations`
- `GET /matching/opportunities/{id}/candidates`
- `GET /matching/{id}`
- `POST /matching/opportunities/{id}/refresh`
- `GET /matching/jobs/{job_id}`

### 7.2. Pesos aprovados

| Critério | Peso |
|---|---:|
| Competências | 50% |
| Experiência | 20% |
| Formação académica | 15% |
| Disponibilidade | 10% |
| Localização | 5% |
| **Total** | **100%** |

Fórmula:

`S = 0.50*C + 0.20*E + 0.15*F + 0.10*D + 0.05*L`

O backend será o único responsável pelo cálculo. O frontend apenas apresenta resultados, pontuação, critérios e competências correspondentes ou em falta.

A pontuação não representa uma probabilidade de contratação.

### 7.3. Competências obrigatórias e preferenciais — D09

**Aprovado: distinção entre competências obrigatórias e preferenciais.**

Cada oportunidade poderá definir:

- **Obrigatórias:** competências consideradas requisitos de elegibilidade.
- **Preferenciais:** competências que valorizam a correspondência, mas cuja ausência não exclui o candidato.

Regras:

1. A ausência de uma competência obrigatória torna o candidato não elegível para a oportunidade.
2. A ausência de competências preferenciais reduz a pontuação de correspondência, mas não elimina a elegibilidade.
3. O sistema deve apresentar claramente as competências obrigatórias em falta.
4. O resultado deve distinguir correspondência elevada de elegibilidade efetiva.
5. A ausência de uma competência obrigatória não deve impedir automaticamente o candidato de consultar a oportunidade ou submeter uma candidatura. A empresa poderá visualizar essa candidatura com a indicação de requisito não cumprido.

### 7.4. Dados ausentes — D10

**Aprovado: normalização dinâmica dos critérios disponíveis.**

A ausência de informação não deverá ser interpretada automaticamente como uma pontuação zero.

Regras:

1. Os critérios sem dados suficientes serão excluídos do cálculo.
2. Os pesos dos critérios disponíveis serão normalizados proporcionalmente para que a pontuação final continue numa escala de 0 a 100.
3. O sistema deverá apresentar a cobertura dos critérios utilizados no cálculo.
4. Quando existirem menos de dois critérios avaliáveis, o resultado será marcado como `INSUFFICIENT_DATA`, não sendo apresentado como uma correspondência fiável.
5. Os critérios excluídos devem ser identificáveis no detalhe da correspondência.

A elegibilidade por competências obrigatórias será avaliada separadamente da normalização da pontuação.

### 7.5. Atualização do matching — D11

**Aprovado: processamento automático e assíncrono através de worker.**

O matching será atualizado quando ocorrerem eventos relevantes:

- Publicação de uma oportunidade.
- Alteração significativa dos requisitos de uma oportunidade.
- Atualização do perfil ou das competências de um candidato.
- Alteração de disponibilidade ou localização relevante.
- Pedido explícito de atualização autorizado.

O processamento será realizado por um worker Python separado do processo principal da API.

Regras:

1. A API regista o pedido de atualização.
2. O sistema cria um `MATCHING_JOB`.
3. O worker processa o cálculo em segundo plano.
4. O frontend consulta o estado através de `GET /matching/jobs/{job_id}`.
5. O sistema evita executar simultaneamente trabalhos redundantes para os mesmos dados.
6. A atualização não deve bloquear a utilização normal da plataforma.

Estados previstos para os trabalhos:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

No MVP, o processamento será executado localmente, mantendo a possibilidade de migração futura para uma infraestrutura distribuída.

## 8. Candidaturas

### 8.1. Endpoints

- `POST /opportunities/{id}/applications`
- `GET /applications/me`
- `GET /applications/{id}`
- `POST /applications/{id}/withdraw`
- `GET /companies/me/applications`
- `PATCH /applications/{id}/status`

### 8.2. Estados

- `PENDING`
- `REVIEWING`
- `SHORTLISTED`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

O backend deverá validar as transições de estado e garantir que uma empresa só pode gerir candidaturas às suas próprias oportunidades.

## 9. Notificações

- `GET /notifications`
- `GET /notifications/{id}`
- `PATCH /notifications/{id}/read`
- `POST /notifications/read-all`
- `DELETE /notifications/{id}`

As notificações deverão respeitar as permissões do utilizador autenticado.

## 10. Paginação — D05 e D06

**Aprovado: paginação baseada em número de página.**

Parâmetros:

- `page`: número da página.
- `page_size`: quantidade de elementos por página.
- `sort_by`: campo de ordenação, quando suportado pelo endpoint.
- `sort_order`: direção da ordenação (`asc` ou `desc`).

Valores aprovados:

- Página inicial: `1`.
- Tamanho padrão: `20`.
- Tamanho máximo: `100`.

Formato de resposta:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 120,
    "total_pages": 6
  }
}
```

Os parâmetros de ordenação devem ser validados individualmente por endpoint, evitando permitir ordenação por campos não autorizados.

## 11. Autorização e permissões

- Candidatos gerem os próprios perfis, competências e candidaturas.
- Empresas gerem os próprios perfis e oportunidades.
- Empresas consultam correspondências e candidaturas das suas próprias oportunidades.
- Administradores gerem verificações empresariais e operações administrativas autorizadas.
- O backend valida sempre a propriedade dos recursos e as permissões.
- Conhecer ou alterar um UUID nunca concede acesso a um recurso.

A autorização será aplicada no backend, independentemente das restrições de navegação existentes no frontend.

## 12. Encerramento e retenção de contas — D12

**Aprovado: encerramento imediato do acesso e eliminação ou anonimização posterior.**

Quando um utilizador solicitar a eliminação da conta:

1. A conta será desativada imediatamente.
2. As sessões e refresh tokens serão revogados.
3. O utilizador deixará de conseguir autenticar-se.
4. Será iniciado um período de recuperação de 30 dias.
5. Após esse período, os dados pessoais serão eliminados ou anonimizados, conforme a sua natureza e as obrigações legais aplicáveis.
6. Registos que tenham de ser conservados por obrigação legal ou necessidade legítima documentada serão mantidos apenas pelo período necessário, com acesso restrito.
7. Dados estatísticos poderão ser preservados quando estiverem efetivamente anonimizados.

O procedimento deverá respeitar a legislação aplicável e ser validado juridicamente antes do lançamento em produção.

## 13. Estratégia de integração frontend/backend

- FastAPI e Pydantic definem os contratos e esquemas do backend.
- OpenAPI será a fonte de referência para os tipos partilhados.
- Os tipos TypeScript serão gerados para `src/types/generated/`.
- O frontend utilizará um cliente HTTP centralizado.
- Os pedidos autenticados utilizarão Bearer access token.
- Os pedidos que dependem de cookies incluirão credenciais.
- O mecanismo de refresh deverá impedir ciclos de renovação e pedidos concorrentes desnecessários.
- A aplicação deverá tratar corretamente respostas de erro, sessões expiradas e permissões insuficientes.

## 14. Primeira integração vertical

A primeira sequência funcional será:

1. Registo de utilizador.
2. Login.
3. Consulta do perfil autenticado.
4. Atualização do perfil.
5. Logout.

Após validar essa sequência, a implementação avançará para:

1. Registo e onboarding empresarial.
2. Criação e gestão de oportunidades.
3. Perfis e competências dos candidatos.
4. Correspondência automática.
5. Candidaturas.
6. Notificações.
7. Verificação e operações administrativas.

## 15. Registo final das decisões

| Código | Decisão | Estado |
|---|---|---|
| D01 | Access token: 15 minutos | APROVADA |
| D02 | Refresh token: 7 dias | APROVADA |
| D03 | Rotação de refresh token | APROVADA |
| D04 | Proteção CSRF com token associado à sessão | APROVADA |
| D05 | Paginação por número de página | APROVADA |
| D06 | Padrão 20, máximo 100 | APROVADA |
| D07 | Perfil empresarial em duas etapas | APROVADA |
| D08 | Verificação progressiva das empresas | APROVADA |
| D09 | Competências obrigatórias e preferenciais | APROVADA |
| D10 | Normalização dinâmica de dados disponíveis | APROVADA |
| D11 | Matching automático e assíncrono | APROVADA |
| D12 | Desativação imediata e anonimização posterior | APROVADA |

**Resultado:** as decisões funcionais e técnicas previstas para o contrato da API estão consolidadas. O documento passa a servir como referência para a implementação do backend e para a integração com o frontend.