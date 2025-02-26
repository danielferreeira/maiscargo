/**
 * Consulta um CEP na API ViaCEP e retorna os dados do endereço
 * @param {string} cep - CEP a ser consultado
 * @returns {Promise<Object>} Dados do endereço
 * @throws {Error} Erro caso o CEP seja inválido ou não encontrado
 */
export async function consultarCEP(cep) {
  if (!cep) {
    throw new Error('CEP é obrigatório');
  }

  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  try {
    const url = `https://viacep.com.br/ws/${cepLimpo}/json`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar o CEP: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro === true) {
      throw new Error('CEP não encontrado');
    }

    // Validação dos dados retornados
    if (!data.uf || !data.localidade) {
      throw new Error('CEP não retornou dados completos do endereço');
    }

    // Formata o endereço
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      cep: cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2'),
      complemento: data.complemento || ''
    };
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão ao consultar o CEP. Verifique sua internet.');
    }
    throw error;
  }
} 