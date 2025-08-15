import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, BarChart3, Trophy, Calendar, Settings, Bell, RefreshCw } from "lucide-react";
import { AccountMetrics } from "@/components/trading/AccountMetrics";
import { TradeLogger } from "@/components/trading/TradeLogger";
import { RiskCalculator } from "@/components/trading/RiskCalculator";
import { RuleMonitor } from "@/components/trading/RuleMonitor";
import { PerformanceChart } from "@/components/trading/PerformanceChart";
import { MarketOverview } from "@/components/trading/MarketOverview";
import { TradingJournal } from "@/components/trading/TradingJournal";
import { StrategyChecklist } from "@/components/trading/StrategyChecklist";
import { AccountConnection } from "@/components/trading/AccountConnection";
import { LivePositions } from "@/components/trading/LivePositions";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [accountData, setAccountData] = useState({
    balance: 5000,
    equity: 5125,
    dailyPL: 45.50,
    totalPL: 125,
    drawdown: 1.2,
    phase: "evaluation" as "evaluation" | "funded",
    profitTarget: 500,
    maxDrawdown: 500,
    dailyDrawdown: 250,
    tradesCount: 12,
    winRate: 66.7,
    avgR: 1.8,
    lastUpdated: new Date()
  });

  const [todayStats, setTodayStats] = useState({
    tradesLeft: 2, // max 3 per day in evaluation
    profitTarget: 75,
    currentProfit: 45.50,
    stopLoss: -75,
    canTrade: true,
    sessionActive: true
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAccountData(prev => ({ ...prev, lastUpdated: new Date() }));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Account data has been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FundingPips Pro
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">PO3-Informed Institutional Model v2.1</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {accountData.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Badge variant={accountData.phase === "evaluation" ? "secondary" : "default"} className="px-4 py-2">
            {accountData.phase === "evaluation" ? "EVALUATION PHASE" : "FUNDED TRADER"}
          </Badge>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Calendar className="w-4 h-4 mr-2" />
            Today's Plan
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <AccountMetrics data={accountData} />

      {/* Today's Trading Status */}
      <Card className="bg-gradient-card shadow-card-custom border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Today's Status</span>
            <Badge variant={todayStats.sessionActive ? "default" : "secondary"} className="ml-auto">
              {todayStats.sessionActive ? "Session Active" : "Session Closed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${todayStats.currentProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
              {todayStats.currentProfit >= 0 ? '+' : ''}${todayStats.currentProfit}
            </div>
            <p className="text-sm text-muted-foreground">Daily P&L</p>
            <Progress 
              value={Math.min((Math.abs(todayStats.currentProfit) / todayStats.profitTarget) * 100, 100)} 
              className="mt-2" 
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{todayStats.tradesLeft}</div>
            <p className="text-sm text-muted-foreground">Trades Left</p>
            <p className="text-xs text-muted-foreground mt-1">Max 3/day in evaluation</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">${todayStats.profitTarget}</div>
            <p className="text-sm text-muted-foreground">Daily Target</p>
            <p className="text-xs text-muted-foreground mt-1">Stop at +$75 (2R)</p>
          </div>
          <div className="text-center">
            <Badge 
              variant={todayStats.canTrade ? "default" : "destructive"} 
              className="text-sm md:text-lg px-3 md:px-4 py-2"
            >
              {todayStats.canTrade ? "CAN TRADE" : "STOP TRADING"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {todayStats.canTrade ? "All systems green" : "Daily limit reached"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-9 h-auto">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="logger">Trade Logger</TabsTrigger>
          <TabsTrigger value="calculator">Risk Calc</TabsTrigger>
          <TabsTrigger value="rules">Rule Monitor</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6">
          <StrategyChecklist />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <AccountConnection />
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <LivePositions />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart />
            <RuleMonitor />
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="logger" className="space-y-6">
          <TradeLogger />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <RiskCalculator accountBalance={accountData.balance} phase={accountData.phase} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <RuleMonitor expanded={true} />
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <TradingJournal />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;