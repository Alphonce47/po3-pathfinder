export interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  accountType: 'demo' | 'live';
  platform: 'MT4' | 'MT5' | 'cTrader' | 'TradingView' | 'Custom';
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  currency: string;
  leverage: number;
  connected: boolean;
  lastUpdate: Date;
  server?: string;
  login?: string;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: Date;
  comment?: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  volume: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: Date;
  comment?: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  timestamp: Date;
}

export interface BrokerConnection {
  id: string;
  name: string;
  type: 'MT4' | 'MT5' | 'API';
  host: string;
  port?: number;
  apiKey?: string;
  apiSecret?: string;
  connected: boolean;
  lastPing?: Date;
}