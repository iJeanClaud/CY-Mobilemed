export function getCpfValido() {

  function getCpfValido(cpf) {
    let total = 0;
    let reverso = cpf.length + 1;

    for (let stringNumerica of cpf) {
      total += reverso * Number(stringNumerica);
      reverso--;
    }

    const digito = 11 - (total % 11);
    return digito > 9 ? '0' : String(digito);
  }

  const noveDigitos = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 9)
  ).join('');

  const digito1 = getCpfValido(noveDigitos);
  const digito2 = getCpfValido(noveDigitos + digito1);

  return noveDigitos + digito1 + digito2;
}