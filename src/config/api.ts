// Configuração da API usando fetch nativo para melhor compatibilidade com Azure
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jogos-inventario.azurewebsites.net/api';

console.log('🔗 Conectando ao backend:', API_BASE_URL);

// Função helper para fazer requisições com fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers padrão
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('accessToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  console.log(`📡 ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Timeout de 15 segundos
      signal: AbortSignal.timeout(15000),
    });

    console.log(`✅ ${options.method || 'GET'} ${endpoint} - ${response.status}`);

    // Se não autorizado, limpar token e recarregar
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.reload();
      throw new Error('Não autorizado');
    }

    // Se não for sucesso, lançar erro
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ${response.status}: ${errorText}`);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    // Se resposta vazia (204 No Content), retornar null
    if (response.status === 204) {
      return null;
    }

    // Tentar parsear JSON
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Erro na requisição:', error);
    
    if (error.name === 'TimeoutError') {
      throw new Error('Timeout: Servidor não respondeu em 15 segundos');
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Erro de rede: Não foi possível conectar ao servidor');
    }
    
    throw error;
  }
};

// API object com métodos HTTP
const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  
  post: (endpoint: string, data?: any) => apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }),
  
  put: (endpoint: string, data?: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }),
  
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;