# UI Redesign Research — Laureum.ai (Quality Oracle Demo)

**Date:** 2026-03-20
**Reference Sites:** buildinamsterdam.com, helloelva.com, appart.agency, magicjohns.com
**CEO Direction:** Syne + Inter fonts, orange accent, dark/light sections, custom cursor, scroll reveals

---

## 1. Key Findings from Reference Sites

### Common Patterns Across All 4 Sites

| Pattern | Build in Amsterdam | Hello Elva | Appart Agency | Magic John's |
|---------|-------------------|------------|---------------|--------------|
| **Custom display font** | Neue Haas Grotesk DSPro | Basis Grotesque | Neue Haas Grotesk | Magicon Black |
| **Body font** | Reckless Neue (serif) | Basis (same) | Neue Haas Grotesk (same) | Helvetica |
| **Uppercase headings** | Yes | ALL text uppercase | Yes (headings) | Yes (headings) |
| **Tight letter-spacing** | -0.04em | -0.06em to -0.08em | -0.04em to -2.28px | Normal |
| **Tight line-height** | 0.85 | 0.82-1.0 | 0.96 | 0.9em |
| **Zero border-radius** | Yes | Yes | Yes | No (Wix) |
| **No shadows** | Yes | Yes | Yes (minimal) | No (Wix) |
| **No gradients** | Yes | Yes | Yes | No |
| **mix-blend-mode** | exclusion (cursor) | difference (header) | No | No |
| **Custom cursor** | Yes (grab) | Yes (follower) | Yes (follower) | No |
| **Dark/light sections** | Subtle | No (monochrome) | Yes (red/grey) | Yes (dark/pink) |
| **Full-viewport hero** | Yes (100dvh, sticky) | Yes (vw typography) | Yes (100vh) | Yes (553px) |
| **Generous whitespace** | Very generous | Extremely generous | Generous | Moderate |
| **Single accent color** | Terracotta #C38133 | Terracotta #A25B4C | Orange #E2754D | Red #F50004 |
| **Warm neutrals** | Off-white #F2EFE6 | Light gray #ECECEC | Warm grey #F1EFED | Salmon #FFCDCC |
| **Custom easing** | cubic-bezier(0.45,0.02,0.09,0.98) | 0.52s cubic-bezier(0.445,0.05,0.55,0.95) | GSAP ScrollTrigger | Standard |
| **Scroll animations** | Parallax, sticky | Character-by-character | Word-by-word, sticky | None |
| **Text scramble/reveal** | No | Character reveal | Text scramble effect | No |
| **Hidden scrollbar** | No | No | Yes | No |

### Design Tokens to Extract

**Colors (inspired by appart.agency — closest to CEO direction):**
```css
--color-brand:       #E2754D   /* Warm orange (matches CEO's index.html) */
--color-dark:        #0E0E0C   /* Near-black (CEO spec) */
--color-off-white:   #F5F5F3   /* Warm off-white (CEO spec) */
--color-warm-grey:   #F1EFED   /* Light sections */
--color-text:        #151515   /* Primary text */
--color-text-muted:  #535862   /* Secondary text */
```

**Typography (CEO direction: Syne + Inter):**
```css
--font-display: 'Syne', sans-serif;     /* Headings, 600-800 weight */
--font-body: 'Inter', sans-serif;        /* Body, 300-600 weight */
```

**Easing (from buildinamsterdam — most polished):**
```css
--ease-primary: cubic-bezier(0.45, 0.02, 0.09, 0.98);
--ease-aggressive: cubic-bezier(0.19, 1, 0.22, 1);
```

---

## 2. Current State vs. Target

### What's Wrong Now (CEO Feedback)
1. **"Looks AI-generated"** — DM Sans + standard shadcn/ui cards = generic v0/template feel
2. **No personality** — Missing bold typography, custom effects, editorial feel
3. **No value communication** — Dashboard doesn't show what users GET (badge, attestation)
4. **No traction numbers** — Missing stats that build trust (total evals, agents scored)
5. **Standard cards/shadows** — Every AI tool looks like this. No differentiation
6. **No scroll effects** — Static page, no engagement, no delight

### Target Feel
- **buildinamsterdam.com**: Typographic confidence, editorial restraint, sticky hero
- **helloelva.com**: Mix-blend-mode header, massive type, monochrome discipline
- **appart.agency**: Text scramble, GSAP scroll, warm orange palette (closest to our brand)
- **magicjohns.com**: Bold personality, unconventional colors, fixed background depth

---

## 3. Transferable UI Techniques

