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
  if (token && !token.startsWith('mock_token_')) {
    // Só adicionar o header Authorization se for um token real (não mock)
    defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token JWT adicionado ao header da requisição');
  } else if (token && token.startsWith('mock_token_')) {
    console.log('🎭 Usando token mock (backend offline)');
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  console.log(`📡 ${options.method || 'GET'} ${endpoint} -> ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Timeout de 15 segundos para desenvolvimento local
      signal: AbortSignal.timeout(15000),
      // Configurações para CORS
      mode: 'cors',
      credentials: 'omit',
    });

    console.log(`✅ ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);

    // Se não autorizado, limpar token e recarregar
    if (response.status === 401) {
      console.log('🚫 Token expirado ou inválido, fazendo logout...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.reload();
      throw new Error('Token expirado - redirecionando para login');
    }

    // Se não for sucesso, lançar erro
    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorText = errorBody;
        }
      } catch (e) {
        // Ignore error parsing response body
      }
      console.error(`❌ Erro ${response.status}: ${errorText}`);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    // Se resposta vazia (204 No Content), retornar null
    if (response.status === 204) {
      return null;
    }

    // Tentar parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📦 Dados recebidos:`, data);
      return data;
    } else {
      // Se não for JSON, retornar texto
      const text = await response.text();
      console.log(`📦 Resposta texto:`, text);
      return text;
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição:', error);
    
    if (error.name === 'TimeoutError') {
      throw new Error('Timeout: Servidor não respondeu em 15 segundos');
    }
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // Erro mais específico para desenvolvimento local
      if (API_BASE_URL.includes('localhost')) {
        throw new Error('Erro de conexão: Verifique se o backend local está rodando na porta 8080');
      } else {
        throw new Error('Erro de rede: Não foi possível conectar ao servidor');
      }
    }

    if (error.message.includes('CORS')) {
      throw new Error('Erro CORS: Servidor bloqueou a requisição');
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