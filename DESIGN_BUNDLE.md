# Laureum.ai (AgentTrust) — Design Bundle for Redesign

> Give this file to Claude and say: "Redesign the main dashboard page for laureum.ai — a premium AI agent quality verification platform. Brand name: Laureum. Keep the same data structure and functionality, but create a new visual identity."

## Product Summary

**Laureum** (formerly AgentTrust) — Pre-payment quality verification platform for AI agents and MCP servers. Think "SSL certificates for AI agents." Users evaluate agents across 6 quality dimensions, get trust badges, and compete in head-to-head battles.

**Pages:** Dashboard, Evaluate, Leaderboard, Battle, Ladder, Compare, Bulk
**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui + Recharts + Lucide icons

---

## Current Design System

### Colors
```
Brand Orange:  #F66824  (primary accent, gradients, links)
Brand Pink:    #DB5F94  (secondary, comparisons)
Foreground:    #181D27  (text, nav bg, buttons)
Background:    #F5F5F5  (page bg — hsl(0 0% 96.9%))
Card:          #FFFFFF  (white cards)
Border:        #E9EAEB  (card/input borders)
Muted text:    hsl(240 3.8% 46.1%)

Tier Expert:     #10b981 (green)
Tier Proficient: #3b82f6 (blue)
Tier Basic:      #f59e0b (amber)
Tier Failed:     #ef4444 (red)

Dimension colors:
  Accuracy:       #F66824 (orange, weight 35%)
  Safety:         #DB5F94 (pink, weight 20%)
  Reliability:    #3b82f6 (blue, weight 15%)
  Latency:        #10b981 (green, weight 10%)
  Process Quality:#f59e0b (amber, weight 10%)
  Schema Quality: #6941C6 (purple, weight 10%)
```

### Typography
```
Body:  DM Sans (Google Font) — weights: 400, 500, 600, 700
Mono:  Geist Mono (numbers, scores, code)
```

### Spacing & Radius
```
Border radius: 0.5rem (cards), 10px (nav pills), full (badges)
Page max-width: max-w-7xl (1280px)
Page padding: px-4 sm:px-6 lg:px-8 py-8
Card padding: p-4
Gap: 4 (cards grid), 6 (sections)
```

---

## Component Library

