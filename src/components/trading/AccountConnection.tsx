import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Wifi, WifiOff, Plus, Settings, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tradingService } from "@/services/tradingService";
import { TradingAccount, BrokerConnection } from "@/types/trading";

export const AccountConnection = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionForm, setConnectionForm] = useState({
    broker: '',
    platform: 'MT4' as 'MT4' | 'MT5' | 'cTrader' | 'API',
    host: '',
    port: '',
    login: '',
    password: '',
    server: '',
    apiKey: '',
    apiSecret: '',
    accountName: ''
  });

  const brokerPresets = [
    { name: 'IC Markets', host: 'icmarkets-demo.com', port: '443', platform: 'MT4' },
    { name: 'Pepperstone', host: 'pepperstone-demo.com', port: '443', platform: 'MT5' },
    { name: 'XM', host: 'xm-demo.com', port: '443', platform: 'MT4' },
    { name: 'FTMO', host: 'ftmo-server.com', port: '443', platform: 'MT4' },
    { name: 'MyFundedFX', host: 'myfundedfx-server.com', port: '443', platform: 'MT5' },
    { name: 'OANDA', host: 'api-fxpractice.oanda.com', port: '443', platform: 'API' },
    { name: 'Interactive Brokers', host: 'api.ibkr.com', port: '443', platform: 'API' },
    { name: 'Custom', host: '', port: '', platform: 'MT4' }
  ];

  useEffect(() => {
    // Subscribe to account updates
    const handleAccountUpdate = ({ accountId, account }: { accountId: string, account: TradingAccount }) => {
      setAccounts(prev => prev.map(acc => acc.id === accountId ? account : acc));
    };

    tradingService.subscribe('account_update', handleAccountUpdate);
    
    return () => {
      tradingService.unsubscribe('account_update', handleAccountUpdate);
    };
  }, []);

  const handleBrokerSelect = (brokerName: string) => {
    const preset = brokerPresets.find(b => b.name === brokerName);
    if (preset) {
      setConnectionForm(prev => ({
        ...prev,
        broker: preset.name,
        host: preset.host,
        port: preset.port,
        platform: preset.platform as any
      }));
    }
  };

  const handleConnect = async () => {
    if (!connectionForm.broker || !connectionForm.host || !connectionForm.login) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const connection: BrokerConnection = {
        id: `${connectionForm.broker.toLowerCase()}_${Date.now()}`,
        name: connectionForm.broker,
        type: connectionForm.platform === 'API' ? 'API' : connectionForm.platform,
        host: connectionForm.host,
        port: connectionForm.port ? parseInt(connectionForm.port) : undefined,
        apiKey: connectionForm.apiKey,
        apiSecret: connectionForm.apiSecret,
        connected: false
      };

      const credentials = {
        login: connectionForm.login,
        password: connectionForm.password,
        server: connectionForm.server,
        apiKey: connectionForm.apiKey,
        apiSecret: connectionForm.apiSecret
      };

      const account = await tradingService.connectAccount(connection, credentials);
      
      if (connectionForm.accountName) {
        account.name = connectionForm.accountName;
      }

      setAccounts(prev => [...prev, account]);
      
      // Reset form
      setConnectionForm({
        broker: '',
        platform: 'MT4',
        host: '',
        port: '',
        login: '',
        password: '',
        server: '',
        apiKey: '',
        apiSecret: '',
        accountName: ''
      });

      toast({
        title: "Account Connected",
        description: `Successfully connected to ${account.name}`,
      });

    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect account",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (accountId: string) => {
    tradingService.disconnect(accountId);
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    
    toast({
      title: "Account Disconnected",
      description: "Trading account has been disconnected",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card shadow-card-custom border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-primary" />
              <span>Live Trading Accounts</span>
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Connect Trading Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Broker Selection */}
                  <div className="space-y-4">
                    <Label>Select Broker</Label>
                    <Select value={connectionForm.broker} onValueChange={handleBrokerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokerPresets.map(broker => (
                          <SelectItem key={broker.name} value={broker.name}>
                            {broker.name} ({broker.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Connection Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Platform</Label>
                      <Select value={connectionForm.platform} onValueChange={(value: any) => 
                        setConnectionForm(prev => ({ ...prev, platform: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MT4">MetaTrader 4</SelectItem>
                          <SelectItem value="MT5">MetaTrader 5</SelectItem>
                          <SelectItem value="cTrader">cTrader</SelectItem>
                          <SelectItem value="API">REST API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Account Name (Optional)</Label>
                      <Input
                        value={connectionForm.accountName}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, accountName: e.target.value }))}
                        placeholder="My Trading Account"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Server/Host</Label>
                      <Input
                        value={connectionForm.host}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="server.broker.com"
                      />
                    </div>
                    <div>
                      <Label>Port</Label>
                      <Input
                        value={connectionForm.port}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="443"
                      />
                    </div>
                  </div>

                  {connectionForm.platform !== 'API' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Login</Label>
                          <Input
                            value={connectionForm.login}
                            onChange={(e) => setConnectionForm(prev => ({ ...prev, login: e.target.value }))}
                            placeholder="Account number"
                          />
                        </div>
                        <div>
                          <Label>Server</Label>
                          <Input
                            value={connectionForm.server}
                            onChange={(e) => setConnectionForm(prev => ({ ...prev, server: e.target.value }))}
                            placeholder="Demo-Server"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={connectionForm.password}
                            onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Trading password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>API Key</Label>
                        <Input
                          value={connectionForm.apiKey}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="Your API key"
                        />
                      </div>
                      <div>
                        <Label>API Secret</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={connectionForm.apiSecret}
                            onChange={(e) => setConnectionForm(prev => ({ ...prev, apiSecret: e.target.value }))}
                            placeholder="Your API secret"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your credentials are encrypted and stored locally. Never share your trading credentials with anyone.
                      For maximum security, use demo accounts or create separate API keys with limited permissions.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? "Connecting..." : "Connect Account"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="bg-gradient-card shadow-card-custom">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {account.connected ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {account.broker} • {account.platform} • #{account.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={account.accountType === 'demo' ? 'secondary' : 'default'}>
                    {account.accountType.toUpperCase()}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <div className={`text-2xl font-bold ${account.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(account.equity, account.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">Equity</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">P&L:</span>
                  <div className={`font-medium ${account.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(account.profit, account.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Margin:</span>
                  <div className="font-medium">
                    {formatCurrency(account.margin, account.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Free:</span>
                  <div className="font-medium">
                    {formatCurrency(account.freeMargin, account.currency)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Leverage: 1:{account.leverage} • Last Update: {account.lastUpdate.toLocaleTimeString()}
                </span>
                <Badge variant={account.connected ? "default" : "destructive"} className="text-xs">
                  {account.connected ? "LIVE" : "DISCONNECTED"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="bg-gradient-card shadow-card-custom">
          <CardContent className="text-center py-12">
            <WifiOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Trading Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your MT4/MT5 or broker API to start live trading with the PO3 framework
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                {/* Same dialog content as above */}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};