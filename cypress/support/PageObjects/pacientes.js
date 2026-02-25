class Pacientes {
    pacienteNameList = '.mdc-data-table__content > :nth-child(1) > .cdk-column-name';
    btnNovoPaciente = ['button', ' Novo Paciente '];
    fieldNomePaciente = 'input[placeholder="Digite o nome aqui"]';
    fieldPacienteDocumment = 'input[placeholder="000.000.000-00"]';
    msgPacienteCadastrado = '.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label';
    btnSalvar = ['button[type="submit"]', 'Salvar'];
    fieldBuscaPaciente = 'input[placeholder="Buscar por nome, email ou telefone..."]';
    btnEditarPaciente = ['mat-icon', 'edit'];
    btnDeletarPaciente = ['mat-icon', ' delete '];
    btnConfirmarExclusaoPaciente = ['button', ' Confirmar '];
    btnAddNovoExame = ['mat-icon', 'add_box'];
    slcModalidadeExame = ['mat-form-field', 'Modalidade', 'mat-select'];
    slcModalidadeExameOptions = '.mat-mdc-select-panel [role="option"]';
    paginatorResult = '.mat-mdc-paginator-range-label';
    btnFecharModalX = ['mat-icon', ' close '];
    btnCancelarModal = ['button', 'Cancelar'];

    checkPacienteNameList(){
        cy.get(this.pacienteNameList).should('exist');
    }
    clickBtnNovoPaciente(){
        cy.contains(this.btnNovoPaciente[0], this.btnNovoPaciente[1]).should('be.visible').click();
    }
    fillPacienteName(name){
        if(name === '' || name === null || name === undefined){
            cy.get(this.fieldNomePaciente).should('be.visible').clear();
        }else{
            cy.get(this.fieldNomePaciente).should('be.visible').clear().type(name);
        }
    }
    fillPacienteDocument(document){
        if(document === '' || document === null || document === undefined){
            cy.get(this.fieldPacienteDocumment).should('be.visible').clear();
        }else{
            cy.get(this.fieldPacienteDocumment).should('be.visible').clear().type(document);
        }
    }
    clickBtnSalvar(){
        cy.contains(this.btnSalvar[0], this.btnSalvar[1]).should('be.visible').click();
    }
    getPacienteCadastradoMessage(message){
        return cy.contains(this.msgPacienteCadastrado, message).should('be.visible');
    }
    checkMessage(message){
        cy.contains(message).should('be.visible');
    }
    cadastrarPaciente(name, document){
        this.clickBtnNovoPaciente();
        this.fillPacienteName(name);
        this.fillPacienteDocument(document);
        this.clickBtnSalvar();
    }
    searchPaciente(name){
        cy.get(this.fieldBuscaPaciente).should('be.visible').clear().type(name);
    }
    clickBtnEditarPaciente(){
        cy.contains(this.btnEditarPaciente[0], this.btnEditarPaciente[1]).should('be.visible').first().click();
    }
    clickBtnDeletarPaciente(){
        cy.contains(this.btnDeletarPaciente[0], this.btnDeletarPaciente[1]).should('be.visible').first().click();
    }
    clickBtnConfirmarExclusaoPaciente(){
        cy.contains(this.btnConfirmarExclusaoPaciente[0], this.btnConfirmarExclusaoPaciente[1]).should('be.visible').click();
    }
    clickBtnAddNovoExame(){
        cy.contains(this.btnAddNovoExame[0], this.btnAddNovoExame[1]).should('be.visible').first().click();
    }
    selectModalidadeExame(){
        cy.contains(this.slcModalidadeExame[0], this.slcModalidadeExame[1]).find(this.slcModalidadeExame[2]).click();
        cy.get(this.slcModalidadeExameOptions).not(':first').then($opts => {
            const i = Cypress._.random(0, $opts.length - 1);
            cy.wrap($opts[i]).click();
        })
    }
    validateObtainedSearch(){
        cy.get(this.paginatorResult).should('contain', '1');
    }
    clickBtnFecharModalX(){
        cy.contains(this.btnFecharModalX[0], this.btnFecharModalX[1]).should('be.visible').click();
    }
    clickBtnCancelarModal(){
        cy.contains(this.btnCancelarModal[0], this.btnCancelarModal[1]).should('be.visible').click();
    }
}

export default Pacientes;