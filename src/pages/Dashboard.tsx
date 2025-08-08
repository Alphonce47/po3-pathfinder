import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, BarChart3, Trophy, Calendar } from "lucide-react";
import { AccountMetrics } from "@/components/trading/AccountMetrics";
import { TradeLogger } from "@/components/trading/TradeLogger";
import { RiskCalculator } from "@/components/trading/RiskCalculator";
import { RuleMonitor } from "@/components/trading/RuleMonitor";
import { PerformanceChart } from "@/components/trading/PerformanceChart";

const Dashboard = () => {
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
    avgR: 1.8
  });

  const [todayStats, setTodayStats] = useState({
    tradesLeft: 2, // max 3 per day in evaluation
    profitTarget: 75,
    currentProfit: 45.50,
    stopLoss: -75,
    canTrade: true
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FundingPips Pro
          </h1>
          <p className="text-muted-foreground">PO3-Informed Institutional Model v2</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={accountData.phase === "evaluation" ? "secondary" : "default"} className="px-4 py-2">
            {accountData.phase === "evaluation" ? "EVALUATION PHASE" : "FUNDED TRADER"}
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Today's Plan
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <AccountMetrics data={accountData} />

      {/* Today's Trading Status */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Today's Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-profit">+${todayStats.currentProfit}</div>
            <p className="text-sm text-muted-foreground">Daily P&L</p>
            <Progress value={(todayStats.currentProfit / todayStats.profitTarget) * 100} className="mt-2" />
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
            <Badge variant={todayStats.canTrade ? "default" : "destructive"} className="text-lg px-4 py-2">
              {todayStats.canTrade ? "CAN TRADE" : "STOP TRADING"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {todayStats.canTrade ? "All systems green" : "Daily limit reached"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logger">Trade Logger</TabsTrigger>
          <TabsTrigger value="calculator">Risk Calc</TabsTrigger>
          <TabsTrigger value="rules">Rule Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart />
            <RuleMonitor />
          </div>
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card-custom">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span className="font-bold text-profit">{accountData.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average R</span>
                  <span className="font-bold text-primary">{accountData.avgR}R</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Trades</span>
                  <span className="font-bold">{accountData.tradesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Drawdown</span>
                  <span className="font-bold text-warning">{accountData.drawdown}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card-custom">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Week 1 Target</span>
                      <span className="text-sm text-muted-foreground">$100-150</span>
                    </div>
                    <Progress value={83} className="h-2" />
                    <p className="text-sm text-profit mt-1">$125 achieved ✓</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Target</span>
                      <span className="text-sm text-muted-foreground">$500</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">$125 of $500 (25%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;