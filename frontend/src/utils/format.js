/**
 * Formata uma data para o formato brasileiro (dd/mm/yyyy)
 * @param {string|Date} data - Data a ser formatada
 * @param {boolean} incluirHora - Se deve incluir a hora na formatação
 * @returns {string} Data formatada
 */
export const formatarData = (data, incluirHora = false) => {
  if (!data) return '';
  
  try {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return '';
    }

    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(incluirHora && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    return dataObj.toLocaleDateString('pt-BR', options);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 * @param {number|string} valor - Valor a ser formatado
 * @param {boolean} semSimbolo - Se deve omitir o símbolo da moeda
 * @returns {string} Valor formatado em reais
 */
export const formatarPreco = (valor, semSimbolo = false) => {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  
  try {
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    
    if (isNaN(numero)) {
      return 'R$ 0,00';
    }

    const formatador = new Intl.NumberFormat('pt-BR', {
      style: semSimbolo ? 'decimal' : 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return formatador.format(numero);
  } catch (error) {
    console.error('Erro ao formatar preço:', error);
    return 'R$ 0,00';
  }
};

/**
 * Formata um número para o formato brasileiro
 * @param {number|string} numero - Número a ser formatado
 * @param {number} decimais - Quantidade de casas decimais
 * @returns {string} Número formatado
 */
export const formatarNumero = (numero, decimais = 0) => {
  if (numero === null || numero === undefined) return '0';
  
  try {
    const num = typeof numero === 'string' ? parseFloat(numero.replace(',', '.')) : numero;
    
    if (isNaN(num)) {
      return '0';
    }

    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais
    });
  } catch (error) {
    console.error('Erro ao formatar número:', error);
    return '0';
  }
}; 