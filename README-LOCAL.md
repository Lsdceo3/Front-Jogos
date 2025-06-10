# Como Rodar o Frontend Localmente

## Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Git** (opcional, para clonar o repositório)

## Passos para Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se não existir):

```bash
# Para desenvolvimento local com backend Spring Boot
VITE_API_BASE_URL=http://localhost:8080/api

# Para usar o backend Azure em produção
# VITE_API_BASE_URL=https://jogos-inventario.azurewebsites.net/api
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

## Configurações de Backend

### Opção 1: Backend Local (Spring Boot)

Se você tem o backend Spring Boot rodando localmente:

1. Certifique-se que o backend está rodando na porta **8080**
2. Configure CORS no backend para aceitar requisições de `http://localhost:5173`
3. Use a URL: `http://localhost:8080/api`

### Opção 2: Backend Azure (Produção)

Para usar o backend em produção na Azure:

1. Descomente a linha no `.env`:
   ```
   VITE_API_BASE_URL=https://jogos-inventario.azurewebsites.net/api
   ```
2. Comente a linha do localhost

### Opção 3: Modo Offline (Dados Mock)

O sistema automaticamente usa dados mock se não conseguir conectar ao backend.

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## Funcionalidades

- ✅ **Autenticação JWT** (com fallback para dados mock)
- ✅ **Gerenciamento de Jogos** (CRUD completo)
- ✅ **Controle de Inventário** (estoque e movimentações)
- ✅ **Relatórios e Dashboard** (métricas em tempo real)
- ✅ **Interface Responsiva** (mobile-first)
- ✅ **Indicador de Conexão** (status do backend em tempo real)

## Contas de Teste

### Administrador
- **Email:** admin@example.com
- **Senha:** qualquer senha

### Usuário
- **Email:** user@example.com  
- **Senha:** qualquer senha

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── contexts/           # Context API (Auth)
├── hooks/              # Custom hooks
├── config/             # Configurações (API)
├── types/              # TypeScript types
└── main.tsx           # Entry point
```

## Troubleshooting

### Erro de CORS
Se você ver erros de CORS, configure o backend para aceitar requisições de `http://localhost:5173`.

### Backend Offline
O sistema automaticamente detecta se o backend está offline e usa dados mock para demonstração.

### Porta em Uso
Se a porta 5173 estiver em uso, o Vite automaticamente tentará a próxima porta disponível.

## Deploy

### Netlify/Vercel
1. Faça build: `npm run build`
2. Deploy da pasta `dist/`
3. Configure a variável de ambiente `VITE_API_BASE_URL`

### Azure Static Web Apps
1. Conecte seu repositório
2. Configure build command: `npm run build`
3. Output directory: `dist`