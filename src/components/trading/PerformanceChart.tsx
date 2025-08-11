import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";
import { TrendingUp, Calendar, BarChart3, Activity } from "lucide-react";

export const PerformanceChart = () => {
  // Mock performance data
  const dailyPnL = [
    { date: "Jan 1", pnl: 0, balance: 5000 },
    { date: "Jan 2", pnl: 42.50, balance: 5042.50 },
    { date: "Jan 3", pnl: -18.25, balance: 5024.25 },
    { date: "Jan 4", pnl: 67.80, balance: 5092.05 },
    { date: "Jan 5", pnl: 33.70, balance: 5125.75 },
    { date: "Jan 6", pnl: 0, balance: 5125.75 },
    { date: "Jan 7", pnl: 0, balance: 5125.75 },
    { date: "Jan 8", pnl: 45.50, balance: 5171.25 }
  ];

  const weeklyStats = [
    { week: "Week 1", target: 150, achieved: 125, percentage: 83 },
    { week: "Week 2", target: 200, achieved: 0, percentage: 0 },
    { week: "Week 3", target: 150, achieved: 0, percentage: 0 }
  ];

  const totalProfit = dailyPnL[dailyPnL.length - 1].balance - dailyPnL[0].balance;
  const profitTarget = 500;
  const progressPercentage = (totalProfit / profitTarget) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card shadow-card-custom hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Performance Overview
          </span>
          <Badge variant={progressPercentage >= 100 ? "default" : "outline"} className={progressPercentage >= 100 ? "bg-success text-success-foreground" : "text-primary"}>
            {progressPercentage.toFixed(1)}% to target
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Balance Chart */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-success" />Account Balance Growth</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - 50', 'dataMax + 50']}
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily P&L Chart */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center"><BarChart3 className="w-4 h-4 mr-2 text-warning" />Daily P&L</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar 
                  dataKey="pnl" 
                  fill={(entry: any) => entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  radius={[2, 2, 0, 0]}
                />
                <Tooltip content={<CustomTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Weekly Targets
          </h4>
          <div className="space-y-2">
            {weeklyStats.map((week, index) => (
              <div key={week.week} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{week.week}</span>
                  {index === 0 && <Badge variant="outline" className="text-xs">Current</Badge>}
                  <span className="text-xs text-muted-foreground">
                    (${week.achieved} / ${week.target})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        week.percentage >= 100 ? 'bg-success' : 
                        week.percentage >= 80 ? 'bg-primary' : 
                        week.percentage > 0 ? 'bg-warning' : 'bg-secondary'
                      }`}
                      style={{ width: `${Math.min(week.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">
                    {week.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-profit">+${totalProfit}</div>
            <p className="text-xs text-muted-foreground">Total P&L</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{dailyPnL.filter(d => d.pnl > 0).length}</div>
            <p className="text-xs text-muted-foreground">Green Days</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">${(500 - totalProfit).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">To Target</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};