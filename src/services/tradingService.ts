import { TradingAccount, Position, Order, MarketData, BrokerConnection } from '@/types/trading';

class TradingService {
  private connections: Map<string, WebSocket> = new Map();
  private accounts: Map<string, TradingAccount> = new Map();
  private positions: Map<string, Position[]> = new Map();
  private orders: Map<string, Order[]> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  // Connection Management
  async connectAccount(connection: BrokerConnection, credentials: any): Promise<TradingAccount> {
    try {
      let account: TradingAccount;
      
      switch (connection.type) {
        case 'MT4':
        case 'MT5':
          account = await this.connectMT(connection, credentials);
          break;
        case 'API':
          account = await this.connectAPI(connection, credentials);
          break;
        default:
          throw new Error('Unsupported platform');
      }

      this.accounts.set(account.id, account);
      this.startDataStream(account.id, connection);
      
      return account;
    } catch (error) {
      console.error('Failed to connect account:', error);
      throw error;
    }
  }

  private async connectMT(connection: BrokerConnection, credentials: any): Promise<TradingAccount> {
    // MT4/MT5 connection logic
    const ws = new WebSocket(`ws://${connection.host}:${connection.port || 8080}`);
    
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        // Send authentication
        ws.send(JSON.stringify({
          action: 'authenticate',
          login: credentials.login,
          password: credentials.password,
          server: credentials.server
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'account_info') {
          const account: TradingAccount = {
            id: `${connection.id}_${credentials.login}`,
            name: `${connection.name} - ${credentials.login}`,
            broker: connection.name,
            accountNumber: credentials.login,
            accountType: data.account.demo ? 'demo' : 'live',
            platform: connection.type,
            balance: data.account.balance,
            equity: data.account.equity,
            margin: data.account.margin,
            freeMargin: data.account.free_margin,
            marginLevel: data.account.margin_level,
            profit: data.account.profit,
            currency: data.account.currency,
            leverage: data.account.leverage,
            connected: true,
            lastUpdate: new Date(),
            server: credentials.server,
            login: credentials.login
          };
          
          this.connections.set(account.id, ws);
          resolve(account);
        } else if (data.type === 'error') {
          reject(new Error(data.message));
        }
      };

      ws.onerror = (error) => reject(error);
      
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
  }

  private async connectAPI(connection: BrokerConnection, credentials: any): Promise<TradingAccount> {
    // REST API connection for brokers like OANDA, Interactive Brokers, etc.
    const response = await fetch(`${connection.host}/api/account`, {
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to connect to broker API');
    }

    const accountData = await response.json();
    
    const account: TradingAccount = {
      id: `${connection.id}_${accountData.id}`,
      name: `${connection.name} - ${accountData.id}`,
      broker: connection.name,
      accountNumber: accountData.id,
      accountType: accountData.type,
      platform: 'Custom',
      balance: accountData.balance,
      equity: accountData.equity || accountData.balance,
      margin: accountData.margin || 0,
      freeMargin: accountData.available || accountData.balance,
      marginLevel: accountData.margin_level || 0,
      profit: accountData.unrealized_pl || 0,
      currency: accountData.currency,
      leverage: accountData.leverage || 1,
      connected: true,
      lastUpdate: new Date()
    };

    return account;
  }

  private startDataStream(accountId: string, connection: BrokerConnection) {
    const ws = this.connections.get(accountId);
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleStreamData(accountId, data);
    };

    // Request real-time updates
    ws.send(JSON.stringify({
      action: 'subscribe',
      types: ['account', 'positions', 'orders', 'prices']
    }));
  }

  private handleStreamData(accountId: string, data: any) {
    switch (data.type) {
      case 'account_update':
        this.updateAccount(accountId, data.account);
        break;
      case 'position_update':
        this.updatePositions(accountId, data.positions);
        break;
      case 'order_update':
        this.updateOrders(accountId, data.orders);
        break;
      case 'price_update':
        this.updateMarketData(data.prices);
        break;
    }
  }

  private updateAccount(accountId: string, accountData: any) {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance = accountData.balance;
      account.equity = accountData.equity;
      account.margin = accountData.margin;
      account.freeMargin = accountData.free_margin;
      account.marginLevel = accountData.margin_level;
      account.profit = accountData.profit;
      account.lastUpdate = new Date();
      
      this.accounts.set(accountId, account);
      this.notifyCallbacks('account_update', { accountId, account });
    }
  }

