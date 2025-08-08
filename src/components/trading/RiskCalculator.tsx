import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface RiskCalculatorProps {
  accountBalance: number;
  phase: "evaluation" | "funded";
}

export const RiskCalculator = ({ accountBalance, phase }: RiskCalculatorProps) => {
  const [instrument, setInstrument] = useState("XAUUSD");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [riskPercentage, setRiskPercentage] = useState(phase === "evaluation" ? "0.75" : "0.50");
  
  const riskAmount = (accountBalance * parseFloat(riskPercentage || "0")) / 100;
  const maxRisk = phase === "evaluation" ? 37.50 : 25;
  
  // Calculate position size based on instrument
  const calculatePositionSize = () => {
    if (!entryPrice || !stopLoss) return 0;
    
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const pipDifference = Math.abs(entry - stop);
    
    // Instrument-specific pip values
    const pipValues: Record<string, number> = {
      "XAUUSD": 1, // $1 per 0.01 lot per pip
      "US30": 1,   // $1 per 0.01 lot per point
      "NAS100": 1, // $1 per 0.01 lot per point
      "SPX500": 1, // $1 per 0.01 lot per point
      "GER40": 1   // $1 per 0.01 lot per point
    };
    
    const pipValue = pipValues[instrument] || 1;
    const positionSize = riskAmount / (pipDifference * pipValue * 100); // Convert to lot size
    
    return Math.round(positionSize * 100) / 100; // Round to 2 decimal places
  };

  const positionSize = calculatePositionSize();
  const potentialLoss = riskAmount;
  const pipDiff = entryPrice && stopLoss ? Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss)) : 0;

  const isValidRisk = riskAmount <= maxRisk;
  const isValidSetup = entryPrice && stopLoss && pipDiff > 0;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span>Position Size Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phase Info */}
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Trading Phase:</span>
              <Badge variant={phase === "evaluation" ? "secondary" : "default"}>
                {phase === "evaluation" ? "EVALUATION" : "FUNDED"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Max Risk per Trade:</span>
                <div className="font-medium">${maxRisk} ({phase === "evaluation" ? "0.75" : "0.50"}%)</div>
              </div>
              <div>
                <span className="text-muted-foreground">Account Balance:</span>
                <div className="font-medium">${accountBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instrument">Instrument</Label>
              <Select value={instrument} onValueChange={setInstrument}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="riskPercentage">Risk Percentage</Label>
              <Select value={riskPercentage} onValueChange={setRiskPercentage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phase === "evaluation" ? (
                    <>
                      <SelectItem value="0.25">0.25% (Conservative)</SelectItem>
                      <SelectItem value="0.50">0.50% (Moderate)</SelectItem>
                      <SelectItem value="0.75">0.75% (Standard)</SelectItem>
                      <SelectItem value="1.00">1.00% (High Probability)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="0.25">0.25% (Recovery)</SelectItem>
                      <SelectItem value="0.50">0.50% (Standard)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                type="number"
                step="0.01"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                type="number"
                step="0.01"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Calculation Results */}
          {isValidSetup && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
              <h3 className="font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Position Calculation
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{positionSize}</div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${riskAmount.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Risk Amount</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pipDiff.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">
                    {instrument === "XAUUSD" ? "Points" : "Points"} Distance
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isValidRisk ? 'text-success' : 'text-destructive'}`}>
                    {isValidRisk ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isValidRisk ? "Valid Risk" : "Risk Too High"}
                  </p>
                </div>
              </div>

              {!isValidRisk && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center text-destructive">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Risk amount ${riskAmount.toFixed(2)} exceeds maximum ${maxRisk}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instrument-Specific Guidelines */}
          <div className="p-4 bg-secondary/10 rounded-lg">
            <h4 className="font-medium mb-2">{instrument} Trading Guidelines:</h4>
            <div className="text-sm space-y-1">
              {instrument === "XAUUSD" && (
                <>
                  <p>• Best during London/NY overlap (8:00-11:00 EST)</p>
                  <p>• Typical stop: $5-15, strong trends can run for days</p>
                  <p>• Extreme reaction to USD, inflation, geopolitics</p>
                </>
              )}
              {instrument === "US30" && (
                <>
                  <p>• Focus on 9:30-16:00 EST (New York session)</p>
                  <p>• Typical stop: 15-30 points, slower steady trends</p>
                  <p>• Moderate reaction to economic data</p>
                </>
              )}
              {instrument === "NAS100" && (
                <>
                  <p>• Fast explosive moves, quick execution required</p>
                  <p>• Typical stop: 5-15 points, moves fast both ways</p>
                  <p>• Reduce size 50% during tech earnings</p>
                </>
              )}
              {instrument === "SPX500" && (
                <>
                  <p>• Most balanced, good for all timeframes</p>
                  <p>• Typical stop: 10-25 points</p>
                  <p>• Textbook PO3 patterns, follows institutional flow</p>
                </>
              )}
              {instrument === "GER40" && (
                <>
                  <p>• Trade only 2:00-11:00 EST (European hours)</p>
                  <p>• Typical stop: 12+ points, similar to NAS100</p>
                  <p>• Avoid during US market overlap (confusing signals)</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};