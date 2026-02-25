class Exames {
    fieldBuscarExame = 'input[placeholder="Buscar por nome, email ou telefone..."]';
    paginatorResult = '.mat-mdc-paginator-range-label';
    btnDeletarExame = ['mat-icon', ' delete '];
    btnConfirmar = ['button', ' Confirmar '];

    searchExame(name){
        cy.get(this.fieldBuscarExame).should('be.visible').clear().type(name);
    }
    validateObtainedSearch(){
        cy.get(this.paginatorResult).should('contain', '1');
    }
    clickBtnDeletarExame(){
        cy.contains(this.btnDeletarExame[0], this.btnDeletarExame[1]).should('be.visible').first().click();
    }
    clickBtnConfirmarExclusaoExame(){
        cy.contains(this.btnConfirmar[0], this.btnConfirmar[1]).should('be.visible').click();
    }
}

export default Exames;