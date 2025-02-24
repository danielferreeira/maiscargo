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
    console.log('Configuração da requisição:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer ****' : undefined
      }
    });
    return config;
  },
  (error) => {
    console.error('Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros nas respostas
api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });

    // Se o erro for de autenticação, fazer logout
    if (error.response?.status === 401) {
      console.log('Token inválido ou expirado, redirecionando para login...');
      localStorage.removeItem('@MaisCargo:token');
      localStorage.removeItem('@MaisCargo:user');
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
    }

    // Se o erro for de conexão
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão com o servidor. Por favor, verifique sua internet.'));
    }

    // Se for erro 500
    if (error.response.status === 500) {
      console.error('Erro interno do servidor:', error.response.data);
      return Promise.reject(new Error('Erro interno do servidor. Por favor, tente novamente.'));
    }

    return Promise.reject(error);
  }
);

export default api; 