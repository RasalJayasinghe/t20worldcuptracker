// ── Shared types used across server & client ─────────────

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  group: string;
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  shortName: string;
  flag: string;
  group: string;
  stage: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
  position: number | null;
}

export interface MatchInfo {
  id: string;
  matchNum: number | null;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  date: string | null;
  venue: string | null;
  status: "upcoming" | "live" | "completed";
  stage: string;
  group: string | null;
  homeScore: string | null;
  awayScore: string | null;
  result: string | null;
  winnerId: string | null;
}

export interface PredictionRow {
  teamId: string;
  teamName: string;
  shortName: string;
  flag: string;
  group: string;
  super8Prob: number;
  semiFinalProb: number;
  finalProb: number;
  winnerProb: number;
  confidence: number;
}

export interface GroupStandings {
  group: string;
  standings: StandingRow[];
}

export interface DashboardData {
  groups: GroupStandings[];
  recentMatches: MatchInfo[];
  upcomingMatches: MatchInfo[];
  predictions: PredictionRow[];
  lastUpdated: string;
}

// ── Scraper raw types (before DB normalisation) ──────────

export interface ScrapedStanding {
  teamName: string;
  group: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
}

export interface ScrapedMatch {
  homeTeam: string;
  awayTeam: string;
  date: string | null;
  venue: string | null;
  status: "upcoming" | "live" | "completed";
  stage: string;
  group: string | null;
  homeScore: string | null;
  awayScore: string | null;
  result: string | null;
  winner: string | null;
}