### 1. Navbar (fixed top, h-16)
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E9EAEB] bg-white/80 backdrop-blur-xl">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181D27]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">AgentTrust</span>
      </Link>

      {/* Nav items — active: bg-[#181D27] text-white, hover same */}
      <div className="flex items-center gap-1">
        {/* Each item: rounded-[10px] px-3 py-2 text-sm font-medium */}
        <Link className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium bg-[#181D27] text-white">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        {/* ... more nav items */}

        {/* Status dot: green=LIVE, amber=OFFLINE */}
        <div className="ml-2 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span className="text-[10px] text-[#10b981] font-medium">LIVE</span>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### 2. Score Gauge (animated circular progress)
```tsx
// SVG circle with animated stroke-dashoffset, color from tier
<svg width={80} height={80} className="-rotate-90">
  <circle r={37} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/30" />
  <circle r={37} fill="none" stroke={tierColor} strokeWidth={6}
    strokeDasharray={circumference} strokeDashoffset={offset}
    strokeLinecap="round" className="transition-all duration-1000 ease-out"
    style={{ filter: `drop-shadow(0 0 4px ${tierColor}30)` }} />
</svg>
// Score number centered inside
<span className="text-lg font-bold font-mono tabular-nums" style={{ color: tierColor }}>{score}</span>
```

### 3. Tier Badge (pill)
```tsx
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border"
  style={{ backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.4)", color: "#10b981" }}>
  Expert
</span>
```

### 4. Trust Level Badge (shield + label)
```tsx
<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
  style={{ backgroundColor: "rgba(246,104,36,0.08)", borderColor: "rgba(246,104,36,0.3)", color: "#F66824" }}>
  <ShieldCheck className="h-3 w-3" />
  Certified
</span>
```

### 5. Dimension Bars (horizontal progress)
```tsx
<div className="space-y-1">
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">Accuracy</span>
    <span className="font-mono font-medium tabular-nums" style={{ color: "#F66824" }}>85</span>
  </div>
  <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-700 ease-out"
      style={{ width: "85%", backgroundColor: "#F66824", boxShadow: "0 0 4px #F6682425" }} />
  </div>
</div>
```

### 6. Radar Chart (6-axis, Recharts)
```tsx
<ResponsiveContainer width="100%" height={280}>
  <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
    <PolarGrid stroke="rgba(0,0,0,0.08)" />
    <PolarAngleAxis dataKey="axis" tick={{ fill: "#535862", fontSize: 11 }} />
    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#717680", fontSize: 9 }} />
    <Radar dataKey="value" stroke="#F66824" fill="#F66824" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3 }} />
  </RadarChart>
</ResponsiveContainer>
```

### 7. Trust Certificate (card with gradient)
```tsx
<div className="relative overflow-hidden rounded-xl border p-5 bg-gradient-to-br from-[#F66824]/[0.04] to-white"
  style={{ borderColor: "rgba(246,104,36,0.3)", boxShadow: "0 4px 24px rgba(246,104,36,0.08)" }}>
  {/* Decorative corner */}
  <div className="absolute top-0 right-0 w-28 h-28 opacity-[0.06]"
    style={{ background: "radial-gradient(circle at top right, #F66824, #DB5F94 50%, transparent 70%)" }} />
  {/* Shield icon + level name + tagline + check marks + score */}
</div>
```

### 8. KPI Card
```tsx
<Card className="bg-white shadow-sm border-[#E9EAEB] card-hover">
  <CardContent className="p-4">
    <div className="flex items-center gap-2 mb-2">
      <BarChart3 className="h-4 w-4" style={{ color: "#F66824" }} />
      <span className="text-xs text-muted-foreground">Total Evaluations</span>
    </div>
    <div className="text-2xl font-bold font-mono tabular-nums">42</div>
  </CardContent>
</Card>
```

### 9. Brand Gradient
```css
.brand-gradient { background: linear-gradient(to right, #F66824, #DB5F94); }
.brand-gradient-text {
  background: linear-gradient(to right, #F66824, #DB5F94);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Dashboard Page Structure (main page to redesign)

```
┌─────────────────────────────────────────────────────┐
│ NAVBAR (fixed, glassmorphism)                        │
│ [Logo] AgentTrust    [Dashboard][Evaluate]...[●LIVE] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ HERO SECTION                                         │
│ AgentTrust Dashboard (gradient text)                 │
│ Pre-payment quality verification for AI agents...    │
│ [■ Evaluate Agent] [○ Leaderboard]                  │
│                                                      │
│ KPI CARDS (6 columns)                                │
│ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐   │
│ │Total ││Avg   ││Pass  ││Expert││Avg   ││Tools │   │
│ │Evals ││Score ││Rate  ││Count ││Time  ││Tested│   │
│ │ 15   ││74/100││87%   ││ 4    ││ 17s  ││ 48   │   │
│ └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘   │
│                                                      │
│ TWO COLUMNS                                          │
│ ┌─────────────────┐ ┌─────────────────┐             │
│ │ Tier Distribution│ │Eval Standards   │             │
│ │ Expert   ▓▓▓ 27%│ │• Multi-Judge    │             │
│ │ Profic.  ▓▓▓ 47%│ │• 6-Axis Scoring │             │
│ │ Basic    ▓▓  13%│ │• Adversarial    │             │
│ │ Failed   ▓▓  13%│ │• AQVC Attest.   │             │
│ └─────────────────┘ │• Anti-Gaming    │             │
│                      └─────────────────┘             │
│                                                      │
│ RECENT EVALUATIONS (3 columns)                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │DeepWiki  │ │Context7  │ │HuggingFace│             │
│ │SSE 3tool │ │HTTP 2tool│ │HTTP 5tool │             │
│ │[Expert]  │ │[Expert]  │ │[Proficient│             │
│ │    (89)  │ │    (86)  │ │     (82)  │             │
│ └──────────┘ └──────────┘ └──────────┘             │
│                                                      │
│ RECENT BATTLES                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │A vs B    │ │C vs D    │ │E vs F    │             │
│ │85  VS 72 │ │91  VS 78 │ │65  VS 65 │             │
│ │ 🏆 A wins│ │ 🏆 C wins│ │  Draw    │             │
│ └──────────┘ └──────────┘ └──────────┘             │
│                                                      │
│ HOW IT WORKS (4 columns)                             │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                            │
│ │ 1 │ │ 2 │ │ 3 │ │ 4 │                            │
│ │Con│ │Dis│ │Eva│ │Att│                            │
│ │nec│ │cov│ │lua│ │est│                            │
│ │t  │ │er │ │te │ │   │                            │
│ └───┘ └───┘ └───┘ └───┘                            │
│                                                      │
│ FOOTER                                               │
│ AgentTrust v1.0 — Built by Assisterr                │
└─────────────────────────────────────────────────────┘
```

---

## Mock Data (for realistic preview)

```json
{
  "kpis": {
    "totalEvaluations": 15,
    "averageScore": 74,
    "passRate": 87,
    "expertCount": 4,
    "avgEvalTime": "17s",
    "toolsTested": 48,
    "tierDistribution": { "expert": 4, "proficient": 7, "basic": 2, "failed": 2 }
  },
  "recentEvals": [
    { "name": "Semgrep",        "score": 91, "tier": "expert",     "tools": 2, "transport": "HTTP", "duration": "6.5s" },
    { "name": "DeepWiki",       "score": 89, "tier": "expert",     "tools": 3, "transport": "HTTP", "duration": "12.4s" },
    { "name": "Stripe MCP",     "score": 88, "tier": "expert",     "tools": 8, "transport": "SSE",  "duration": "16.7s" },
    { "name": "Context7",       "score": 86, "tier": "expert",     "tools": 2, "transport": "HTTP", "duration": "8.7s" },
    { "name": "OpenZeppelin",   "score": 84, "tier": "proficient", "tools": 4, "transport": "HTTP", "duration": "14.3s" },
    { "name": "HuggingFace",    "score": 82, "tier": "proficient", "tools": 5, "transport": "HTTP", "duration": "18.2s" }
  ],
  "dimensions6axis": {
    "accuracy":        { "weight": "35%", "color": "#F66824" },
    "safety":          { "weight": "20%", "color": "#DB5F94" },
    "reliability":     { "weight": "15%", "color": "#3b82f6" },
    "latency":         { "weight": "10%", "color": "#10b981" },
    "process_quality": { "weight": "10%", "color": "#f59e0b" },
    "schema_quality":  { "weight": "10%", "color": "#6941C6" }
  },
  "trustLevels": [
    { "level": "verified",  "analogy": "Domain Validated (DV)",   "time": "~30s",  "judges": 1 },
    { "level": "certified", "analogy": "Org Validated (OV)",      "time": "~90s",  "judges": "optimized" },
    { "level": "audited",   "analogy": "Extended Validation (EV)","time": "~3min", "judges": "2-3 consensus" }
  ],
  "qualityTiers": [
    { "tier": "expert",     "range": "85-100", "color": "#10b981" },
    { "tier": "proficient", "range": "70-84",  "color": "#3b82f6" },
    { "tier": "basic",      "range": "50-69",  "color": "#f59e0b" },
    { "tier": "failed",     "range": "0-49",   "color": "#ef4444" }
  ]
}
```

---

## Redesign Notes

**Brand transition: AgentTrust → Laureum**

- Replace "AgentTrust" with "Laureum" everywhere
- Consider laurel wreath motif for logo (instead of Shield icon)
- Tier badges could incorporate laurel/crown elements:
  - Expert → Gold laurel wreath
  - Proficient → Silver laurel
  - Basic → Bronze laurel
  - Failed → No laurel
- Trust certificates: "Laureum Verified" / "Laureum Certified" / "Laureum Audited"
- The word "laureate" (лауреат) = competition winner — fits the battle arena theme

**What to keep:**
- 6-axis evaluation concept
- Score gauges (circular progress)
- Tier system (4 levels)
- Trust level system (3 levels, SSL analogy)
- Card-based layout
- Clean, data-dense dashboard

**What to improve:**
- More premium/institutional feel (this is a certification authority, not a toy)
- Better hero section (current one is minimal)
- More visual hierarchy
- The laurel wreath should be a recurring design element
