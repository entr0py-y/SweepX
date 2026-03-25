# SweepX — Design Tokens

## CSS Custom Properties

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#7CFF3B` | Primary neon green accent |
| `--accent-dim` | `rgba(124,255,59,0.10)` | Tinted backgrounds |
| `--accent-glow` | `rgba(124,255,59,0.30)` | Box-shadow / text-shadow glow |
| `--accent-border` | `rgba(124,255,59,0.14)` | Featured card borders |
| `--accent-red` | `#FF4D6D` | Error / rejection state |
| `--bg` | `#000000` | Pure black background |
| `--card-bg` | `rgba(255,255,255,0.03)` | Glass card fill |
| `--card-border` | `rgba(255,255,255,0.08)` | Glass card border |
| `--card-radius` | `22px` | Card corner radius |
| `--text-primary` | `#ffffff` | Headings, values |
| `--text-secondary` | `rgba(255,255,255,0.45)` | Labels, subtitles |
| `--text-muted` | `rgba(255,255,255,0.22)` | Placeholders, hints |
| `--blur` | `blur(20px)` | Glassmorphism backdrop |
| `--nav-bg` | `rgba(0,0,0,0.65)` | Floating nav background |
| `--surface` | `rgba(255,255,255,0.03)` | Surface level 1 |
| `--surface-2` | `rgba(255,255,255,0.06)` | Surface level 2 |
| `--surface-3` | `rgba(255,255,255,0.09)` | Surface level 3 |
| `--featured-bg` | `rgba(124,255,59,0.04)` | Featured/highlighted cards |
| `--featured-border` | `rgba(124,255,59,0.14)` | Featured card borders |

## Typography

| Element | Size | Weight | Color | Extra |
|---|---|---|---|---|
| Hero stat value | 28px | 700 | `var(--accent)` | `text-shadow: 0 0 30px var(--accent-glow)` |
| Section heading | 18px | 700 | white | `letter-spacing: -0.02em` |
| Card label | 11px | 600 | `var(--text-muted)` | `letter-spacing: 0.08em; uppercase` |
| Card metric | 28px | 700 | white or accent | `font-variant-numeric: tabular-nums` |
| Body text | 14px | 400 | `var(--text-secondary)` | |
| Nav label | hidden | — | — | Labels hidden in pill nav |
| Badge text | 11px | 600 | per-status | `border-radius: 12px` |
| Primary button | 15px | 700 | `#000` | On `var(--accent)` bg |

## Font Stack

```
-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif
```

## Glass Card Mixin

```css
background: var(--card-bg);
border: 1px solid var(--card-border);
backdrop-filter: var(--blur);
-webkit-backdrop-filter: var(--blur);
border-radius: var(--card-radius);
box-shadow: 0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.4);
```
