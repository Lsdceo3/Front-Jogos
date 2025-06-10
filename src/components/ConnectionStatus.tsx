import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const ConnectionStatus: React.FC = () => {
  const { state } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [authStatus, setAuthStatus] = useState<'authenticated' | 'mock' | 'none'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkConnection = async () => {
    setIsChecking(true);
    setErrorMessage('');
    
    try {
      // Try a simple health check first, then fall back to jogos endpoint
      console.log('🔍 Testando conexão com backend...');
      
      let response;
      try {
        // Try health endpoint first
        response = await api.get('/health');
      } catch (healthError) {
        // If health endpoint doesn't exist, try jogos endpoint
        console.log('Health endpoint não disponível, tentando /jogos...');
        response = await api.get('/jogos');
      }
      
      setIsConnected(true);
      setLastCheck(new Date());
      setErrorMessage('');
      
      // Verificar se está usando token real ou mock
      const token = localStorage.getItem('accessToken');
      if (token && !token.startsWith('mock_token_')) {
        setAuthStatus('authenticated');
        console.log('✅ Backend conectado com autenticação JWT!');
      } else if (token && token.startsWith('mock_token_')) {
        setAuthStatus('mock');
        console.log('✅ Backend conectado com dados mock!');
      } else {
        setAuthStatus('none');
        console.log('✅ Backend conectado sem autenticação!');
      }
    } catch (error: any) {
      setIsConnected(false);
      setLastCheck(new Date());
      setAuthStatus('mock');
      setErrorMessage(error.message);
      
      // More detailed error logging
      if (error.message.includes('CORS')) {
        console.log('❌ Erro CORS - Backend pode estar bloqueando requisições do frontend');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('conexão')) {
        console.log('❌ Falha na conexão - Backend pode estar offline ou inacessível');
      } else if (error.message.includes('Timeout')) {
        console.log('❌ Timeout - Backend não respondeu a tempo');
      } else {
        console.log('❌ Backend não está respondendo:', error.message);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verifica a conexão a cada 60 segundos
    const interval = setInterval(checkConnection, 60000);
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  if (isConnected === null && !isChecking) return null;

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-800 border-red-200';
    if (authStatus === 'authenticated') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (authStatus === 'mock') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando conexão...';
    if (!isConnected) return 'Backend Offline';
    if (authStatus === 'authenticated') return 'Backend Online (JWT)';
    if (authStatus === 'mock') return 'Backend Online (Mock)';
    return 'Backend Online';
  };

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    if (authStatus === 'authenticated') return <Shield className="w-4 h-4" />;
    if (authStatus === 'mock') return <ShieldOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const isLocalBackend = import.meta.env.VITE_API_BASE_URL?.includes('localhost');

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all ${getStatusColor()}`}>
        {getStatusIcon()}
        
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {getStatusText()}
          </span>
          {lastCheck && (
            <span className="text-xs opacity-75">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
          {state.isAuthenticated && (
            <span className="text-xs opacity-75">
              {state.user?.username || state.user?.email}
            </span>
          )}
        </div>
        
        {!isConnected && !isChecking && (
          <button
            onClick={checkConnection}
            className="ml-2 p-1 hover:bg-red-200 rounded transition-colors"
            title="Tentar reconectar"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* URL do backend e status de autenticação */}
      <div className="mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow text-center max-w-xs">
        <div className="font-mono truncate">
          {isLocalBackend ? 'localhost:8080' : 'jogos-inventario.azurewebsites.net'}
        </div>
        {authStatus === 'authenticated' && (
          <div className="text-emerald-600 font-medium">🔐 JWT Ativo</div>
        )}
        {authStatus === 'mock' && (
          <div className="text-amber-600 font-medium">🎭 Modo Mock</div>
        )}
        {!isConnected && (
          <div className="text-red-600 font-medium">
            {isLocalBackend ? '⚠️ Backend local offline' : '⚠️ Usando dados locais'}
          </div>
        )}
        {!isConnected && errorMessage && (
          <div className="text-red-500 text-xs mt-1 break-words">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;