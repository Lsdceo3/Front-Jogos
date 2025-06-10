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

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Tenta fazer uma requisição simples para verificar se o backend está respondendo
      console.log('🔍 Testando conexão com Azure...');
      await api.get('/jogos');
      setIsConnected(true);
      setLastCheck(new Date());
      
      // Verificar se está usando token real ou mock
      const token = localStorage.getItem('accessToken');
      if (token && !token.startsWith('mock_token_')) {
        setAuthStatus('authenticated');
        console.log('✅ Backend Azure conectado com autenticação JWT!');
      } else if (token && token.startsWith('mock_token_')) {
        setAuthStatus('mock');
        console.log('✅ Backend Azure conectado com dados mock!');
      } else {
        setAuthStatus('none');
        console.log('✅ Backend Azure conectado sem autenticação!');
      }
    } catch (error: any) {
      setIsConnected(false);
      setLastCheck(new Date());
      setAuthStatus('mock');
      console.log('❌ Backend Azure não está respondendo:', error.message);
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
    if (isChecking) return 'Verificando Azure...';
    if (!isConnected) return 'Azure Offline';
    if (authStatus === 'authenticated') return 'Azure Online (JWT)';
    if (authStatus === 'mock') return 'Azure Online (Mock)';
    return 'Azure Online';
  };

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    if (authStatus === 'authenticated') return <Shield className="w-4 h-4" />;
    if (authStatus === 'mock') return <ShieldOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

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
      <div className="mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow text-center">
        <div className="font-mono">jogos-inventario.azurewebsites.net</div>
        {authStatus === 'authenticated' && (
          <div className="text-emerald-600 font-medium">🔐 JWT Ativo</div>
        )}
        {authStatus === 'mock' && (
          <div className="text-amber-600 font-medium">🎭 Modo Mock</div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;