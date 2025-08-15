import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Wallet, Target, Shield, BarChart3 } from "lucide-react";
import { tradingService } from "@/services/tradingService";
import { useEffect, useState } from "react";

interface AccountData {
  balance: number;
  equity: number;
  dailyPL: number;
  totalPL: number;
  drawdown: number;
  phase: "evaluation" | "funded";
  profitTarget: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  tradesCount: number;
  winRate: number;
  avgR: number;
  lastUpdated: Date;
}

interface AccountMetricsProps {
  data: AccountData;
}

export const AccountMetrics = ({ data }: AccountMetricsProps) => {
  const [liveAccounts, setLiveAccounts] = useState(tradingService.getAccounts());
  const [selectedLiveAccount, setSelectedLiveAccount] = useState<string>("");

  useEffect(() => {
    const accounts = tradingService.getAccounts();
    setLiveAccounts(accounts);
    
    if (accounts.length > 0 && !selectedLiveAccount) {
      setSelectedLiveAccount(accounts[0].id);
    }

    const handleAccountUpdate = ({ accountId, account }: any) => {
      setLiveAccounts(prev => prev.map(acc => acc.id === accountId ? account : acc));
    };

    tradingService.subscribe('account_update', handleAccountUpdate);
    
    return () => {
      tradingService.unsubscribe('account_update', handleAccountUpdate);
    };
  }, [selectedLiveAccount]);

  // Use live account data if available, otherwise use mock data
  const currentAccount = liveAccounts.find(acc => acc.id === selectedLiveAccount);
  const displayData = currentAccount ? {
    balance: currentAccount.balance,
    equity: currentAccount.equity,
    dailyPL: currentAccount.profit,
    totalPL: currentAccount.profit,
    drawdown: data.drawdown, // Keep mock drawdown calculation for now
    phase: data.phase,
    profitTarget: data.profitTarget,
    maxDrawdown: data.maxDrawdown,
    dailyDrawdown: data.dailyDrawdown,
    tradesCount: data.tradesCount,
    winRate: data.winRate,
    avgR: data.avgR,
    lastUpdated: currentAccount.lastUpdate
  } : data;

  const profitProgress = (data.totalPL / data.profitTarget) * 100;
  const drawdownProgress = (data.drawdown / 10) * 100; // 10% max drawdown

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Live Account Indicator */}
      {currentAccount && (
        <div className="col-span-full mb-2">
          <Badge variant="default" className="bg-success text-success-foreground">
            🔴 LIVE: {currentAccount.name} ({currentAccount.broker})
          </Badge>
        </div>
      )}
      
      {/* Account Balance */}
      <Card className="bg-gradient-card shadow-card-custom hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Wallet className="w-4 h-4 mr-2 text-primary" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">${displayData.balance.toLocaleString()}</div>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">Equity: </span>
            <span className="text-sm font-medium ml-1">${displayData.equity.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {displayData.phase === "evaluation" ? "Evaluation Account" : "Funded Account"}
            {currentAccount && <span className="ml-2 text-success">• LIVE DATA</span>}
          </div>
        </CardContent>
      </Card>

      {/* Daily P&L */}
      <Card className={`bg-gradient-card shadow-card-custom hover:shadow-glow transition-all duration-300 border-l-4 ${displayData.dailyPL >= 0 ? 'border-l-success' : 'border-l-destructive'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            {displayData.dailyPL >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-2 text-profit" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-2 text-loss" />
            )}
            Daily P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl md:text-3xl font-bold ${displayData.dailyPL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {displayData.dailyPL >= 0 ? '+' : ''}${displayData.dailyPL}
          </div>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">Total: </span>
            <span className={`text-sm font-medium ml-1 ${displayData.totalPL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {displayData.totalPL >= 0 ? '+' : ''}${displayData.totalPL}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {displayData.tradesCount} trades • {displayData.winRate}% win rate
          </div>
        </CardContent>
      </Card>

      {/* Profit Target */}
      <Card className="bg-gradient-card shadow-card-custom hover:shadow-glow transition-all duration-300 border-l-4 border-l-warning">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            <Target className="w-4 h-4 mr-2 text-warning inline" />
            Profit Target ({displayData.phase === "evaluation" ? "10%" : "5%"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-warning">${displayData.profitTarget}</div>
          <Progress value={profitProgress} className="mt-2 h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${displayData.totalPL}</span>
            <span>{profitProgress.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card className="bg-gradient-card shadow-card-custom hover:shadow-glow transition-all duration-300 border-l-4 border-l-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Shield className="w-4 h-4 mr-2 text-destructive" />
            Drawdown Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{displayData.drawdown}%</div>
          <Progress value={drawdownProgress} className="mt-2 h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Safe: &lt;5%</span>
            <span>Limit: 10%</span>
          </div>
          {displayData.drawdown > 5 && (
            <Badge variant="destructive" className="mt-2 text-xs animate-pulse">
              Warning: High Drawdown
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};