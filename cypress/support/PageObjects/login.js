class Login{
    emailInput = '#mat-input-0';
    passwordInput = '#mat-input-1';
    loginButton = '#container span.mdc-button__label';
    wrongEmailError = '#mat-mdc-error-3';
    wrongPasswordError = '#mat-mdc-error-4';
    errorLabel = '.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label';

    getEmailInput(){
        return cy.get(this.emailInput);
    }
    getPasswordInput(){
        return cy.get(this.passwordInput);
    }
    setEmail(email){
        cy.get(this.emailInput).type(email);
    }
    setPassword(password){
        cy.get(this.passwordInput).type(password);
    }
    clickLoginButton(){
        cy.get(this.loginButton).click();
    }
    getWrongMailMessage(){
        return cy.get(this.wrongEmailError);
    }
    getWrongPasswordMessage(){
        return cy.get(this.wrongPasswordError);
    }
    getErrorLabel(){
        return cy.get(this.errorLabel);
    }
}

export default Login;