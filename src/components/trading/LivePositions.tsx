import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, X, Edit, Plus, AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tradingService } from "@/services/tradingService";
import { Position, TradingAccount, MarketData } from "@/types/trading";

export const LivePositions = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map());
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);
  
  const [newTrade, setNewTrade] = useState({
    symbol: "XAUUSD",
    type: "buy" as "buy" | "sell",
    volume: "0.01",
    stopLoss: "",
    takeProfit: "",
    comment: "PO3 Framework Trade"
  });

  useEffect(() => {
    // Load accounts
    const loadedAccounts = tradingService.getAccounts();
    setAccounts(loadedAccounts);
    
    if (loadedAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(loadedAccounts[0].id);
    }

    // Subscribe to updates
    const handlePositionsUpdate = ({ accountId, positions: updatedPositions }: { accountId: string, positions: Position[] }) => {
      if (accountId === selectedAccount) {
        setPositions(updatedPositions);
      }
    };

    const handleMarketDataUpdate = ({ prices }: { prices: any[] }) => {
      const newMarketData = new Map(marketData);
      prices.forEach(price => {
        newMarketData.set(price.symbol, {
          symbol: price.symbol,
          bid: price.bid,
          ask: price.ask,
          spread: price.ask - price.bid,
          digits: price.digits,
          point: price.point,
          timestamp: new Date()
        });
      });
      setMarketData(newMarketData);
    };

    tradingService.subscribe('positions_update', handlePositionsUpdate);
    tradingService.subscribe('market_data_update', handleMarketDataUpdate);

    return () => {
      tradingService.unsubscribe('positions_update', handlePositionsUpdate);
      tradingService.unsubscribe('market_data_update', handleMarketDataUpdate);
    };
  }, [selectedAccount, marketData]);

  useEffect(() => {
    if (selectedAccount) {
      const accountPositions = tradingService.getPositions(selectedAccount);
      setPositions(accountPositions);
    }
  }, [selectedAccount]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    const accountPositions = tradingService.getPositions(accountId);
    setPositions(accountPositions);
  };

  const handlePlaceTrade = async () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a trading account first",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingTrade(true);
    
    try {
      const trade = {
        symbol: newTrade.symbol,
        type: newTrade.type,
        volume: parseFloat(newTrade.volume),
        stopLoss: newTrade.stopLoss ? parseFloat(newTrade.stopLoss) : undefined,
        takeProfit: newTrade.takeProfit ? parseFloat(newTrade.takeProfit) : undefined,
        comment: newTrade.comment
      };

      const orderId = await tradingService.placeTrade(selectedAccount, trade);
      
      toast({
        title: "Trade Placed",
        description: `${newTrade.type.toUpperCase()} ${newTrade.volume} ${newTrade.symbol} - Order #${orderId}`,
      });

      // Reset form
      setNewTrade({
        symbol: "XAUUSD",
        type: "buy",
        volume: "0.01",
        stopLoss: "",
        takeProfit: "",
        comment: "PO3 Framework Trade"
      });

    } catch (error) {
      console.error('Failed to place trade:', error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Failed to place trade",
        variant: "destructive"
      });
    } finally {
      setIsPlacingTrade(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    if (!selectedAccount) return;

    try {
      const success = await tradingService.closePosition(selectedAccount, positionId);
      
      if (success) {
        toast({
          title: "Position Closed",
          description: `Position #${positionId} has been closed`,
        });
      } else {
        throw new Error("Failed to close position");
      }
    } catch (error) {
      console.error('Failed to close position:', error);
      toast({
        title: "Close Failed",
        description: error instanceof Error ? error.message : "Failed to close position",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCurrentPrice = (symbol: string, type: 'buy' | 'sell') => {
    const data = marketData.get(symbol);
    if (!data) return 0;
    return type === 'buy' ? data.ask : data.bid;
  };

  const calculateUnrealizedPL = (position: Position) => {
    const currentPrice = getCurrentPrice(position.symbol, position.type === 'buy' ? 'sell' : 'buy');
    if (currentPrice === 0) return position.profit;
    
    const priceDiff = position.type === 'buy' 
      ? currentPrice - position.openPrice 
      : position.openPrice - currentPrice;
    
    // Simplified calculation - in reality this would depend on contract size, pip value, etc.
    return priceDiff * position.volume * 100;
  };

  const totalPL = positions.reduce((sum, pos) => sum + calculateUnrealizedPL(pos), 0);

  if (accounts.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card-custom">
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Trading Accounts Connected</h3>
          <p className="text-muted-foreground">
            Connect a trading account to view and manage live positions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card shadow-card-custom border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Live Positions</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedAccount} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.broker})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Place New Trade</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Symbol</Label>
                        <Select value={newTrade.symbol} onValueChange={(value) => 
                          setNewTrade(prev => ({ ...prev, symbol: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XAUUSD">Gold (XAUUSD)</SelectItem>
                            <SelectItem value="US30">Dow Jones (US30)</SelectItem>
                            <SelectItem value="NAS100">Nasdaq (NAS100)</SelectItem>
                            <SelectItem value="SPX500">S&P 500 (SPX500)</SelectItem>
                            <SelectItem value="EURUSD">EUR/USD</SelectItem>
                            <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Direction</Label>
                        <Select value={newTrade.type} onValueChange={(value: "buy" | "sell") => 
                          setNewTrade(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy (Long)</SelectItem>
                            <SelectItem value="sell">Sell (Short)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Volume (Lots)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newTrade.volume}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, volume: e.target.value }))}
                        placeholder="0.01"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stop Loss (Optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newTrade.stopLoss}
                          onChange={(e) => setNewTrade(prev => ({ ...prev, stopLoss: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Take Profit (Optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newTrade.takeProfit}
                          onChange={(e) => setNewTrade(prev => ({ ...prev, takeProfit: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Comment</Label>
                      <Input
                        value={newTrade.comment}
                        onChange={(e) => setNewTrade(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Trade comment"
                      />
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Ensure all PO3 framework confirmations are complete before placing this trade.
                        This will execute immediately at market price.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handlePlaceTrade} 
                      disabled={isPlacingTrade}
                      className="w-full"
                    >
                      {isPlacingTrade ? "Placing Trade..." : `Place ${newTrade.type.toUpperCase()} Order`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        {selectedAccount && (
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{positions.length}</div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
              </div>
              <div>
                <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalPL)}
                </div>
                <p className="text-sm text-muted-foreground">Unrealized P&L</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {positions.filter(p => p.type === 'buy').length}
                </div>
                <p className="text-sm text-muted-foreground">Long Positions</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {positions.filter(p => p.type === 'sell').length}
                </div>
                <p className="text-sm text-muted-foreground">Short Positions</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Positions Table */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Open Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>S/L</TableHead>
                  <TableHead>T/P</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const unrealizedPL = calculateUnrealizedPL(position);
                  const currentPrice = getCurrentPrice(position.symbol, position.type === 'buy' ? 'sell' : 'buy');
                  
                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={position.type === 'buy' ? 'default' : 'secondary'}>
                          {position.type === 'buy' ? (
                            <><TrendingUp className="w-3 h-3 mr-1" />BUY</>
                          ) : (
                            <><TrendingDown className="w-3 h-3 mr-1" />SELL</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{position.volume}</TableCell>
                      <TableCell>{position.openPrice.toFixed(5)}</TableCell>
                      <TableCell>{currentPrice.toFixed(5)}</TableCell>
                      <TableCell>{position.stopLoss?.toFixed(5) || '-'}</TableCell>
                      <TableCell>{position.takeProfit?.toFixed(5) || '-'}</TableCell>
                      <TableCell>
                        <span className={unrealizedPL >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(unrealizedPL)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClosePosition(position.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Open Positions</h3>
              <p className="text-muted-foreground">
                Your open positions will appear here when you have active trades
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};