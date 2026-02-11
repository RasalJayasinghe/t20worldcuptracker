# T20 World Cup Live Tracker & Prediction Dashboard

A responsive one-page web app that displays **real-time T20 World Cup standings**, match results, and **AI-powered qualification predictions** using Monte Carlo simulation.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-6-5a67d8)

---

## Features

| Feature | Description |
|---|---|
| **Live Standings** | Group-stage points table with NRR, colour-coded qualifying positions |
| **Match Feed** | Recent results & upcoming fixtures in card layout |
| **Predictions** | Monte Carlo simulation (10 000 runs) for Super 8, SF, Final & Champion probabilities |
| **Web Scraper** | Cheerio-based scraper targeting ESPNcricinfo – no paid API needed |
| **Auto Refresh** | Configurable polling interval (default 5 min) |
| **Responsive** | Mobile-first dark theme with Tailwind CSS |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** SQLite via Prisma ORM (zero config)
- **Data:** Web scraping with Axios + Cheerio
- **Charts:** Recharts (ready for integration)
- **Predictions:** Monte Carlo simulation engine (TypeScript)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push database schema (creates SQLite file)
npx prisma db push

# 3. Seed with sample T20 World Cup data
npm run db:seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── standings/route.ts   # GET group standings
│   │   ├── matches/route.ts     # GET recent & upcoming matches
│   │   ├── predictions/route.ts # GET/compute predictions
│   │   └── refresh/route.ts     # POST trigger scrape + recompute
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main dashboard (client component)
├── components/
│   ├── HeroHeader.tsx           # Tournament banner + refresh button
│   ├── PointsTable.tsx          # Grouped standings tables
│   ├── MatchFeed.tsx            # Match result/fixture cards
│   ├── PredictionsPanel.tsx     # Probability bars by stage
│   └── Footer.tsx               # Data source & sync status
├── hooks/
│   └── useAutoRefresh.ts        # Polling hook
└── lib/
    ├── db.ts                    # Prisma client singleton
    ├── predictions.ts           # Monte Carlo engine
    ├── scraper.ts               # ESPNcricinfo web scraper
    ├── seed.ts                  # Database seed script
    └── types.ts                 # Shared TypeScript types
```

---

## Configuration

All config lives in `.env`:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `SCRAPE_URL_STANDINGS` | ESPN URL | Points table page to scrape |
| `SCRAPE_URL_MATCHES` | ESPN URL | Match schedule page to scrape |
| `NEXT_PUBLIC_REFRESH_INTERVAL_MS` | `300000` | Dashboard auto-refresh (ms) |

---

## Updating for a New Tournament

1. Update the team list and groups in `src/lib/seed.ts`
2. Update the ESPN URLs in `.env` to point to the new series
3. Re-run `npm run db:seed`
4. The scraper selectors in `src/lib/scraper.ts` may need adjusting if ESPN changes their DOM

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/standings` | Current group standings |
| GET | `/api/matches` | Recent results + upcoming fixtures |
| GET | `/api/predictions` | Qualification probabilities |
| POST | `/api/refresh` | Trigger scrape + recompute predictions |

---

## Prediction Engine

The Monte Carlo simulator:

1. Takes current standings + remaining fixtures
2. Runs **10 000 simulations** of all remaining matches
3. Win probabilities based on: win-rate, NRR, points-per-match
4. Counts qualification frequency across all simulations
5. Returns percentage probabilities for each stage

Extensible to incorporate:
- Head-to-head records
- Venue/conditions weighting
- Player-level data (ML model)

---

## License

MIT
