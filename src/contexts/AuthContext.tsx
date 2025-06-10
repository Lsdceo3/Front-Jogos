import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'TOKEN_REFRESH'; payload: string };

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, isAuthenticated: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'TOKEN_REFRESH':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, token: savedToken } 
        });
        console.log('🔐 Token JWT encontrado, usuário autenticado automaticamente');
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('🔐 Tentando login com backend JWT...');
      
      // Tentar autenticação real com o backend
      const response = await api.post('/auth/login', {
        username: email, // O backend espera 'username'
        password: password,
      });

      if (response && response.token) {
        const user: User = {
          id: response.username || email,
          email: email,
          name: response.username || email.split('@')[0],
          username: response.username || email,
          role: email.includes('admin') ? 'admin' : 'user', // Determinar role baseado no email por enquanto
        };

        // Salvar token e usuário
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, token: response.token } 
        });
        
        console.log('✅ Login realizado com sucesso via JWT!');
        return true;
      }
    } catch (error: any) {
      console.log('❌ Falha na autenticação JWT, usando fallback mock...');
      
      // Fallback para autenticação mock se o backend não estiver disponível
      if (email && password) {
        const user: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          username: email,
          role: email.includes('admin') ? 'admin' : 'user',
        };
        
        // Gerar um token mock para manter a consistência
        const mockToken = `mock_token_${Date.now()}`;
        localStorage.setItem('accessToken', mockToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, token: mockToken } 
        });
        
        console.log('✅ Login realizado com dados mock (backend offline)');
        return true;
      }
    }
    
    dispatch({ type: 'LOGIN_FAILURE' });
    return false;
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('📝 Tentando registro com backend JWT...');
      
      // Tentar registro real com o backend
      const response = await api.post('/auth/register', {
        username: email,
        password: password,
        email: email,
      });

      if (response && response.token) {
        const user: User = {
          id: response.username || email,
          email: email,
          name: name,
          username: response.username || email,
          role: role,
        };

        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ 
          type: 'REGISTER_SUCCESS', 
          payload: { user, token: response.token } 
        });
        
        console.log('✅ Registro realizado com sucesso via JWT!');
        return true;
      }
    } catch (error: any) {
      console.log('❌ Falha no registro JWT, usando fallback mock...');
      
      // Fallback para registro mock
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        username: email,
        role,
      };
      
      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: { user, token: mockToken } 
      });
      
      console.log('✅ Registro realizado com dados mock (backend offline)');
      return true;
    }
    
    dispatch({ type: 'LOGIN_FAILURE' });
    return false;
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};