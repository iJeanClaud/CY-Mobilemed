# Automação de Testes — Desafio Técnico QA III (Mobilemed)

Suíte Cypress para validar a aplicação de gestão de pacientes e exames (backend NestJS + PostgreSQL, frontend Angular). A automação cobre fluxos críticos de UI (E2E) e API com foco em autenticação, pacientes e exames, incluindo regras de negócio como idempotência e unicidade de documento.

## Stack e ambiente
- **Framework de testes:** Cypress 13 (UI e API)
- **Linguagem:** JavaScript
- **Gerenciador:** npm
- **Backend alvo:** NestJS 10 + PostgreSQL em Docker, acessado por meio da URL `http://localhost:3000`
- **Frontend alvo:** Angular 19 em `http://localhost:4200`
- **Autenticação:** JWT (usuário seed `adm@gmail.com`, senha `muka123`)

> Detalhes completos de setup do ambiente estão no repositório base: https://github.com/mobilemed-dev/desafio-tecnico-QA-III

## Estrutura
- `cypress/e2e`: testes de interface (login, pacientes, exames).
- `cypress/api`: testes de API para auth, pacientes e exames.
- `cypress/fixtures`: dados de apoio (login, pacientes).
- `cypress/support`: Page Objects, factories, comandos customizados (`cy.loginApi`), utilidades.

## Cenários cobertos
**UI (E2E)**
- Login: sucesso, erros de credencial, campos vazios, proteção de rota, bypass com token forjado.
- Pacientes: listagem, criação, duplicidade de documento, obrigatoriedade de campos, edição de nome, bloqueio de alteração para documento já usado, exclusão; criação/validação de exame via UI com feedbacks de modal.
- Exames: exclusão de exame criado via task.

**API**
- Auth: login válido; erros para credenciais incorretas, payload vazio, email inválido e senha errada.
- Pacientes: criação válida; bloqueio de duplicidade; erros sem token, campos vazios/nulos ou documento inválido; paginação (parâmetros válidos e inválidos); exclusão.
- Exames: criação vinculada a paciente válido; erros sem token ou com paciente inexistente; idempotência; paginação.

## Pré-requisitos locais
1. Backend e frontend do desafio rodando.
2. Node.js 18+ e npm instalados.

## Configuração
- Clone este repositório e instale as dependências com `npm install`.
- Credenciais padrão vêm de `cypress/fixtures/login.json` e devem refletir as seeds do backend (`adm@gmail.com` / `muka123`).
- Para os testes de UI, garanta o frontend rodando em `http://localhost:4200`; para API, o backend deve estar ativo.

## Como executar
**UI (E2E) / API**
```bash
npx cypress open   # runner interativo
npx cypress run    # headless
```

## Estratégia
- Suites separadas para UI e API, facilitando identificação do tipo de teste.
- Autenticação via API para E2E (`cy.loginApi`) reduzindo setup e tempo de execução.
- Factories e fixtures para dados dinâmicos e CPFs válidos.
- Cobertura de regras de negócio críticas: idempotencyKey em exames, documento único de paciente, paginação consistente.

## Testes exploratórios e evidências
Testes exploratórios manuais foram executados; evidências e modelos de registro estão disponíveis para consulta:
https://drive.google.com/file/d/1cuLLbQLjduj9JNSfLSIC8ZzTjFyLjJWN/view?usp=sharing
