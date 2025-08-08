import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trade {
  id: string;
  instrument: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  riskAmount: number;
  rewardRatio: number;
  pnl?: number;
  status: "open" | "closed";
  timestamp: Date;
  notes: string;
  ruleCompliance: boolean;
  po3Phase: string;
}

export const TradeLogger = () => {
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      instrument: "XAUUSD",
      direction: "long",
      entryPrice: 2645.50,
      exitPrice: 2658.75,
      lotSize: 0.02,
      riskAmount: 37.50,
      rewardRatio: 2.1,
      pnl: 45.50,
      status: "closed",
      timestamp: new Date("2024-01-08T10:30:00"),
      notes: "Perfect PO3 setup on H1, liquidity sweep at 2640 support",
      ruleCompliance: true,
      po3Phase: "Distribution"
    }
  ]);

  const [newTrade, setNewTrade] = useState({
    instrument: "",
    direction: "long" as "long" | "short",
    entryPrice: "",
    lotSize: "",
    riskAmount: "37.50", // Default evaluation risk
    rewardRatio: "",
    notes: "",
    po3Phase: ""
  });

  const validateTrade = () => {
    const rules = [];
    
    // Risk validation
    if (parseFloat(newTrade.riskAmount) > 37.50) {
      rules.push("Risk exceeds 0.75% limit ($37.50)");
    }
    
    // Reward ratio validation
    if (parseFloat(newTrade.rewardRatio) < 2) {
      rules.push("Minimum 2R reward ratio required");
    }
    
    // Daily trades limit (simplified)
    const todayTrades = trades.filter(t => 
      t.timestamp.toDateString() === new Date().toDateString()
    ).length;
    
    if (todayTrades >= 3) {
      rules.push("Daily trade limit (3) exceeded");
    }
    
    return rules;
  };

  const handleSubmit = () => {
    const violations = validateTrade();
    
    if (violations.length > 0) {
      toast({
        title: "Trade Validation Failed",
        description: violations.join(", "),
        variant: "destructive"
      });
      return;
    }

    const trade: Trade = {
      id: Date.now().toString(),
      instrument: newTrade.instrument,
      direction: newTrade.direction,
      entryPrice: parseFloat(newTrade.entryPrice),
      lotSize: parseFloat(newTrade.lotSize),
      riskAmount: parseFloat(newTrade.riskAmount),
      rewardRatio: parseFloat(newTrade.rewardRatio),
      status: "open",
      timestamp: new Date(),
      notes: newTrade.notes,
      ruleCompliance: true,
      po3Phase: newTrade.po3Phase
    };

    setTrades([trade, ...trades]);
    setNewTrade({
      instrument: "",
      direction: "long",
      entryPrice: "",
      lotSize: "",
      riskAmount: "37.50",
      rewardRatio: "",
      notes: "",
      po3Phase: ""
    });

    toast({
      title: "Trade Logged Successfully",
      description: `${newTrade.instrument} ${newTrade.direction} trade added`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Trade Logger */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Log New Trade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="instrument">Instrument</Label>
              <Select value={newTrade.instrument} onValueChange={(value) => 
                setNewTrade({...newTrade, instrument: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XAUUSD">Gold (XAUUSD)</SelectItem>
                  <SelectItem value="US30">Dow Jones (US30)</SelectItem>
                  <SelectItem value="NAS100">Nasdaq (NAS100)</SelectItem>
                  <SelectItem value="SPX500">S&P 500 (SPX500)</SelectItem>
                  <SelectItem value="GER40">DAX (GER40)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="direction">Direction</Label>
              <Select value={newTrade.direction} onValueChange={(value) => 
                setNewTrade({...newTrade, direction: value as "long" | "short"})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long (Buy)</SelectItem>
                  <SelectItem value="short">Short (Sell)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                type="number"
                step="0.01"
                value={newTrade.entryPrice}
                onChange={(e) => setNewTrade({...newTrade, entryPrice: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lotSize">Lot Size</Label>
              <Input
                type="number"
                step="0.01"
                value={newTrade.lotSize}
                onChange={(e) => setNewTrade({...newTrade, lotSize: e.target.value})}
                placeholder="0.01"
              />
            </div>

            <div>
              <Label htmlFor="riskAmount">Risk Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={newTrade.riskAmount}
                onChange={(e) => setNewTrade({...newTrade, riskAmount: e.target.value})}
                placeholder="37.50"
              />
            </div>

            <div>
              <Label htmlFor="rewardRatio">Reward Ratio (R)</Label>
              <Input
                type="number"
                step="0.1"
                value={newTrade.rewardRatio}
                onChange={(e) => setNewTrade({...newTrade, rewardRatio: e.target.value})}
                placeholder="2.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="po3Phase">PO3 Phase</Label>
              <Select value={newTrade.po3Phase} onValueChange={(value) => 
                setNewTrade({...newTrade, po3Phase: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO3 phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accumulation">Accumulation</SelectItem>
                  <SelectItem value="Manipulation">Manipulation</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Trade Notes</Label>
              <Textarea
                value={newTrade.notes}
                onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                placeholder="Setup details, confirmations, etc."
                className="min-h-[38px] resize-none"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Trade
          </Button>
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.direction === "long" ? "default" : "secondary"}>
                      {trade.instrument}
                    </Badge>
                    <Badge variant="outline">
                      {trade.direction.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {trade.ruleCompliance ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <Badge variant={trade.status === "open" ? "secondary" : "default"}>
                      {trade.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entry:</span>
                    <div className="font-medium">{trade.entryPrice}</div>
                  </div>
                  {trade.exitPrice && (
                    <div>
                      <span className="text-muted-foreground">Exit:</span>
                      <div className="font-medium">{trade.exitPrice}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Risk:</span>
                    <div className="font-medium">${trade.riskAmount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">R Ratio:</span>
                    <div className="font-medium">{trade.rewardRatio}R</div>
                  </div>
                  {trade.pnl && (
                    <div>
                      <span className="text-muted-foreground">P&L:</span>
                      <div className={`font-medium flex items-center ${trade.pnl > 0 ? 'text-profit' : 'text-loss'}`}>
                        {trade.pnl > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {trade.pnl > 0 ? '+' : ''}${trade.pnl}
                      </div>
                    </div>
                  )}
                </div>

                {trade.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1">{trade.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};