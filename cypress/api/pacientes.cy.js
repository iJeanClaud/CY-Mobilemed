import { createPaciente } from "../support/Factories/paciente";
import { getCpfValido } from "../support/utils/customScripts";

describe('Pacientes API', () => {
    const apiLoginUrl = Cypress.env('apiUrl');
    let token;

    beforeEach(() => {
        // Estratégia: autenticar antes de cada teste para garantir token válido e isolar respostas de autorização
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

                const accessToken = loginResponse.body.data.accessToken;
                token = accessToken;
            });
        });
    });

    // Cenário: criação de paciente válida deve responder 201
    it('Deve cadastrar paciente com sucesso', () => {
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: createPaciente().nome,
                document: getCpfValido()
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(201);
            cy.log('Paciente: ' + response.body.name + ' cadastrado(a) com sucesso!');
        });
    });

    // Cenário: bloqueio de documento duplicado entre pacientes
    it('Não deve cadastrar paciente com documento já existente', () => {
        const cpfUnico = getCpfValido();

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: createPaciente().nome,
                document: cpfUnico
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(201);
        });

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
            Authorization: `Bearer ${token}`
            },
            body: {
            name: createPaciente().nome,
            document: cpfUnico
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.not.eq(201);
        });
    });

    // Cenário: requisições sem token devem ser negadas
    it('Não deve cadastrar paciente sem token de autenticação', () => {
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            body: {
                name: createPaciente().nome,
                document: getCpfValido()
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401);
        });
    })

    // Cenário: validação de campos obrigatórios vazios
    it('Não deve cadastrar paciente com campos obrigatórios em branco', () => {
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: ' ',
                document: ' '
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.not.eq(201);
        });
    });

    // Cenário: documento com formato inválido deve ser rejeitado
    it('Não deve cadastrar paciente com documento inválido', () => {
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: createPaciente().nome,
                document: 'abc@123$#'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // Cenário: payload com valores nulos deve falhar na validação
    it('Não deve cadastrar paciente com campos nulos', () => {
        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: null,
                document: null
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // Cenário: paginação básica retornando metadados e limite solicitado
    it('Deve retornar pacientes paginados corretamente', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/pacientes?page=1&pageSize=2`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)

            expect(response.body.pagination.currentPage).to.eq(1)
            expect(response.body.pagination.pageSize).to.eq(2)
            expect(response.body.data.length).to.be.lte(2)
        })
    })

    // Cenário: limite pageSize=1 deve restringir resposta a 1 registro
    it('Deve retornar apenas 1 paciente quando pageSize for 1', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/pacientes?page=1&pageSize=1`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.data.length).to.eq(1)
        })
    });

    // Cenário: parâmetro de página inválido deve gerar erro de validação
    it('Não deve retornar pacientes com página inválida', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/pacientes?page=a&pageSize=1`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400)
        })
    });

    // Cenário: pageSize inválido deve ser recusado
    it('Não deve retornar pacientes com pageSize inválido', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/pacientes?page=1&pageSize=a`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400)
        }) 
    });

    // Cenário: listagem sem token precisa falhar por falta de autenticação
    it('Não deve retornar lista de pacientes sem token de autenticação', () => {
        cy.request({
            method: 'GET',
            url: `${apiLoginUrl}/pacientes?page=1&pageSize=1`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401)
        })
    });

    // Cenário: fluxo de criação seguido de deleção deve concluir com 204
    it('Deve remover paciente com sucesso', () => {
        const nomePaciente = createPaciente().nome;
        const cpfPaciente = getCpfValido();
        let pacienteId;

        cy.request({
            method: 'POST',
            url: `${apiLoginUrl}/pacientes`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                name: nomePaciente,
                document: cpfPaciente
            },
            failOnStatusCode: false
        }).then((createResponse) => {
            expect(createResponse.status).to.eq(201);

            // Obtém a ID
            pacienteId = createResponse.body.data?.id || createResponse.body.id;

            expect(pacienteId).to.exist;

            // Apaga o paciente pela ID e valida resposta sem conteúdo
            cy.request({
                method: 'DELETE',
                url: `${apiLoginUrl}/pacientes/${pacienteId}`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                failOnStatusCode: false
            }).then((deleteResponse) => {
                expect(deleteResponse.status).to.eq(204);
            });
        });
    });

});
