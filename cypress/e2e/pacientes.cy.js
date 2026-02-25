import Pacientes from "../support/PageObjects/pacientes";
import Exames from "../support/PageObjects/exames";
import { createPaciente } from "../support/Factories/paciente";
import { getCpfValido } from "../support/utils/customScripts";

describe('Pacientes', () => {
    const pacientes = new Pacientes();
    const exames = new Exames();

    beforeEach(() => {
        // Pré-condição: autentica via API e abre lista de pacientes para isolar cada cenário
        cy.fixture('login').then((data) => {
            cy.loginApi(data.ui.credential.email, data.ui.credential.password);
            cy.visit('/patients');
        });
    })
    
    // Verifica fechamento consistente do modal de cadastro de exame
    it('Modal cadastro de exame deve fechar corretamente', () => {
        // Define ambos caminhos de fechamento para cobrir X e botão Cancelar
        pacientes.clickBtnAddNovoExame();
        pacientes.clickBtnFecharModalX();

        pacientes.clickBtnAddNovoExame();
        pacientes.clickBtnCancelarModal();
    });

    // Confirma que modal de edição pode ser fechado por X e cancelar
    it('Modal editar paciente deve fechar corretamente', () => {
        pacientes.clickBtnEditarPaciente();
        pacientes.clickBtnFecharModalX();

        pacientes.clickBtnEditarPaciente();
        pacientes.clickBtnCancelarModal();
    });

    // Garante UX do modal de novo exame ao fechar por X e cancelar
    it('Modal novo exame deve fechar corretamente', () => {
        pacientes.clickBtnAddNovoExame();
        pacientes.clickBtnFecharModalX();

        pacientes.clickBtnAddNovoExame();
        pacientes.clickBtnCancelarModal();
    });

    // Checa saída segura do modal de confirmação de exclusão
    it('Modal confirmação de exclusão deve fechar corretamente', () => {
        pacientes.clickBtnDeletarPaciente();
        pacientes.clickBtnCancelarModal();
    });

    // Smoke: lista de pacientes deve renderizar nomes visíveis
    it('Deve exibir lista de pacientes', () => {
        pacientes.checkPacienteNameList()
    })

    // Fluxo feliz de criação de paciente com documento válido
    it('Deve cadastrar um novo paciente', () => {
        pacientes.cadastrarPaciente(createPaciente().nome, getCpfValido());
    })

    // Impede duplicidade de documento entre pacientes distintos
    it('Não deve cadastrar pacientes diferentes com o mesmo documento', () => {
        const novoPaciente = createPaciente();
        const cpfUnico = getCpfValido();

        cy.fixture('pacientes').then((data) => {
            // Primeiro cadastro deve ser bem-sucedido
            pacientes.cadastrarPaciente(createPaciente().nome, cpfUnico);
            pacientes.getPacienteCadastradoMessage(data.ui.pacientesPageMessages.pacienteCadastradoSucesso);
            // Segundo cadastro com mesmo documento deve sinalizar duplicidade
            pacientes.cadastrarPaciente(novoPaciente.nome, cpfUnico);
            pacientes.getPacienteCadastradoMessage(data.ui.pacientesPageMessages.pacienteDuplicadoBase);
        });
    });

    // Valida obrigatoriedade do documento na criação
    it('Não deve aceitar apenas nome ao cadastrar novo paciente', () => {
        cy.fixture('pacientes').then((data) => {
            pacientes.cadastrarPaciente(createPaciente().nome, null);
            pacientes.checkMessage(data.ui.pacientesPageMessages.avisoPreenchimentoObrigatorio);
        });
    });

    // Valida obrigatoriedade do nome na criação
    it('Não deve aceitar apenas documento ao cadastrar novo paciente', () => {
        cy.fixture('pacientes').then((data) => {
            pacientes.cadastrarPaciente(null, getCpfValido());
            pacientes.checkMessage(data.ui.pacientesPageMessages.avisoPreenchimentoObrigatorio);
        });
    });

    // Edita nome mantendo documento e valida mensagem de sucesso
    it('Deve alterar nome do paciente com sucesso', () => {
        const pacienteNome = createPaciente().nome;
        const pacienteNovoNome = createPaciente().nome;
        const pacienteDocumento = getCpfValido();

        // Cadastra o primeiro paciente
        pacientes.cadastrarPaciente(pacienteNome, pacienteDocumento);

        cy.reload(true)
        // Localiza pelo nome original para depois alterar
        pacientes.searchPaciente(pacienteNome);
        pacientes.clickBtnEditarPaciente();
        pacientes.fillPacienteName(pacienteNovoNome);
        pacientes.clickBtnSalvar();

        cy.fixture('pacientes').then((data) => {
            pacientes.getPacienteCadastradoMessage(data.ui.pacientesPageMessages.pacienteAtualizadoComSucesso);
        });

        pacientes.searchPaciente(pacienteNovoNome);
        pacientes.validateObtainedSearch();
    });

    // Bloqueia edição de documento para valor já usado por outro paciente
    it('Não deve permitir que o documento de paciente já existente seja alterado para um já vinculado a outro paciente', () => {
        const pacienteNome = createPaciente().nome;
        const pacienteDocumento = getCpfValido();

        const paciente2Nome = createPaciente().nome;
        const paciente2Documento = getCpfValido();

        // Cadastra o primeiro paciente
        pacientes.cadastrarPaciente(pacienteNome, pacienteDocumento);
        
        // Cadastra o segundo paciente
        pacientes.cadastrarPaciente(paciente2Nome, paciente2Documento);

        cy.reload(true)
        // Tenta trocar o documento do segundo para o já usado pelo primeiro
        pacientes.searchPaciente(paciente2Nome);
        pacientes.clickBtnEditarPaciente();
        pacientes.fillPacienteDocument(pacienteDocumento);
        pacientes.clickBtnSalvar();

        cy.fixture('pacientes').then((data) => {
            pacientes.getPacienteCadastradoMessage(data.ui.pacientesPageMessages.pacienteDuplicadoBase);
        });
    });

    // Fluxo de deleção: criar, buscar e remover paciente
    it('Deve deletar paciente com sucesso', () => {
        const pacienteNome = createPaciente().nome;
        const pacienteDocumento = getCpfValido();

        // Cadastra o paciente
        pacientes.cadastrarPaciente(pacienteNome, pacienteDocumento);  

        // Procura o paciente cadastrado
        cy.reload(true);
        pacientes.searchPaciente(pacienteNome);

        // Deleta o paciente encontrado
        pacientes.clickBtnDeletarPaciente();
        pacientes.clickBtnConfirmarExclusaoPaciente();
    });

    // Verifica validação de campos obrigatórios ao criar exame via UI
    it('Não deve cadastrar exame inválido para o paciente', () => {
        const pacienteNome = createPaciente().nome;
        const pacienteDocumento = getCpfValido();

        // Cadastra o paciente
        pacientes.cadastrarPaciente(pacienteNome, pacienteDocumento);  

        // Procura o paciente cadastrado
        cy.reload(true);
        pacientes.searchPaciente(pacienteNome);
        pacientes.clickBtnAddNovoExame();
        pacientes.clickBtnSalvar();

        cy.fixture('pacientes').then((data) => {
            pacientes.checkMessage(data.ui.pacientesPageMessages.avisoPreenchimentoObrigatorio);
        });
    });

    // Cria exame a partir do paciente e confirma exibição na lista de exames
    it('Deve cadastrar exame com sucesso para o paciente', () => {
        const pacienteNome = createPaciente().nome;
        const pacienteDocumento = getCpfValido();

        // Cadastra o paciente
        pacientes.cadastrarPaciente(pacienteNome, pacienteDocumento);  

        // Procura o paciente cadastrado
        cy.reload(true);
        pacientes.searchPaciente(pacienteNome);
        pacientes.clickBtnAddNovoExame();
        pacientes.selectModalidadeExame();
        pacientes.clickBtnSalvar();

        cy.fixture('pacientes').then((data) => {
            pacientes.checkMessage(data.ui.pacientesPageMessages.exameCriadoComSucesso);
        });

        cy.visit('/exams');
        cy.reload();
        // Valida que o exame recém-criado aparece na listagem filtrada
        exames.searchExame(pacienteNome);
        exames.validateObtainedSearch();
    });

})
