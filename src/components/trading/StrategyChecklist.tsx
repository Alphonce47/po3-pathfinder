import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Clock, Target, Brain, BookOpen, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  critical?: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  color: string;
}

export const StrategyChecklist = () => {
  const { toast } = useToast();
  
  const [checklist, setChecklist] = useState<ChecklistSection[]>([
    {
      id: "htf-prep",
      title: "PRE-MARKET HTF PREP (4H / 1H)",
      icon: <Target className="w-5 h-5" />,
      color: "text-primary",
      items: [
        { id: "po3-phase", label: "Identify PO3 Phase", description: "Markup / Distribution / Accumulation", completed: false, critical: true },
        { id: "htf-bias", label: "Define HTF Bias", description: "Bullish or Bearish only", completed: false, critical: true },
        { id: "htf-zones", label: "Mark Valid HTF Zones", description: "OB + Imbalance + Structure Shift", completed: false, critical: true },
        { id: "zone-status", label: "Check Zone Status", description: "✅ Fresh / Mitigated ❌ Invalidated", completed: false },
        { id: "htf-liquidity", label: "Look for HTF Liquidity", description: "Equal highs/lows or major wicks", completed: false },
        { id: "external-sweeps", label: "Mark External Sweeps", description: "Prior to BOS = trap setup", completed: false },
        { id: "red-folders", label: "Avoid Red Folders", description: "No FOMC, ECB, NFP trades", completed: false, critical: true },
        { id: "poc-hvn", label: "Identify session/weekly POC and HVNs", description: "High Volume Nodes", completed: false },
        { id: "lvn-zones", label: "Mark Low Volume Nodes (LVNs)", description: "Potential imbalance continuation zones", completed: false },
        { id: "poc-alignment", label: "POC + OB/Imbalance alignment", description: "Strong magnet zone confirmation", completed: false },
        { id: "poc-avoidance", label: "Price avoids POC post-sweep", description: "Signal of active distribution/accumulation", completed: false }
      ]
    },
    {
      id: "midframe",
      title: "MIDFRAME ALIGNMENT (15M)",
      icon: <Clock className="w-5 h-5" />,
      color: "text-warning",
      items: [
        { id: "15m-choch", label: "Wait for 15M CHoCH", description: "Align with HTF bias only", completed: false, critical: true },
        { id: "consolidation", label: "Observe Consolidation", description: "Signal of liquidity buildup", completed: false },
        { id: "15m-bos", label: "Confirm 15M BOS", description: "With body close", completed: false, critical: true },
        { id: "15m-ob", label: "Mark 15M OB + Imbalance", description: "Must be unmitigated", completed: false },
        { id: "trap-signs", label: "Trap Signs Present?", description: "EQ highs/lows, sudden spikes, rejection wicks", completed: false },
        { id: "entry-poc", label: "Entry zone near POC", description: "15M OB should react off POC", completed: false },
        { id: "lvn-rejection", label: "Price rejects LVN into zone", description: "Confirms fast entry intent", completed: false },
        { id: "poc-flip", label: "POC Flip after sweep", description: "Re-accumulation or distribution shift", completed: false }
      ]
    },
    {
      id: "ltf-entry",
      title: "LTF ENTRY CONFIRMATION (1M)",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-success",
      items: [
        { id: "purge", label: "Wait for Purge", description: "Sweep of liquidity (EQ or LQ wick)", completed: false, critical: true },
        { id: "bos-post-purge", label: "Confirm BOS Post-Purge", description: "BOS candle body close", completed: false, critical: true },
        { id: "entry-ob-fvg", label: "Identify Entry OB + FVG", description: "At BOS origin zone", completed: false, critical: true },
        { id: "crt-signal", label: "CHoCH + BOS?", description: "CRT signal confirmed", completed: false },
        { id: "atr-expansion", label: "ATR Expansion Present?", description: "Strong move validates intention", completed: false },
        { id: "volume-surge", label: "Sharp volume surge", description: "Inside OB or near refined entry", completed: false },
        { id: "micro-poc", label: "Micro POC (1M volume clusters)", description: "Confirms trap or engineered reversal", completed: false },
        { id: "volume-divergence", label: "Volume divergence check", description: "Price spikes but volume drops = false move", completed: false }
      ]
    },
    {
      id: "execution",
      title: "TRADE EXECUTION",
      icon: <Target className="w-5 h-5" />,
      color: "text-accent",
      items: [
        { id: "limit-order", label: "Use Limit Order", description: "Only after confirmation", completed: false, critical: true },
        { id: "sl-logic", label: "SL = Logical OB Protection", description: "Just below/above last internal swing", completed: false, critical: true },
        { id: "tp-2r", label: "TP = 2R Minimum", description: "Exit at expansion target or key HTF level", completed: false, critical: true },
        { id: "no-scaling", label: "No Scaling or Chasing", description: "One shot, one kill", completed: false, critical: true },
        { id: "volume-confluence", label: "Volume Confluence present", description: "POC / HVN / LVN alignment", completed: false }
      ]
    },
    {
      id: "psychology",
      title: "PSYCHOLOGY FILTER",
      icon: <Brain className="w-5 h-5" />,
      color: "text-destructive",
      items: [
        { id: "no-red-folders", label: "No Trading on Red Folders", description: "FOMC, ECB, NFP etc.", completed: false, critical: true },
        { id: "no-revenge", label: "No Revenge Trading", description: "Missed = missed. Move on.", completed: false, critical: true },
        { id: "walk-away-2r", label: "Walk Away at 2R", description: "Protect mental capital", completed: false, critical: true },
        { id: "avoid-fomo", label: "Avoid FOMO", description: "Trap the market, don't chase it", completed: false, critical: true }
      ]
    },
    {
      id: "journal",
      title: "JOURNAL POST-TRADE",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-muted-foreground",
      items: [
        { id: "journal-po3", label: "PO3 Phase", description: "Accumulation / Distribution / Markup", completed: false },
        { id: "journal-zone", label: "Zone Type", description: "Valid Fresh / Mitigated / Invalid", completed: false },
        { id: "journal-entry", label: "Entry Signal", description: "CRT / TDT / BOS only", completed: false },
        { id: "journal-sweep", label: "Sweep Logic", description: "Internal / External / EQ Lows", completed: false },
        { id: "journal-sl", label: "SL Logic", description: "OB, swing low, structure base", completed: false },
        { id: "journal-emotion", label: "Emotional State", description: "Calm / Rushed / Greedy", completed: false }
      ]
    }
  ]);

  const toggleItem = (sectionId: string, itemId: string) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : section
    ));
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, completed: false }))
    })));
    toast({
      title: "Checklist Reset",
      description: "All items have been unchecked. Ready for next trade setup.",
    });
  };

  const getTotalProgress = () => {
    const totalItems = checklist.reduce((acc, section) => acc + section.items.length, 0);
    const completedItems = checklist.reduce((acc, section) => 
      acc + section.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getCriticalProgress = () => {
    const criticalItems = checklist.reduce((acc, section) => 
      acc + section.items.filter(item => item.critical).length, 0
    );
    const completedCritical = checklist.reduce((acc, section) => 
      acc + section.items.filter(item => item.critical && item.completed).length, 0
    );
    return criticalItems > 0 ? (completedCritical / criticalItems) * 100 : 0;
  };

  const getSectionProgress = (section: ChecklistSection) => {
    const total = section.items.length;
    const completed = section.items.filter(item => item.completed).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const canTrade = () => {
    const criticalProgress = getCriticalProgress();
    return criticalProgress === 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card shadow-card-custom border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl">
                PO3 Institutional Framework v2
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                "Trade like a bank. Enter like a sniper. Exit like a robot."
              </p>
            </div>
            <Button onClick={resetChecklist} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {getTotalProgress().toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress value={getTotalProgress()} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {getCriticalProgress().toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Critical Items</p>
              <Progress value={getCriticalProgress()} className="mt-2" />
            </div>
            <div className="text-center">
              <Badge 
                variant={canTrade() ? "default" : "destructive"} 
                className="text-lg px-4 py-2"
              >
                {canTrade() ? "READY TO TRADE" : "NOT READY"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {canTrade() ? "All critical items completed" : "Complete critical items first"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Philosophy */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Core Strategy Philosophy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-medium">
              Only trade when all systems align: HTF bias, refined zones, liquidity logic, and multitimeframe confirmations.
            </p>
            <p className="font-medium">
              Risk only when the market shows its hand — purge first, BOS second, entry last.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {checklist.map((section) => (
          <Card key={section.id} className="bg-gradient-card shadow-card-custom">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center space-x-2 ${section.color}`}>
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {section.items.filter(item => item.completed).length}/{section.items.length}
                  </span>
                  <div className="w-16">
                    <Progress value={getSectionProgress(section)} className="h-2" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(section.id, item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={item.id}
                        className={`text-sm font-medium cursor-pointer flex items-center space-x-2 ${
                          item.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.critical && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            CRITICAL
                          </Badge>
                        )}
                      </label>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};