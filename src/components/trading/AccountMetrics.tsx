import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

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
}

interface AccountMetricsProps {
  data: AccountData;
}

export const AccountMetrics = ({ data }: AccountMetricsProps) => {
  const profitProgress = (data.totalPL / data.profitTarget) * 100;
  const drawdownProgress = (data.drawdown / 10) * 100; // 10% max drawdown

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Account Balance */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.balance.toLocaleString()}</div>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">Equity: </span>
            <span className="text-sm font-medium ml-1">${data.equity.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily P&L */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            {data.dailyPL >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-2 text-profit" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-2 text-loss" />
            )}
            Daily P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.dailyPL >= 0 ? 'text-profit' : 'text-loss'}`}>
            {data.dailyPL >= 0 ? '+' : ''}${data.dailyPL}
          </div>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">Total: </span>
            <span className={`text-sm font-medium ml-1 ${data.totalPL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {data.totalPL >= 0 ? '+' : ''}${data.totalPL}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Profit Target */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profit Target ({data.phase === "evaluation" ? "10%" : "5%"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${data.profitTarget}</div>
          <Progress value={profitProgress} className="mt-2 h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${data.totalPL}</span>
            <span>{profitProgress.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
            Max Drawdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{data.drawdown}%</div>
          <Progress value={drawdownProgress} className="mt-2 h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Safe: &lt;5%</span>
            <span>Limit: 10%</span>
          </div>
          {data.drawdown > 5 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Warning: High Drawdown
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};