import { faker } from '@faker-js/faker';
faker.location = 'pt_BR';

export function createPaciente(){
    return {
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        telefone: faker.phone.number('119########')
    }
}