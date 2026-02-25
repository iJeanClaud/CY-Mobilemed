import { createPaciente } from "../support/Factories/paciente";
import { getCpfValido } from "../support/utils/customScripts";

describe('Exames API', () => {
    const apiLoginUrl = Cypress.env('apiUrl');
    let token;
    let pacienteId;

    beforeEach(() => {
        // Estratégia: autenticar antes de cada teste para reutilizar token e isolar falhas de autorização
        cy.fixture('login').then((data) => {
            cy.request({
                method: 'POST',
                url: apiLoginUrl + '/auth/login',
                body: {
                    email: data.api.credentials.validEmail,
                    password: data.api.credentials.validPassword
                },
                failOnStatusCode: false
            }).then((loginResponse) => {
                expect(loginResponse.status).to.eq(200);
                token = loginResponse.body.data.accessToken;
            });
        });
    });

    // Cenário: criação de exame vinculando paciente recém-criado deve responder 201
    it('Deve cadastrar exame com sucesso', () => {

        // Pré-condição: cria paciente para relacionar o exame
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                name: createPaciente().nome,
                document: getCpfValido()
            },
            failOnStatusCode: false
        }).then((pacienteResponse) => {

            expect(pacienteResponse.status).to.eq(201);
            pacienteId = pacienteResponse.body.data?.id || pacienteResponse.body.id;

            // Ação principal: cadastra exame vinculado ao paciente recém-criado
            cy.request({
                method: 'POST',
                url: `${apiLoginUrl}/exames`,
                headers: { Authorization: `Bearer ${token}` },
                body: {
                    patientId: pacienteId,
                    modality: "CR",
                    idempotencyKey: "exam-key-1"
                },
                failOnStatusCode: false
            }).then((examResponse) => {

                expect(examResponse.status).to.eq(201);
                expect(examResponse.body.data?.id || examResponse.body.id).to.exist;
            });
        });
    });

    // Cenário: requisição de criação sem token deve ser negada com 401
    it('Não deve cadastrar exame sem token', () => {

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/exames`,
            body: {
                patientId: "fake-id",
                modality: "CR",
                examDate: new Date().toISOString(),
                idempotencyKey: "exam-key-2"
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401);
        });
    });

    // Cenário: criação com paciente inexistente deve falhar
    it('Não deve cadastrar exame com paciente inexistente', () => {

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/exames`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                patientId: "uuid-invalido",
                modality: "CR",
                examDate: new Date().toISOString(),
                idempotencyKey: "exam-key-3"
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.not.eq(201);
        });
    });

    // Cenário: mesma idempotencyKey deve impedir duplicação de exame
    it('Não deve criar exame duplicado com mesma idempotencyKey', () => {

        const key = `exam-key-${Date.now()}`;

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                name: createPaciente().nome,
                document: getCpfValido()
            }
        }).then((pacienteResponse) => {

            pacienteId = pacienteResponse.body.data?.id || pacienteResponse.body.id;

            // Primeira requisição usando a idempotencyKey gerada
            cy.request({
                method: 'POST',
                url: `${apiLoginUrl}/exames`,
                headers: { Authorization: `Bearer ${token}` },
                body: {
                    patientId: pacienteId,
                    modality: "CR",
                    idempotencyKey: key
                },
                failOnStatusCode: false
            }).then((firstResponse) => {

                expect(firstResponse.status).to.eq(201);
                cy.log(`IdempotencyKey 1 ===> ${key}`);

                // Segunda requisição repetindo a mesma idempotencyKey para validar bloqueio
                cy.request({
                    method: 'POST',
                    url: `${apiLoginUrl}/exames`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: {
                        patientId: pacienteId,
                        modality: "CR",
                        idempotencyKey: key
                    },
                    failOnStatusCode: false
                }).then((secondResponse) => {
                    expect(secondResponse.status).to.not.eq(201);
                    
                });
            });
        });
    });

    it('Deve retornar exames paginados corretamente', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/exames/paginated?page=1&pageSize=2`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body.pagination).to.exist;
            expect(response.body.data.length).to.be.lte(2);
        });
    });
});
