import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Clock, Globe, Zap } from "lucide-react";

export const MarketOverview = () => {
  const marketData = [
    {
      symbol: "XAUUSD",
      name: "Gold",
      price: 2645.50,
      change: 12.75,
      changePercent: 0.48,
      volume: "High",
      volatility: 85,
      trend: "bullish",
      session: "London",
      nextEvent: "US CPI - 2h 15m"
    },
    {
      symbol: "US30",
      name: "Dow Jones",
      price: 38245.80,
      change: -125.40,
      changePercent: -0.33,
      volume: "Medium",
      volatility: 45,
      trend: "bearish",
      session: "Pre-Market",
      nextEvent: "Market Open - 45m"
    },
    {
      symbol: "NAS100",
      name: "Nasdaq",
      price: 16890.25,
      change: 89.60,
      changePercent: 0.53,
      volume: "High",
      volatility: 92,
      trend: "bullish",
      session: "Pre-Market",
      nextEvent: "Market Open - 45m"
    },
    {
      symbol: "SPX500",
      name: "S&P 500",
      price: 4785.30,
      change: 15.85,
      changePercent: 0.33,
      volume: "Medium",
      volatility: 38,
      trend: "bullish",
      session: "Pre-Market",
      nextEvent: "Market Open - 45m"
    },
    {
      symbol: "GER40",
      name: "DAX",
      price: 17125.60,
      change: -45.20,
      changePercent: -0.26,
      volume: "Low",
      volatility: 25,
      trend: "neutral",
      session: "Closed",
      nextEvent: "Market Open - 6h 45m"
    }
  ];

  const marketSessions = [
    { name: "Sydney", status: "closed", opens: "5h 30m" },
    { name: "Tokyo", status: "closed", opens: "3h 15m" },
    { name: "London", status: "active", closes: "4h 45m" },
    { name: "New York", status: "pre-market", opens: "45m" }
  ];

  const economicEvents = [
    { time: "08:30", event: "US CPI m/m", impact: "high", forecast: "0.3%", previous: "0.4%" },
    { time: "10:00", event: "US Core CPI y/y", impact: "high", forecast: "3.2%", previous: "3.3%" },
    { time: "14:00", event: "Fed Chair Powell Speech", impact: "high", forecast: "-", previous: "-" },
    { time: "15:30", event: "US Crude Oil Inventories", impact: "medium", forecast: "-2.1M", previous: "-5.1M" }
  ];

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case "High": return "text-success";
      case "Medium": return "text-warning";
      case "Low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "bullish": return <TrendingUp className="w-4 h-4 text-success" />;
      case "bearish": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSessionStatus = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case "pre-market": return <Badge variant="outline" className="text-warning">Pre-Market</Badge>;
      case "closed": return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Sessions */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>Global Market Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketSessions.map((session) => (
              <div key={session.name} className="text-center p-3 border border-border rounded-lg">
                <h4 className="font-medium">{session.name}</h4>
                {getSessionStatus(session.status)}
                <p className="text-xs text-muted-foreground mt-1">
                  {session.status === "active" ? `Closes in ${session.closes}` : `Opens in ${session.opens}`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instrument Overview */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Instrument Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((instrument) => (
              <div key={instrument.symbol} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(instrument.trend)}
                    <div>
                      <h4 className="font-medium">{instrument.symbol}</h4>
                      <p className="text-sm text-muted-foreground">{instrument.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{instrument.price.toLocaleString()}</div>
                    <div className={`text-sm flex items-center ${instrument.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {instrument.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {instrument.change >= 0 ? '+' : ''}{instrument.change} ({instrument.changePercent >= 0 ? '+' : ''}{instrument.changePercent}%)
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Volume:</span>
                    <div className={`font-medium ${getVolumeColor(instrument.volume)}`}>{instrument.volume}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volatility:</span>
                    <div className="font-medium">{instrument.volatility}%</div>
                    <Progress value={instrument.volatility} className="h-1 mt-1" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Session:</span>
                    <div className="font-medium">{instrument.session}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Event:</span>
                    <div className="font-medium text-xs">{instrument.nextEvent}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Economic Calendar */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Today's Economic Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {economicEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-mono font-medium">{event.time}</div>
                  <div className="flex items-center space-x-2">
                    <Zap className={`w-3 h-3 ${getImpactColor(event.impact)}`} />
                    <span className="font-medium">{event.event}</span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Forecast: {event.forecast}</div>
                  <div className="text-muted-foreground">Previous: {event.previous}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};