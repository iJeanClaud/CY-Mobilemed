describe('Login API', () => {
    const apiLoginUrl = Cypress.env('apiUrl');

    // Cenário: autenticação bem-sucedida retorna token e dados essenciais
    it('Deve logar com sucesso via API', () => {
        cy.fixture('login').then((data) => {
            const { validEmail, validPassword } = data.api.credentials;

            cy.request('POST', apiLoginUrl + '/auth/login', {
                email: validEmail,
                password: validPassword
            }).then((response) => {
                expect(response.status).to.eq(200);

                const data = response.body.data;
                expect(data).to.have.property('userId');
                expect(data).to.have.property('userName');
                expect(data).to.have.property('userEmail');
                expect(data).to.have.property('expiresIn');
                expect(data).to.have.property('accessToken');
            });
        });
    });

    // Cenário: rejeição quando email e senha são inválidos
    it('Deve falhar ao tentar logar com credenciais inválidas', () => {
        cy.fixture('login').then((data) => {
            const { invalidEmail, invalidPassword } = data.api.credentials;

            cy.request({
                method: 'POST',
                url: apiLoginUrl + '/auth/login',
                body: {
                    email: invalidEmail,
                    password: invalidPassword
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
    });

    // Cenário: requisição sem credenciais deve falhar por validação
    it('Deve falhar ao tentar logar sem informar credenciais', () => {
        cy.request({
            method: 'POST',
            url: apiLoginUrl + '/auth/login',
            body: {
                email: ' ',
                password: ' '
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // Cenário: email inválido com senha correta deve retornar erro de input
    it('Deve falhar ao tentar logar com senha correta e email inválido', () => {
        cy.fixture('login').then((data) => {
            const { validPassword } = data.api.credentials;

            cy.request({
                method: 'POST',
                url: apiLoginUrl + '/auth/login',
                body: {
                    email: 'emailinvalido',
                    password: validPassword
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
    });

    // Cenário: senha incorreta para usuário válido retorna erro de credencial
    it('Deve falhar ao tentar logar com senha inválida e email válido', () => {
        cy.fixture('login').then((data) => {
            const { validEmail } = data.api.credentials;

            cy.request({
                method: 'POST',
                url: apiLoginUrl + '/auth/login',
                body: {
                    email: validEmail,
                    password: 'senha invalida'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
    });
});
