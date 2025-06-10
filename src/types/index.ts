// DTO Jogo do backend (baseado no JogoDTO do Spring Boot)
export interface Game {
  id: number;
  titulo: string;
  descricao: string;
  precoSugerido: number;
  genero: string;
  desenvolvedora: string;
  publicadora: string;
  urlImagemCapa: string;
}

// DTO de Estoque do backend (baseado no ItemEstoque)
export interface InventoryItem {
  id: number;
  jogoId: number;
  jogoTitulo: string;
  plataformaId: number;
  plataformaNome: string;
  depositoId: number;
  depositoNome: string;
  quantidade: number;
  precoUnitarioAtual: number;
}

// DTO de Movimentação do backend (baseado no MovimentacaoRequestDTO)
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export interface StockMovement {
  id?: number;
  tipo: TipoMovimentacao;
  jogoId: number;
  plataformaId?: number;
  depositoOrigemId?: number;
  depositoDestinoId?: number;
  quantidade: number;
  precoUnitarioMomento?: number;
  observacao?: string;
  dataHora?: string;
}

// DTOs para autenticação (baseados no backend)
export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  expiresIn: number;
  username: string;
}

export interface RegistroUsuarioRequest {
  username: string;
  password: string;
  email?: string;
}