  private updatePositions(accountId: string, positionsData: any[]) {
    const positions: Position[] = positionsData.map(pos => ({
      id: pos.ticket.toString(),
      symbol: pos.symbol,
      type: pos.type === 0 ? 'buy' : 'sell',
      volume: pos.volume,
      openPrice: pos.open_price,
      currentPrice: pos.current_price,
      stopLoss: pos.sl || undefined,
      takeProfit: pos.tp || undefined,
      profit: pos.profit,
      swap: pos.swap,
      commission: pos.commission,
      openTime: new Date(pos.open_time * 1000),
      comment: pos.comment
    }));

    this.positions.set(accountId, positions);
    this.notifyCallbacks('positions_update', { accountId, positions });
  }

  private updateOrders(accountId: string, ordersData: any[]) {
    const orders: Order[] = ordersData.map(order => ({
      id: order.ticket.toString(),
      symbol: order.symbol,
      type: this.mapOrderType(order.type),
      volume: order.volume,
      price: order.price,
      stopLoss: order.sl || undefined,
      takeProfit: order.tp || undefined,
      expiration: order.expiration ? new Date(order.expiration * 1000) : undefined,
      comment: order.comment,
      status: 'pending'
    }));

    this.orders.set(accountId, orders);
    this.notifyCallbacks('orders_update', { accountId, orders });
  }

  private updateMarketData(pricesData: any[]) {
    pricesData.forEach(price => {
      const marketData: MarketData = {
        symbol: price.symbol,
        bid: price.bid,
        ask: price.ask,
        spread: price.ask - price.bid,
        digits: price.digits,
        point: price.point,
        timestamp: new Date()
      };
      
      this.marketData.set(price.symbol, marketData);
    });
    
    this.notifyCallbacks('market_data_update', { prices: pricesData });
  }

  private mapOrderType(type: number): Order['type'] {
    switch (type) {
      case 2: return 'buy_limit';
      case 3: return 'sell_limit';
      case 4: return 'buy_stop';
      case 5: return 'sell_stop';
      default: return 'buy_limit';
    }
  }

  // Trading Operations
  async placeTrade(accountId: string, trade: {
    symbol: string;
    type: 'buy' | 'sell';
    volume: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    comment?: string;
  }): Promise<string> {
    const ws = this.connections.get(accountId);
    if (!ws) throw new Error('Account not connected');

    return new Promise((resolve, reject) => {
      const orderId = Date.now().toString();
      
      ws.send(JSON.stringify({
        action: 'place_order',
        order_id: orderId,
        symbol: trade.symbol,
        type: trade.type === 'buy' ? 0 : 1,
        volume: trade.volume,
        price: trade.price,
        sl: trade.stopLoss,
        tp: trade.takeProfit,
        comment: trade.comment || 'PO3 Framework Trade'
      }));

      const timeout = setTimeout(() => {
        reject(new Error('Order timeout'));
      }, 10000);

      const handler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'order_result' && data.order_id === orderId) {
          clearTimeout(timeout);
          ws.removeEventListener('message', handler);
          
          if (data.success) {
            resolve(data.ticket);
          } else {
            reject(new Error(data.error));
          }
        }
      };

      ws.addEventListener('message', handler);
    });
  }

  async closePosition(accountId: string, positionId: string): Promise<boolean> {
    const ws = this.connections.get(accountId);
    if (!ws) throw new Error('Account not connected');

    return new Promise((resolve, reject) => {
      ws.send(JSON.stringify({
        action: 'close_position',
        ticket: positionId
      }));

      const timeout = setTimeout(() => {
        reject(new Error('Close position timeout'));
      }, 10000);

      const handler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'close_result' && data.ticket === positionId) {
          clearTimeout(timeout);
          ws.removeEventListener('message', handler);
          resolve(data.success);
        }
      };

      ws.addEventListener('message', handler);
    });
  }

  // Data Access
  getAccount(accountId: string): TradingAccount | undefined {
    return this.accounts.get(accountId);
  }

  getAccounts(): TradingAccount[] {
    return Array.from(this.accounts.values());
  }

  getPositions(accountId: string): Position[] {
    return this.positions.get(accountId) || [];
  }

  getOrders(accountId: string): Order[] {
    return this.orders.get(accountId) || [];
  }

  getMarketData(symbol: string): MarketData | undefined {
    return this.marketData.get(symbol);
  }

  // Event Handling
  subscribe(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyCallbacks(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Cleanup
  disconnect(accountId: string) {
    const ws = this.connections.get(accountId);
    if (ws) {
      ws.close();
      this.connections.delete(accountId);
    }
    
    this.accounts.delete(accountId);
    this.positions.delete(accountId);
    this.orders.delete(accountId);
  }

  disconnectAll() {
    this.connections.forEach((ws, accountId) => {
      this.disconnect(accountId);
    });
  }
}

export const tradingService = new TradingService();