### High-Impact, Low-Effort (Phase 1)
| Technique | Source | Implementation |
|-----------|--------|---------------|
| **Syne + Inter fonts** | CEO direction | `next/font/google`, CSS variables |
| **Tight letter-spacing on headings** | All 4 sites | `-0.04em` to `-0.06em` on display text |
| **Tight line-height on headings** | All 4 sites | `0.85-0.95` for display, `1.1` for subheads |
| **Uppercase section labels** | 3/4 sites | `uppercase tracking-widest text-xs` for labels |
| **Warm off-white background** | All 4 sites | `#F5F5F3` instead of cool `hsl(0 0% 96.9%)` |
| **Near-black for dark sections** | 3/4 sites | `#0E0E0C` instead of `#181D27` |
| **Remove card shadows** | 3/4 sites | Border-only cards, no `shadow-sm` |
| **Reduce border-radius** | 3/4 sites | `rounded-lg` → `rounded-sm` or `rounded-none` |

### Medium-Impact, Medium-Effort (Phase 2)
| Technique | Source | Implementation |
|-----------|--------|---------------|
| **Full-viewport hero** | All 4 sites | `min-h-screen` hero with clear value prop |
| **Dark/light alternating sections** | appart, buildinamsterdam | Dark `#0E0E0C` sections with light text |
| **Stats bar with live data** | CEO direction | Animated counter strip below hero |
| **Scroll reveal animations** | buildinamsterdam, appart | IntersectionObserver + `fade-up` |
| **Feature ticker/marquee** | appart, helloelva | CSS `@keyframes` infinite translateX |
| **Custom easing curve** | buildinamsterdam | Single `cubic-bezier(0.45,0.02,0.09,0.98)` everywhere |

### High-Impact, High-Effort (Phase 3)
| Technique | Source | Implementation |
|-----------|--------|---------------|
| **Text scramble on hero** | appart.agency | Custom JS class cycling through words |
| **mix-blend-mode: difference on nav** | helloelva | Nav auto-inverts over dark/light sections |
| **Custom cursor (orange dot + ring)** | CEO direction, buildinamsterdam | `position: fixed` element tracking mouse |
| **Sticky scroll sections** | buildinamsterdam, appart | `position: sticky` for "How It Works" |
| **Character-by-character text reveal** | helloelva | Split text + staggered animation on scroll |
| **Noise texture overlay** | CEO direction | SVG filter or PNG overlay at low opacity |

---

## 4. Phased Implementation Plan

### Phase 1: Design System Foundation (1-2 days)
**Goal:** Replace the template feel with premium typography and colors. No layout changes.

**Files to modify:**
- `src/app/layout.tsx` — Swap DM Sans → Syne + Inter
- `src/app/globals.css` — New CSS variables, remove cool grays, add warm palette
- `src/components/navbar.tsx` — Syne font for logo, tighter spacing
- All page files — Apply new typography classes

**Specific changes:**
```css
/* Typography */
--font-display: 'Syne', sans-serif;
--font-body: 'Inter', sans-serif;

/* Colors */
--color-bg: #F5F5F3;
--color-dark: #0E0E0C;
--color-brand: #E2754D;
--color-text: #151515;
--color-text-muted: #535862;
--color-border: #E5E3E0;

/* Effects */
--ease: cubic-bezier(0.45, 0.02, 0.09, 0.98);
```

**Typography rules:**
- All headings: Syne, weight 600-800, letter-spacing -0.04em, line-height 0.9
- Body: Inter, weight 400, letter-spacing normal, line-height 1.5
- Labels: Inter, weight 500, uppercase, tracking-widest, 11-12px
- Numbers: Geist Mono (keep for data), tabular-nums

**Card restyling:**
- Remove `shadow-sm`, use `border border-[#E5E3E0]` only
- Reduce border-radius: `rounded-xl` → `rounded-lg` or `rounded-sm`
- Card hover: subtle border darkening, no shadow

---

### Phase 2: Homepage Rebuild (2-3 days)
**Goal:** New landing page that communicates value. Dashboard becomes a sub-route.

**New homepage sections (top to bottom):**

1. **Hero** (100vh, warm-grey bg)
   - Syne bold headline: "Verify AI Agents Before You Pay"
   - Subheadline: Inter 20px, muted text
   - CTA button: "Evaluate Your Agent" → /evaluate
   - Optional: text scramble cycling "Verify / Benchmark / Certify"

2. **Ticker Strip** (dark bg, scrolling)
   - Infinite marquee: "Multi-Judge Consensus • 6-Axis Scoring • AQVC Attestation • ..."
   - White text on #0E0E0C, Syne font, uppercase

3. **Stats Bar** (warm-grey bg)
   - 4 KPIs in a row: Total Evaluations, Agents Scored, Pass Rate, Avg Eval Time
   - Numbers: Geist Mono, large (48px), animated count-up
   - Labels: Inter uppercase, muted, 12px
   - Data from: `GET /v1/scores?limit=100` aggregate or new `/v1/stats`

