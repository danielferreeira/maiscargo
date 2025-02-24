export async function consultarCEP(cep) {
  try {
    console.log('Iniciando consulta do CEP:', cep);
    
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    console.log('CEP limpo:', cepLimpo);
    
    if (cepLimpo.length !== 8) {
      console.error('CEP inválido - comprimento incorreto');
      throw new Error('CEP deve ter 8 dígitos');
    }

    const url = `https://viacep.com.br/ws/${cepLimpo}/json`;
    console.log('URL da requisição:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('Erro na resposta da API:', response.status, response.statusText);
      throw new Error(`Erro ao consultar o CEP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados recebidos da API:', data);

    if (data.erro === true) {
      console.error('CEP não encontrado na base de dados');
      throw new Error('CEP não encontrado');
    }

    // Validação adicional dos dados retornados
    if (!data.uf || !data.localidade) {
      console.error('Dados incompletos retornados pela API:', data);
      throw new Error('CEP não retornou dados completos do endereço');
    }

    // Garante que todos os campos existam, mesmo que vazios
    const endereco = {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      cep: cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2'),
      complemento: data.complemento || ''
    };

    console.log('Endereço formatado para retorno:', endereco);
    return endereco;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão ao consultar o CEP. Verifique sua internet.');
    }
    
    throw new Error(error.message || 'Erro ao consultar o CEP. Tente novamente.');
  }
} 