import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search, Filter, TrendingUp, TrendingDown, Star } from "lucide-react";

interface JournalEntry {
  id: string;
  date: Date;
  instrument: string;
  setup: string;
  outcome: "win" | "loss" | "breakeven";
  pnl: number;
  lessons: string;
  emotions: string;
  rating: number;
  tags: string[];
  screenshots?: string[];
}

export const TradingJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date("2024-01-08T10:30:00"),
      instrument: "XAUUSD",
      setup: "Perfect PO3 Distribution phase. External liquidity sweep at 2640 EQ lows, BOS confirmation with body close. Entry at refined 15M OB + FVG confluence with POC reaction.",
      outcome: "win",
      pnl: 45.50,
      lessons: "Framework executed perfectly. HTF bias aligned, waited for purge-BOS-entry sequence. Volume confluence at POC confirmed institutional interest. 2R target hit as planned.",
      emotions: "Calm and disciplined. No FOMO, followed checklist completely. Walked away at 2R as per psychology filter.",
      rating: 5,
      tags: ["PO3", "Distribution", "External Sweep", "POC Confluence", "CRT Signal", "2R Exit"]
    },
    {
      id: "2",
      date: new Date("2024-01-05T14:15:00"),
      instrument: "US30",
      setup: "Markup phase identified but violated framework. Entered without proper purge confirmation. Missing 15M CHoCH alignment with HTF bias.",
      outcome: "loss",
      pnl: -18.25,
      lessons: "Framework violation: Entered without completing critical checklist items. No purge confirmation, weak BOS signal. Must stick to 'purge first, BOS second, entry last' sequence.",
      emotions: "FOMO triggered entry. Rushed decision without proper confirmation. Need to enforce psychology filter more strictly.",
      rating: 2,
      tags: ["PO3", "Markup", "Framework Violation", "FOMO", "No Purge", "Lesson Learned"]
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    instrument: "",
    setup: "",
    outcome: "win" as "win" | "loss" | "breakeven",
    pnl: "",
    lessons: "",
    emotions: "",
    rating: 3,
    tags: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("all");

  const handleSubmit = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      instrument: newEntry.instrument,
      setup: newEntry.setup,
      outcome: newEntry.outcome,
      pnl: parseFloat(newEntry.pnl),
      lessons: newEntry.lessons,
      emotions: newEntry.emotions,
      rating: newEntry.rating,
      tags: newEntry.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
    };

    setEntries([entry, ...entries]);
    setNewEntry({
      instrument: "",
      setup: "",
      outcome: "win",
      pnl: "",
      lessons: "",
      emotions: "",
      rating: 3,
      tags: ""
    });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.setup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.lessons.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.instrument.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterOutcome === "all" || entry.outcome === filterOutcome;
    return matchesSearch && matchesFilter;
  });

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "win": return "text-success";
      case "loss": return "text-destructive";
      case "breakeven": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "win": return <Badge variant="default" className="bg-success text-success-foreground">Win</Badge>;
      case "loss": return <Badge variant="destructive">Loss</Badge>;
      case "breakeven": return <Badge variant="secondary">Breakeven</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-warning fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Add New Entry */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>New Journal Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="instrument">Instrument</Label>
              <Select value={newEntry.instrument} onValueChange={(value) => 
                setNewEntry({...newEntry, instrument: value})
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
              <Label htmlFor="outcome">Outcome</Label>
              <Select value={newEntry.outcome} onValueChange={(value) => 
                setNewEntry({...newEntry, outcome: value as "win" | "loss" | "breakeven"})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pnl">P&L ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={newEntry.pnl}
                onChange={(e) => setNewEntry({...newEntry, pnl: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="setup">Trade Setup & Analysis</Label>
            <Textarea
              value={newEntry.setup}
              onChange={(e) => setNewEntry({...newEntry, setup: e.target.value})}
              placeholder="Describe the setup, entry reasons, PO3 phase, confirmations..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="lessons">Key Lessons Learned</Label>
            <Textarea
              value={newEntry.lessons}
              onChange={(e) => setNewEntry({...newEntry, lessons: e.target.value})}
              placeholder="What did you learn from this trade? What would you do differently?"
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label htmlFor="emotions">Emotional State & Psychology</Label>
            <Textarea
              value={newEntry.emotions}
              onChange={(e) => setNewEntry({...newEntry, emotions: e.target.value})}
              placeholder="How did you feel during the trade? Any emotional challenges?"
              className="min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Trade Quality Rating (1-5)</Label>
              <Select value={newEntry.rating.toString()} onValueChange={(value) => 
                setNewEntry({...newEntry, rating: parseInt(value)})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                value={newEntry.tags}
                onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                placeholder="PO3, Distribution, Liquidity Sweep..."
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Journal Entry
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-gradient-card shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Trading Journal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterOutcome} onValueChange={setFilterOutcome}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{entry.instrument}</Badge>
                    {getOutcomeBadge(entry.outcome)}
                    <span className="text-sm text-muted-foreground">
                      {entry.date.toLocaleDateString()} {entry.date.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(entry.rating)}</div>
                    <div className={`font-bold ${getOutcomeColor(entry.outcome)}`}>
                      {entry.outcome === "win" ? <TrendingUp className="w-4 h-4 inline mr-1" /> : 
                       entry.outcome === "loss" ? <TrendingDown className="w-4 h-4 inline mr-1" /> : null}
                      {entry.pnl >= 0 ? '+' : ''}${entry.pnl}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Setup & Analysis</h4>
                    <p className="text-sm">{entry.setup}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Lessons Learned</h4>
                    <p className="text-sm">{entry.lessons}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Emotional State</h4>
                    <p className="text-sm">{entry.emotions}</p>
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};