4. **How It Works** (white bg)
   - 4 steps: Connect → Discover → Evaluate → Attest
   - Horizontal layout on desktop, vertical on mobile
   - Each step: number (Syne bold) + icon + title + description
   - Connecting line between steps

5. **What You Get** (dark bg #0E0E0C, light text)
   - Three columns: Embeddable Badge | AQVC Attestation | Tier Classification
   - Badge preview: actual SVG from `/v1/badge/{id}.svg`
   - Attestation: JWT/VC card mockup
   - Tiers: Expert/Proficient/Basic visual

6. **6-Axis Framework** (warm-grey bg)
   - Radar chart (existing component, enlarged)
   - 6 dimension cards in 2x3 grid
   - Each: icon + name + weight + one-liner

7. **Leaderboard Preview** (white bg)
   - Top 5 agents from `/v1/scores`
   - Compact table: rank, name, score, tier badge
   - CTA: "View Full Leaderboard →"

8. **CTA Section** (brand orange bg #E2754D, white text)
   - "Ready to verify your agent?"
   - Large CTA button → /evaluate

9. **Footer** (dark bg #0E0E0C)
   - Logo, nav links, social links, "Built by Assisterr"

---

### Phase 3: Animations & Polish (1-2 days)
**Goal:** Add scroll effects and micro-interactions that make it feel premium.

**Scroll reveals:**
```tsx
// IntersectionObserver hook
function useScrollReveal(ref, options) {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
}
```

**CSS for reveals:**
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

**Text scramble (hero):**
- Cycle through: "Verify" → "Benchmark" → "Certify" → "Trust"
- Character morph through random symbols before resolving
- 3-second interval between words

**Ticker marquee:**
```css
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.ticker { animation: ticker 30s linear infinite; }
```

**Custom cursor (optional):**
- Orange dot (8px) + ring (32px) following mouse
- `position: fixed; pointer-events: none; z-index: 9999`
- Scale up on hover over interactive elements
- Only on desktop (`pointer: fine`)

**Noise overlay (optional):**
```css
.noise::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.03;
  background-image: url('/noise.svg');
  pointer-events: none;
  z-index: 100;
}
```

---

### Phase 4: Dashboard & Inner Pages (2-3 days)
**Goal:** Apply new design system to existing dashboard, leaderboard, evaluate, battle pages.

- Move current dashboard to `/dashboard` route
- Apply new typography and colors to all pages
- Update navbar with new font and styling
- Update cards, badges, tables with reduced radius/shadows
- Add scroll reveals to data-heavy pages
- Ensure responsive design at 375/768/1280px breakpoints

---

## 5. Design System Token Summary

```css
:root {
  /* Colors */
  --brand: #E2754D;
  --brand-dark: #C63B1E;
  --dark: #0E0E0C;
  --off-white: #F5F5F3;
  --warm-grey: #F1EFED;
  --text: #151515;
  --text-muted: #535862;
  --border: #E5E3E0;

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;

  /* Typography */
  --font-display: 'Syne', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'Geist Mono', monospace;

  /* Spacing */
  --section-gap: 120px;
  --content-max: 1280px;
  --content-pad: clamp(16px, 4vw, 64px);

  /* Effects */
  --ease: cubic-bezier(0.45, 0.02, 0.09, 0.98);
  --transition-fast: 250ms var(--ease);
  --transition-medium: 500ms var(--ease);
  --transition-slow: 800ms var(--ease);

  /* Radius (minimal) */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

---

## 6. Priority & Timeline

| Phase | Effort | Impact | Dependencies |
|-------|--------|--------|-------------|
| **Phase 1: Design System** | 1-2 days | High | None |
| **Phase 2: Homepage** | 2-3 days | Very High | Phase 1, backend `/v1/stats` endpoint |
| **Phase 3: Animations** | 1-2 days | Medium | Phase 2 |
| **Phase 4: Inner Pages** | 2-3 days | Medium | Phase 1 |

**Total: ~7-10 days**

**Recommendation:** Start with Phase 1 (immediate visual upgrade) → Phase 2 (new homepage is the highest-impact CEO deliverable) → Phase 3 (polish) → Phase 4 (consistency).

---

## 7. What NOT to Do

Based on the research, these patterns make sites feel "AI-generated" or "template-like":
- Standard card shadows (`shadow-sm`, `shadow-md`)
- Large border-radius (`rounded-xl`, `rounded-2xl`)
- Cool gray backgrounds (the default Tailwind/shadcn gray)
- DM Sans or Inter alone (too common in AI tools)
- Gradient backgrounds on cards
- Too many colors competing
- No custom easing (default `ease` or `ease-in-out`)
- Loading spinners instead of skeleton states
- No scroll effects (static page feel)
