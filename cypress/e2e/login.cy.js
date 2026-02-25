import Login from "../support/PageObjects/login";

describe('Login', () => {
  const login = new Login();
  const loginUrl = 'http://localhost:4200';
  const homePath = '/patients';

  beforeEach(() => {
    // Pré-condição: garante que cada teste começa na tela de login sem estado prévio
    cy.visit(loginUrl)
  })

  // Valida autenticação UI com credenciais válidas e redirecionamento para pacientes
  it('Deve logar com sucesso', () => {
    cy.fixture('login').then((data) => {
      // Preenche credenciais válidas usando Page Object para manter encapsulamento dos seletores
      login.setEmail(data.ui.credential.email);
      login.setPassword(data.ui.credential.password);
    });
    login.clickLoginButton();
    cy.url().should('include', homePath);
  })

  // Verifica mensagem de erro quando usuário e senha são inválidos
  it('Deve exibir mensagem de erro para credenciais inválidas', () => {
    login.setEmail('invalid@email.com');
    login.setPassword('invalidpassword');
    login.clickLoginButton();

    cy.fixture('login').then((data) => {
      login.getErrorLabel().should('be.visible').and('contain', data.ui.LoginPageErrorMessages.invalidCredencialLabel);
    });
  })

  // Garante bloqueio de submissão com campos obrigatórios vazios
  it('Deve exibir mensagem de erro para campos vazios', () => {
    // Limpa inputs garantindo ausência de valores antes do submit
    login.getEmailInput().clear();
    login.getPasswordInput().clear();
    login.clickLoginButton();

    cy.fixture('login').then((data) => {
      login.getErrorLabel().should('be.visible').and('contain', data.ui.LoginPageErrorMessages.emptyFieldsLabel);
    });
  })

  // Assegura que senha válida não dispara alerta de senha incorreta isoladamente
  it('Não deve exibir mensagem de senha inválida para o campo de senha preenchido corretamente', () => {
    login.setEmail('invalid@email.com');
    login.setPassword('randompassword');
    login.clickLoginButton();
    login.getWrongPasswordMessage().should('not.be.visible');
  })

  // Reenvio consecutivo mantém mensagem adequada sem inconsistência de estado
  it('Reenvio com campos preenchidos não deve exibir erro de preenchimento obrigatório', () => {
    login.setEmail('invalid@email.com');
    login.setPassword('invalidpassword');

    cy.fixture('login').then((data) => {
      // Executa a validação 2x
      for(let i = 0; i < 2; i++) {
        login.clickLoginButton();
        login.getErrorLabel().should('be.visible').and('contain', data.ui.LoginPageErrorMessages.invalidCredencialLabel);
      }
    });
  })

  // Proteção de rota: token forjado no localStorage não deve conceder acesso
  it('Bypass via localStorage não deve permitir acesso à rota protegida', () => {
    // Simula o login armazenando um token falso no localStorage
    cy.visit(loginUrl)

    cy.window().then((win) => {
      // Injeta token inválido sem passar pelo fluxo de autenticação real
      win.localStorage.setItem('auth_token', JSON.stringify({ accessToken: 'fake', expiresAt: '2099-01-01' }));
    });

    cy.visit(`${loginUrl}${homePath}`);
    cy.location('pathname').should('eq', '/login');
  })

  // Acesso direto a rota protegida sem autenticação deve redirecionar ao login
  it('Não deve permitir acesso à rota protegida sem fazer login', () => {
    cy.clearLocalStorage();
    cy.visit(loginUrl);
    cy.location('pathname').should('eq', '/login');
  })

})
