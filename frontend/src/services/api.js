import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@MaisCargo:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error('Erro na configuração da requisição'));
  }
);

// Interceptor para tratar erros nas respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se não houver resposta do servidor
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão com o servidor. Verifique sua internet.'));
    }

    // Se o erro for de autenticação
    if (error.response.status === 401) {
      localStorage.removeItem('@MaisCargo:token');
      localStorage.removeItem('@MaisCargo:user');
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
    }

    // Se for erro de validação
    if (error.response.status === 400) {
      if (error.response.data?.details) {
        return Promise.reject({
          message: 'Erro de validação',
          validationErrors: error.response.data.details
        });
      }
      return Promise.reject(new Error(error.response.data?.error || 'Dados inválidos'));
    }

    // Se for erro de permissão
    if (error.response.status === 403) {
      return Promise.reject(new Error('Você não tem permissão para realizar esta ação'));
    }

    // Se for erro de não encontrado
    if (error.response.status === 404) {
      return Promise.reject(new Error('Recurso não encontrado'));
    }

    // Se for erro do servidor
    if (error.response.status >= 500) {
      return Promise.reject(new Error('Erro interno do servidor. Por favor, tente novamente.'));
    }

    // Para outros erros
    return Promise.reject(new Error(error.response.data?.error || 'Ocorreu um erro inesperado'));
  }
);

export default api; 