# Mystic Sharing System

This document describes the shareable result cards system implemented for Runes & Numerology in the Mystic app.

## Overview

The sharing system allows users to:
- Save branded OG images of their ritual results
- Share privacy-safe deep links to public result pages
- Generate social media previews with proper metadata

## Architecture

### 1. Content Helpers (`src/lib/share/text.ts`)
- `truncateMeaning()` - Safely truncates text without cutting mid-word
- `formatDateUTC()` - Formats dates for display
- `formatDateForUrl()` - Formats dates for URL parameters
- `getShareTitle()` - Generates share titles
- `getShareDescription()` - Generates share descriptions

### 2. Link Builders (`src/lib/share/links.ts`)
- `runeShareUrl()` - Generates share URLs for rune results
- `numberShareUrl()` - Generates share URLs for numerology results
- `compatShareUrl()` - Generates share URLs for compatibility results
- `*OgUrl()` - Generates OG image URLs for each type
- `addUtmParams()` - Adds analytics tracking parameters

### 3. OG Image Endpoints (`src/app/api/og/`)
- **Rune OG** (`/api/og/rune`) - Renders rune symbols with meanings
- **Number OG** (`/api/og/number`) - Renders numerology numbers with meanings
- **Compat OG** (`/api/og/compat`) - Renders compatibility scores
- Uses `@vercel/og` for server-side image generation
- Returns 1200x630 images optimized for social media

### 4. Public Share Pages (`src/app/share/`)
- **Rune Share** (`/share/rune/[runeId]`) - Public rune result pages
- **Number Share** (`/share/number/[numId]`) - Public numerology result pages
- **Compat Share** (`/share/compat`) - Public compatibility result pages
- Include proper OpenGraph and Twitter metadata
- No authentication required to view
- Include "Open in Mystic" CTAs

### 5. Share UI Component (`src/components/share/ShareRow.tsx`)
- **Save Image** button - Downloads OG image as PNG
- **Share Link** button - Uses Web Share API or clipboard fallback
- Privacy notice - "No personal data is shared"
- Analytics tracking for all share events

### 6. Analytics (`src/lib/analytics/share.ts`)
- Tracks share open, download, and link events
- Uses Google Analytics gtag events
- Categorizes by content type and sharing method

## Integration Points

### Rune Panels
- **Daily Rune** - Shows ShareRow after rune is revealed
- **Spread2** - Shows ShareRow after both cards are flipped (shares first rune)
- **Spread3** - Shows ShareRow after all cards are flipped (shares first rune)

### Numerology Panels
- **Daily Number** - Shows ShareRow after number is revealed
- **Deep Reading** - Shows ShareRow after deep result is displayed
- **Compatibility** - Shows ShareRow after compatibility score is calculated

## Privacy & Safety

- **No Personal Data** - Share pages and OG images contain no user names, emails, or personal info
- **Compatibility Privacy** - Only shows score percentage, no partner names
- **UTC Dates** - All dates are UTC-based for consistency
- **Public Access** - Share pages are publicly accessible without authentication

## Theme Consistency

- Uses only shadcn design tokens
- `bg-background`, `text-foreground`, `border-border`, `ring-ring`
- `text-yellow-400` for accent colors
- No raw hex values

## URL Structure

### Rune Shares
```
/share/rune/{runeId}?rev={0|1}&d={YYYY-MM-DD}
/api/og/rune?runeId={runeId}&rev={0|1}&d={YYYY-MM-DD}
```

### Number Shares
```
/share/number/{numId}?d={YYYY-MM-DD}&mode={daily|deep}
/api/og/number?numId={numId}&d={YYYY-MM-DD}&mode={daily|deep}
```

### Compatibility Shares
```
/share/compat?score={0-100}&d={YYYY-MM-DD}
/api/og/compat?score={0-100}&d={YYYY-MM-DD}
```

## Dependencies

- `@vercel/og` - Server-side OG image generation
- `lucide-react` - Icons for share buttons
- `framer-motion` - Animations for share UI
- `next/link` - Navigation for CTAs

## Installation

1. Install dependencies:
```bash
npm install @vercel/og
```

2. Set environment variable:
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Usage

The ShareRow component automatically appears in ritual panels after results are revealed. Users can:

1. **Save Image** - Downloads a branded PNG of their result
2. **Share Link** - Opens native share dialog or copies URL to clipboard

## Analytics Events

- `share_open` - When share UI is displayed
- `share_download` - When image is downloaded
- `share_link` - When link is shared (webshare or copy)

All events include content type (`rune`, `number`, `compat`) and context information.
