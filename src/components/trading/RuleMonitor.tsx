import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Shield } from "lucide-react";

interface RuleMonitorProps {
  expanded?: boolean;
}

export const RuleMonitor = ({ expanded = false }: RuleMonitorProps) => {
  // Mock rule compliance data
  const rules = [
    {
      id: "daily_trades",
      name: "Daily Trade Limit",
      description: "Max 3 trades per day during evaluation",
      status: "compliant",
      current: 1,
      limit: 3,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: "daily_profit",
      name: "Daily Profit Target",
      description: "Stop trading after +$75 daily profit (2R)",
      status: "active",
      current: 45.50,
      limit: 75,
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      id: "daily_loss",
      name: "Daily Loss Limit", 
      description: "Stop trading after -$75 daily loss",
      status: "compliant",
      current: 0,
      limit: 75,
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: "drawdown",
      name: "Maximum Drawdown",
      description: "10% maximum drawdown from initial balance",
      status: "warning",
      current: 1.2,
      limit: 10,
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      id: "session_break",
      name: "Session Break",
      description: "6-hour break between trading sessions",
      status: "compliant",
      current: "Last trade: 2h ago",
      limit: "6h required",
      icon: <Clock className="w-4 h-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "text-success";
      case "warning": return "text-warning";
      case "violation": return "text-destructive";
      case "active": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge variant="default" className="bg-success text-success-foreground">✓ OK</Badge>;
      case "warning": return <Badge variant="default" className="bg-warning text-warning-foreground">⚠ Warning</Badge>;
      case "violation": return <Badge variant="destructive">✗ Violation</Badge>;
      case "active": return <Badge variant="outline" className="text-primary">Active</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!expanded) {
    // Compact view for dashboard overview
    const violations = rules.filter(r => r.status === "violation").length;
    const warnings = rules.filter(r => r.status === "warning").length;
    const compliant = rules.filter(r => r.status === "compliant").length;

    return (
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Rule Compliance
            </span>
            {violations > 0 ? (
              <Badge variant="destructive">{violations} Violations</Badge>
            ) : warnings > 0 ? (
              <Badge variant="default" className="bg-warning text-warning-foreground">{warnings} Warnings</Badge>
            ) : (
              <Badge variant="default" className="bg-success text-success-foreground">All Clear</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.slice(0, 3).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(rule.status)}>{rule.icon}</span>
                  <span className="text-sm">{rule.name}</span>
                </div>
                {getStatusBadge(rule.status)}
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-success font-bold">{compliant}</div>
                  <p className="text-muted-foreground">Compliant</p>
                </div>
                <div>
                  <div className="text-warning font-bold">{warnings}</div>
                  <p className="text-muted-foreground">Warnings</p>
                </div>
                <div>
                  <div className="text-destructive font-bold">{violations}</div>
                  <p className="text-muted-foreground">Violations</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded view for dedicated rules page
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Real-Time Rule Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={getStatusColor(rule.status)}>{rule.icon}</span>
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(rule.status)}
                </div>

                {typeof rule.current === "number" && typeof rule.limit === "number" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {rule.id === "daily_profit" ? `$${rule.current}` : rule.id === "drawdown" ? `${rule.current}%` : rule.current}</span>
                      <span>Limit: {rule.id === "daily_profit" || rule.id === "daily_loss" ? `$${rule.limit}` : rule.id === "drawdown" ? `${rule.limit}%` : rule.limit}</span>
                    </div>
                    <Progress 
                      value={rule.id === "drawdown" ? (rule.current / rule.limit) * 100 : Math.min((rule.current / rule.limit) * 100, 100)} 
                      className={`h-2 ${rule.status === "warning" ? "bg-warning/20" : rule.status === "violation" ? "bg-destructive/20" : ""}`}
                    />
                  </div>
                )}

                {typeof rule.current === "string" && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span>{rule.current}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Emergency Protocols</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="font-medium text-warning mb-2">At 3% Drawdown:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Reduce risk to 0.25% per trade</li>
                <li>Increase setup quality requirements</li>
                <li>Implement mandatory 24-hour breaks between trades</li>
              </ul>
            </div>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">At 5% Drawdown:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Stop trading for 48 hours minimum</li>
                <li>Complete comprehensive journal review</li>
                <li>Return with paper trading first</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};