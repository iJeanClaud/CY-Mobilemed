import Exames from "../support/PageObjects/exames"

describe('Exames', () => {
    const exames = new Exames();

    beforeEach(() => {
        // Pré-condição: autentica via API e abre tela de exames antes de cada fluxo
        cy.fixture('login').then((data) => {
            cy.loginApi(data.credential.email, data.credential.password);
            cy.visit('/exams');
        });
    })

    // Fluxo de exclusão validando remoção de exame recém-criado
    it('Deve excluir exame com sucesso', () => {
        // Cria exame diretamente via base de dados
        cy.task('insertRandomExam').then((exam) => {
            cy.log('Exame criado:', exam.id);
        });

        // Atualiza grid e executa exclusão via UI
        cy.reload();
        exames.clickBtnDeletarExame();
        exames.clickBtnConfirmarExclusaoExame();
    });
})
