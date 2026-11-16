# MatchPulse

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000000?style=for-the-badge&logo=expo&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-v6-black?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5.101-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-v5.0-443e38?style=for-the-badge)
![Target: Android](https://img.shields.io/badge/Target-Android_(API_24+)-3DDC84?style=for-the-badge&logo=android&logoColor=white)
> License: Not specified

<p align="center">
  <strong>Live football data, match insights, teams, players, leagues, and more â€” in a focused mobile experience.</strong>
</p>

</div>

---

MatchPulse is a modern, high-performance mobile football companion application engineered with React Native 0.81, Expo SDK 54, and TypeScript. Designed for football enthusiasts who demand speed and depth, MatchPulse provides real-time live scores, comprehensive fixture schedules, granular match details, squad listings, full player profiles with seasonal statistics, league standings tables, personal favorites, local kickoff reminders, and football news. Built on an offline-first architecture with persistent TanStack React Query caching via AsyncStorage, the application instantly hydrates cached data on cold launch and handles network transitions gracefully, delivering a resilient and responsive user experience even in poor network conditions.

---

## Table of Contents

- [Features](#features)
  - [1. Live Match Centre](#1-live-match-centre)
  - [2. Comprehensive Match Details](#2-comprehensive-match-details)
  - [3. Teams & Squads](#3-teams--squads)
  - [4. Real Player Profiles & Statistics](#4-real-player-profiles--statistics)
  - [5. Leagues & Standings](#5-leagues--standings)
  - [6. Search & Discovery](#6-search--discovery)
  - [7. Favorites Management](#7-favorites-management)
  - [8. Notifications & Match Reminders](#8-notifications--match-reminders)
  - [9. Offline Support & Cache Persistence](#9-offline-support--cache-persistence)
  - [10. Data Saver Mode](#10-data-saver-mode)
  - [11. Focus-Aware Live Auto-Refresh](#11-focus-aware-live-auto-refresh)
  - [12. Football News Architecture & Provider Plan State](#12-football-news-architecture--provider-plan-state)
- [Screens & Navigation](#screens--navigation)
  - [Navigation Structure](#navigation-structure)
  - [UI & Visual System](#ui--visual-system)
- [Architecture](#architecture)
  - [Layered System Architecture](#layered-system-architecture)
  - [System Architecture & Data Flow Diagram](#system-architecture--data-flow-diagram)
  - [Offline Cache Hydration & Network Synchronization](#offline-cache-hydration--network-synchronization)
- [Tech Stack](#tech-stack)
- [Data Flow Walkthroughs](#data-flow-walkthroughs)
  - [Flow 1: Live Fixtures & Auto-Refresh](#flow-1-live-fixtures--auto-refresh)
  - [Flow 2: Match Detail Multi-Query Hydration](#flow-2-match-detail-multi-query-hydration)
  - [Flow 3: Player Profile & Dynamic Season Resolution](#flow-3-player-profile--dynamic-season-resolution)
  - [Flow 4: Offline Cold Launch & Hydration](#flow-4-offline-cold-launch--hydration)
- [API Integration & Error Contracts](#api-integration--error-contracts)
  - [API-Football v3 REST Client](#api-football-v3-rest-client)
  - [HTTP 200 Error Payload Contracts](#http-200-error-payload-contracts)
  - [Dynamic Season Resolution Engine](#dynamic-season-resolution-engine)
  - [Conservative Quota Protection](#conservative-quota-protection)
- [Environment Variables](#environment-variables)
- [Getting Started & Local Setup](#getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Testing Offline Persistence via ADB](#testing-offline-persistence-via-adb)
- [Project Directory Structure](#project-directory-structure)
- [Verified Implementation State & Known Limitations](#verified-implementation-state--known-limitations)
  - [Engineering Verification Matrix](#engineering-verification-matrix)
  - [Provider Plan Constraints](#provider-plan-constraints)
- [License](#license)

---

## Features

### 1. Live Match Centre
- **Real-Time Scoreboards**: Live score updates, current match minute, and dynamic status badges (`1H`, `2H`, `HT`, `FT`, `ET`, `P`, `SUSP`, `INT`, `PST`, `CANC`).
- **Tri-State Filtering**: Seamless switching across **Live**, **Scheduled / Upcoming**, and **Finished / Recent** match lists.
- **Date Navigation**: Fast calendar-based day switcher to browse previous matchdays or preview upcoming fixtures across the calendar year.
- **Continuous Live Polling Engine**: Automatic 120-second polling while the relevant screen is focused; polling stops when the screen is unfocused or the app is backgrounded.

### 2. Comprehensive Match Details
- **Detailed Match Header**: Live score display, kickoff timestamp, referee assignment, stadium venue, city, and competition round.
- **Interactive Multi-Tab Interface**:
  - **Overview**: Recent 5-match form guide, head-to-head records, venue information, and referee metadata.
  - **Timeline / Events**: Chronological match feed featuring goals, assists, yellow/red cards, substitutions, and VAR decisions. Every player event links directly to the player's profile via verified player IDs.
  - **Statistics**: Side-by-side comparative progress bars for possession percentage, total shots, shots on target, expected goals (xG), fouls, corners, offsides, and pass accuracy.
  - **Lineups**: Starting XI formations (e.g., 4-3-3, 4-2-3-1), starting lineups with squad numbers, substitutes bench, and manager details.
  - **Predictions**: Match outcome probability distribution (Home / Draw / Away) and prediction insights where available from the provider.
- **Hybrid Data Support**: Automatically queries API-Football fixture endpoints, with graceful fallback to seeded local match data (`data/matchDetails.ts`) for offline or development fixtures.

### 3. Teams & Squads
- **Club Dossier**: Club crest, official name, country, founding year, and home stadium venue.
- **Season Fixture Schedule**: Complete team schedule and historical results filtered by supported seasons, replacing unsupported Free-tier API parameters (`last`/`next`) with verified season-based queries.
- **Roster & Squad Exploration**: Full squad categorized by role (Goalkeepers, Defenders, Midfielders, Forwards) with jersey numbers and direct navigation to Player Profiles.
- **Favorites Integration**: One-tap toggling to pin or unpin teams from the user's favorites collection.

### 4. Real Player Profiles & Statistics
- **API-Football Integration**: Direct resolution of real numeric player IDs (e.g., Onana `#545`, Mount `#19298`) retrieved from lineups, events, or squads.
- **Biographical Data**: Player headshot, age, birth date, nationality, physical measurements (height, weight), preferred position, and club jersey number.
- **Comprehensive Season Statistics**:
  - Appearances, starting lineups, total minutes played, average match rating.
  - Attacking output: Total goals, assists, penalty goals, total shots, shots on target.
  - Playmaking & Discipline: Total passes, key passes, pass accuracy %, fouls committed, yellow cards, red cards.
- **Deep-Link Navigation**: Accessible by tapping any player in Match Lineups, Match Events/Timeline, or Team Squad lists.
- **Local Fallback**: Gracefully falls back to seeded local players (`data/players.ts`) when operating with mock IDs or offline development fixtures.

### 5. Leagues & Standings
- **Major Competitions**: Browse top global competitions including Premier League (ID: 39), La Liga (ID: 140), Bundesliga (ID: 78), Serie A (ID: 135), Ligue 1 (ID: 61), UEFA Champions League (ID: 2), and FIFA World Cup (ID: 1).
- **Interactive Standings Table**: Full league tables with Rank, Club, Matches Played, Wins, Draws, Losses, Goals For/Against, Goal Difference, Points, and 5-game recent Form badges.
- **Top Scorers**: League top scorers table tracking player rankings, goals, penalties, and assists.
- **Season-Aware Queries**: Dynamically resolves league standings to the latest active season supported by the API plan.

### 6. Search & Discovery
- **Local Entity Search**: Fast, responsive search across seeded clubs, competitions, and players.
- **Recent Search History**: Persisted search query history powered by Zustand and AsyncStorage.
- **Direct Navigation**: Instantly jump from search results directly to Team, League, Player, or Match screens.
- *Note*: Search operates against locally cached and indexed entities; it does not issue arbitrary global API queries, conserving the daily request quota.

### 7. Favorites Management
- **Multi-Entity Pinning**: Pin favorite matches, teams, and leagues across the application.
- **AsyncStorage Persistence**: Stored via Zustand with persistence middleware (`matchpulse-favorites`).
- **Dedicated Favorites Filter**: Filter matches in the Matches tab to show only games featuring favorited teams or leagues.
- **Profile Hub**: Manage all saved favorites from the Profile tab with one-tap removal.

### 8. Notifications & Match Reminders
- **Local Kickoff Reminders**: Schedule match reminders directly on device using `expo-notifications`.
- **15-Minute Lead Time**: Notifications fire 15 minutes before match kickoff (`LEAD_MS = 15 * 60_000`).
- **Android Notification Channel**: Configured with high-priority channel `'matchpulse'` for reliable alert delivery.
- **In-App Notification Inbox**: Dedicated Notification Center (`app/notifications/index.tsx`) recording all triggered alerts.
- **Deep Linking**: Tapping a notification opens the app directly to the relevant Match Detail screen (`/match/[id]`).
- *Note*: Operates entirely on-device via local scheduling; does not require or communicate with an external push server.

### 9. Offline Support & Cache Persistence
- **TanStack React Query Cache Persistence**: Query state is serialized and persisted to `AsyncStorage` under the key `matchpulse-query-cache-v1`.
- **7-Day Maximum Cache Age**: Persisted data remains valid for up to 7 days (`MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60_000`).
- **Selective Dehydration**: Only successfully resolved user queries are persisted (`fixtures`, `fixture`, `standings`, `team`, `squad`, `topscorers`, `player`, `search`, `news`). In-flight errors and loading states are never persisted.
- **NetInfo Synchronization**: Real-time connection detection via `@react-native-community/netinfo` syncs with TanStack Query's `onlineManager`.
- **Fast Cold Launch Hydration**: Cache hydration executes on app startup with a 1000ms safety timeout race, ensuring the UI renders immediately even when offline.
- **Stale-While-Revalidate UX**: Stale cached data is rendered instantly while fresh data refetches in the background upon network restoration.
- **Visual Offline Banners**: Displays subtle, non-intrusive offline indicators when viewing cached data without connectivity.

### 10. Data Saver Mode
- **Bandwidth Optimization**: Dedicated toggle in Settings (`usePreferencesStore`).
- **Polling Deactivation**: Disables automatic background polling timers for live match lists and active match details.
- **Stale Time Extension**: Multiplies query cache freshness thresholds to reduce API overhead:
  - Live Fixtures: 60s &rarr; 5 minutes
  - Fixtures: 10 minutes &rarr; 30 minutes
  - Match Details: 90s &rarr; 5 minutes
  - Standings: 30 minutes &rarr; 2 hours
  - News: 30 minutes &rarr; 60 minutes
- **Pull-to-Refresh Support**: Manual swipe-to-refresh remains fully operational in Data Saver mode.

### 11. Focus-Aware Live Auto-Refresh
- **Active Match Detail Polling**: Refetches every 30 seconds (`livePollMs.matchDetail = 30_000`) when a match is currently live (`1H`, `2H`, `ET`).
- **Live Match List Polling**: Refetches every 120 seconds (`livePollMs.normal = 120_000`) on Home and Matches tabs to detect newly live fixtures.
- **Focus Awareness**: Uses `@react-navigation/native`'s `useIsFocused` to pause polling timers whenever the screen or tab is not active.
- **Background Protection**: `refetchIntervalInBackground: false` halts all network polling when the user switches to another mobile app.
- **Data Saver Integration**: Automatically disabled when Data Saver mode is active.

### 12. Football News Architecture (GNews Proxy — P9)

MatchPulse fetches football news through a self-hosted **Cloudflare Worker proxy** that
queries the [GNews Free tier](https://gnews.io/) and shields the API key from the client bundle.

- **Proxy service**: `services/news-proxy/` (independent from the Expo runtime)
  - Endpoints: `GET /health` · `GET /api/news`
  - Fixed upstream query: `q=football OR soccer&lang=en&max=10&sortby=publishedAt`
  - Cloudflare Response Cache: 30-minute TTL — conserves GNews Free quota (100 req/day)
  - Secret handling: `GNEWS_API_KEY` stored as a Cloudflare Worker secret; never in app bundle, URL, log, or committed file
- **Mobile app integration**:
  - DTO: `ProxyNormalizedArticle`, `ProxyNewsResponse` (`lib/api/dto/newsDto.ts`)
  - Mapper: `mapProxyArticles()` (`lib/api/mappers/mapNews.ts`)
  - Service: `fetchFootballNews()` (`lib/api/services/newsService.ts`) — uses `fetch()` (no Axios)
  - Repository: `footballRepository.news()` → same hook/UI as before
  - Hook: `useFootballNews(limit)` (`hooks/useFootballNews.ts`)
  - UI: `HomeNewsSection` + `NewsCard` — unchanged
- **Configuration**: Set `EXPO_PUBLIC_NEWS_PROXY_URL` in `.env` to the deployed Worker URL.
  If unset, `UnsupportedEndpointError` is thrown and the UI shows a neutral placeholder — no crash, no fabricated data.
- **GNews Free Plan Limits** (as documented):
  - 100 requests per day; up to 10 articles per request
  - Articles are subject to a **12-hour publication delay** relative to their original publication time
  - 30 days of historical data
  - Daily quota exhaustion returns HTTP 403 from GNews; the proxy converts this to HTTP 429 for the client so `QuotaExceededError` is raised correctly
- **Graceful Error Handling**: Full UI states for loading skeletons, proxy-not-configured, rate-limiting (429), authentication failure (502), and network errors, each with a retry button.

---

## Screens & Navigation

MatchPulse utilizes **Expo Router v6** for typed, file-based routing.

### Navigation Structure

```
app/
â”œâ”€â”€ _layout.tsx                     # Root provider layout (QueryClient, Persistence, Notifications, Theme)
â”œâ”€â”€ (tabs)/
â”‚   â”œâ”€â”€ _layout.tsx                 # Custom styled bottom navigation tab bar
â”‚   â”œâ”€â”€ index.tsx                   # Home screen (Live matches, today's games, news, shortcuts)
â”‚   â”œâ”€â”€ matches.tsx                 # Matches screen (Live, upcoming, finished, date picker)
â”‚   â”œâ”€â”€ leagues.tsx                 # Leagues screen (Browse major domestic & continental leagues)
â”‚   â””â”€â”€ profile.tsx                 # Profile & Favorites hub (Saved teams, leagues, matches)
â”œâ”€â”€ match/
â”‚   â””â”€â”€ [id].tsx                    # Match Detail (Header, Overview, Timeline, Stats, Lineups, Predictions)
â”œâ”€â”€ player/
â”‚   â””â”€â”€ [id].tsx                    # Player Profile (Biographical details, seasonal stats, ratings)
â”œâ”€â”€ team/
â”‚   â””â”€â”€ [id].tsx                    # Team Detail (Club dossier, season fixtures, full squad list)
â”œâ”€â”€ league/
â”‚   â””â”€â”€ [id].tsx                    # League Detail (Standings table, fixtures, top scorers)
â”œâ”€â”€ search/
â”‚   â””â”€â”€ index.tsx                   # Search modal (Instant filter, recent search history)
â”œâ”€â”€ settings/
â”‚   â””â”€â”€ index.tsx                   # Settings modal (Data Saver, live refresh, notifications, time format)
â”œâ”€â”€ notifications/
â”‚   â””â”€â”€ index.tsx                   # In-app Notification Center (History of triggered match alerts)
â””â”€â”€ dev/
    â””â”€â”€ index.tsx                   # Developer diagnostics (API call history, cache metrics, plan status)
```

### UI & Visual System

MatchPulse implements a custom dark sports aesthetic defined in `theme/`:

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `background` | `#0B0D12` | Deep OLED black base canvas |
| `surface` | `#151923` | Card and component surfaces |
| `surfaceElevated` | `#1C2230` | Modals, active states, elevated dropdowns |
| `surfaceHighlight` | `#232A3A` | Highlighted borders and selected tabs |
| `primary` | `#00E676` | Neon electric pitch green accent |
| `primaryMuted` | `#0F3D2A` | Background tint for active badges |
| `live` | `#FF4D4D` | Vibrant red for live match minutes and badges |
| `textPrimary` | `#FFFFFF` | Primary headers and high-contrast typography |
| `textSecondary` | `#B0B3B8` | Subtitles, metadata, timestamps, and muted labels |
| `border` | `#343A4A` | Thin structural card and divider borders |

- **Bottom Tab Navigation**: Implemented in `app/(tabs)/_layout.tsx` featuring custom icons (`Ionicons`), active green pills, label scaling, and safe area insets.
- **Glassmorphism & Modals**: Smooth slide and fade transitions for modal sheets (`search`, `settings`, `notifications`).

---

## Architecture

MatchPulse follows a **Clean, Layered Architecture** separating presentation, state management, repository abstraction, service orchestration, and network transport.

### Layered System Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   Presentation Layer                   â”‚
â”‚   Screens (app/) & Atomic Components (components/)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  State Management                      â”‚
â”‚   â€¢ Server State: TanStack React Query (hooks/)        â”‚
â”‚   â€¢ Client State: Zustand Stores (store/)              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Repository Layer                      â”‚
â”‚   footballRepository (lib/api/repository.ts)           â”‚
â”‚   â€¢ Decouples UI & hooks from API transport details    â”‚
â”‚   â€¢ Maps DTO schemas into strict Domain Models         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   Service Layer                        â”‚
â”‚   â€¢ fixturesService.ts   â€¢ newsService.ts              â”‚
â”‚   â€¢ seasonResolver.ts    â€¢ diagnostics.ts              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚               Network & Contract Layer                 â”‚
â”‚   apiFootballClient (lib/api/client.ts)                â”‚
â”‚   â€¢ Axios interceptors & HTTP 200 error parsing        â”‚
â”‚   â€¢ Typed error taxonomy & exponential backoff         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            External Provider / Storage                 â”‚
â”‚   â€¢ API-Football v3 REST API (remote)                  â”‚
â”‚   â€¢ AsyncStorage & NetInfo (local persistence)         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### System Architecture & Data Flow Diagram

```mermaid
flowchart TD
    subgraph UI ["Presentation Layer (React Native)"]
        Screen["Screen Component<br/>(app/match/[id].tsx)"]
        Components["UI Components<br/>(Timeline, Stats, Lineups)"]
    end

    subgraph State ["State & Query Engine"]
        Hook["Custom Query Hook<br/>(useFixtureDetails)"]
        QueryClient["TanStack Query Cache<br/>(Memory)"]
        Zustand["Zustand Store<br/>(Preferences, Favorites)"]
    end

    subgraph Repo ["Domain Repository & Mappers"]
        Repository["footballRepository<br/>(lib/api/repository.ts)"]
        Mappers["DTO Mappers<br/>(mapFixture, mapEvents, mapStats)"]
    end

    subgraph Services ["Service & Resolver Layer"]
        FixturesService["fixturesService.ts"]
        SeasonResolver["seasonResolver.ts"]
    end

    subgraph Network ["Network Transport & Contract"]
        ApiClient["apiFootballClient<br/>(Axios Instance)"]
        Interceptors["Response Interceptors<br/>(assertNoApiFootballErrors)"]
        Errors["Typed Error Contracts<br/>(UnsupportedEndpointError, QuotaExceededError)"]
    end

    subgraph Remote ["External API Provider"]
        ApiSports["API-Football v3<br/>https://v3.football.api-sports.io"]
    end

    Screen --> Hook
    Hook --> QueryClient
    Hook --> Repository
    Repository --> SeasonResolver
    Repository --> FixturesService
    FixturesService --> ApiClient
    ApiClient --> Remote
    Remote --> Interceptors
    Interceptors --> Errors
    Interceptors --> Mappers
    Mappers --> Repository
    Repository --> QueryClient
    QueryClient --> Screen
    Screen --> Components
    Screen --> Zustand
```

### Offline Cache Hydration & Network Synchronization

```mermaid
flowchart TD
    subgraph AppLifecycle ["App Lifecycle & Startup"]
        Boot["App Launch / Boot"]
        Hydrate["hydrateQueryClient()<br/>(Safety timeout: 1000ms)"]
        Attach["attachQueryPersistence()<br/>(App state & mutation listeners)"]
    end

    subgraph Storage ["Local Storage & Offline Engine"]
        AsyncStorage["AsyncStorage<br/>('matchpulse-query-cache-v1')"]
        PersisterFilter["shouldDehydrateQuery()<br/>(success status, allowed root keys)"]
    end

    subgraph QueryState ["TanStack Query Client"]
        ClientCache["QueryClient Cache"]
        OnlineMgr["onlineManager"]
    end

    subgraph Hardware ["Device Hardware & Connectivity"]
        NetInfo["@react-native-community/netinfo"]
    end

    Boot --> Hydrate
    Hydrate -->|Read serialized cache| AsyncStorage
    AsyncStorage -->|DehydratedState| Hydrate
    Hydrate -->|Hydrate state| ClientCache
    Boot --> Attach

    ClientCache -->|Query update/success| PersisterFilter
    PersisterFilter -->|Debounced write (1000ms)| AsyncStorage

    NetInfo -->|Network transition event| OnlineMgr
    OnlineMgr -->|Online: trigger refetch stale queries| ClientCache
```

---

## Tech Stack

| Category | Technology | Version | Purpose / Role in MatchPulse |
| :--- | :--- | :--- | :--- |
| **Runtime & Core** | **React Native** | `0.81.5` | Mobile framework with New Architecture enabled |
| **Framework** | **Expo** | `~54.0.37` | Managed developer tooling and native module ecosystem |
| **Language** | **TypeScript** | `~5.9.2` | End-to-end static type safety and contract enforcement |
| **Navigation** | **Expo Router** | `~6.0.24` | File-based, typed routing with dynamic parameters |
| **Server State** | **TanStack React Query** | `^5.101.4` | Asynchronous query caching, polling, and deduplication |
| **Client State** | **Zustand** | `^5.0.15` | Lightweight client state for favorites, preferences, and inbox |
| **Networking** | **Axios** | `^1.19.0` | HTTP client with request/response interceptors |
| **Offline Cache** | **AsyncStorage** | `2.2.0` | Serialized persistent storage for query cache and user state |
| **Connectivity** | **NetInfo** | `11.4.1` | Network reachability and online/offline event listener |
| **Notifications** | **Expo Notifications** | `~0.32.17` | Local notification scheduling and channel management |
| **Styling** | **NativeWind / Tailwind**| `^4.2.6` / `^3.4.19`| Utility-first styling synchronized with design tokens |
| **Animations** | **React Native Reanimated** | `~4.1.1` | Performant native animations for navigation and transitions |
| **Device Feedback**| **Expo Haptics** | `~15.0.8` | Haptic feedback for user interactions and toggles |
| **Icons** | **Expo Vector Icons** | `^15.1.1` | Ionicons and vector graphics across navigation and cards |
| **Data Provider** | **API-Football** | `v3 REST` | External provider for live scores, fixtures, stats, and teams |
| **Target Platform**| **Android** | `API 24+` | Primary native deployment target (OnePlus Nord, Emulators) |

---

## Data Flow Walkthroughs

### Flow 1: Live Fixtures & Auto-Refresh
```
Home / Matches Screen
  â”‚
  â”œâ”€â”€ 1. Calls useLiveFixtures({ poll: true, focused: true })
  â”‚
  â”œâ”€â”€ 2. Reads liveAutoRefresh and dataSaver from usePreferencesStore
  â”‚
  â”œâ”€â”€ 3. Evaluates shouldPollLiveList():
  â”‚      â€¢ poll === true
  â”‚      â€¢ focused === true (via useIsFocused)
  â”‚      â€¢ dataSaver === false
  â”‚      â€¢ liveAutoRefresh === true
  â”‚      &rarr; Returns 120,000ms polling interval
  â”‚
  â”œâ”€â”€ 4. Executes footballRepository.liveMatches()
  â”‚      &rarr; fixturesService.fetchLiveFixtures()
  â”‚      &rarr; apiFootballClient.get('/fixtures?live=all')
  â”‚
  â”œâ”€â”€ 5. Parses response via mapFixturesToMatches(response, { requireSupportedLeague: true })
  â”‚
  â””â”€â”€ 6. Updates React Query cache queryKeys.live
         &rarr; Re-renders scoreboards with live minute and status badges
```

### Flow 2: Match Detail Multi-Query Hydration
```
Match Detail Screen (app/match/[id].tsx)
  â”‚
  â”œâ”€â”€ 1. useFixtureDetails(id) triggers parallel TanStack queries:
  â”‚      â€¢ queryKeys.fixture(id)    &rarr; footballRepository.matchById(id)
  â”‚      â€¢ queryKeys.events(id)     &rarr; footballRepository.matchEvents(id)
  â”‚      â€¢ queryKeys.stats(id)      &rarr; footballRepository.matchStatistics(id)
  â”‚      â€¢ queryKeys.lineups(id)    &rarr; footballRepository.matchLineups(id)
  â”‚      â€¢ queryKeys.prediction(id) &rarr; footballRepository.matchPredictions(id)
  â”‚
  â”œâ”€â”€ 2. Parallel API requests dispatched via apiFootballClient
  â”‚      (or served instantly from dehydrated AsyncStorage cache)
  â”‚
  â”œâ”€â”€ 3. If fixture is live:
  â”‚      shouldPollLiveMatch() activates 30-second refetch interval
  â”‚
  â””â”€â”€ 4. Active tab renders:
         â€¢ Overview: Head-to-head, venue, referee
         â€¢ Timeline: Chronological events with clickable player profile links
         â€¢ Statistics: Possession, shots, xG side-by-side comparative bars
         â€¢ Lineups: Starting XI formations, tactical pitch, bench
         â€¢ Predictions: Outcome probability bars
```

### Flow 3: Player Profile & Dynamic Season Resolution
```
Tap Player in Lineup / Timeline / Squad
  â”‚
  â”œâ”€â”€ 1. Navigates to app/player/[id].tsx with numeric playerId (e.g., 545)
  â”‚
  â”œâ”€â”€ 2. Invokes usePlayerDetails(playerId)
  â”‚
  â”œâ”€â”€ 3. Calls resolvePlayerSeason(playerId):
  â”‚      â€¢ Checks account plan ceiling via getMaxAllowedSeason()
  â”‚      â€¢ Queries fetchPlayerSeasons(playerId)
  â”‚      â€¢ Selects newest season compatible with account plan (e.g., 2024 instead of 2026)
  â”‚
  â”œâ”€â”€ 4. Dispatches fetchPlayer(playerId, resolvedSeason)
  â”‚      &rarr; apiFootballClient.get(`/players?id=${playerId}&season=${season}`)
  â”‚
  â”œâ”€â”€ 5. mapPlayerProfile(apiPlayer) transforms DTO into Player domain model
  â”‚
  â””â”€â”€ 6. UI displays biographical card, radar-style metrics, attacking output, and discipline
```

### Flow 4: Offline Cold Launch & Hydration
```
Cold App Launch (No Active Network Connection)
  â”‚
  â”œâ”€â”€ 1. RootLayout initializes createQueryClient()
  â”‚
  â”œâ”€â”€ 2. Dispatches hydrateQueryClient(queryClient) in parallel with 1000ms safety race:
  â”‚      â€¢ Reads PERSISTENCE_KEY ('matchpulse-query-cache-v1') from AsyncStorage
  â”‚      â€¢ Validates cache timestamp against MAX_CACHE_AGE_MS (7 days)
  â”‚      â€¢ Hydrates dehydrated query cache into active QueryClient
  â”‚
  â”œâ”€â”€ 3. Screen components mount:
  â”‚      â€¢ useQuery finds cached data in memory immediately (status: 'success')
  â”‚      â€¢ Screens render instantly with cached fixtures, standings, and profiles
  â”‚
  â”œâ”€â”€ 4. NetInfo detects isConnected === false:
  â”‚      â€¢ onlineManager sets online status to false
  â”‚      â€¢ React Query suppresses background refetches
  â”‚      â€¢ Offline banner indicates cached state
  â”‚
  â””â”€â”€ 5. User reconnects to Wi-Fi / Cellular:
         â€¢ NetInfo fires online event &rarr; onlineManager.setOnline(true)
         â€¢ React Query triggers refetchOnReconnect for all stale queries
         â€¢ Cache is updated in background and persisted back to AsyncStorage
```

---

## API Integration & Error Contracts

MatchPulse connects directly to the **API-Football (API-SPORTS) v3 REST API**.

### API-Football v3 REST Client

The API client (`lib/api/client.ts`) is configured with:
- **Base URL**: `https://v3.football.api-sports.io`
- **Request Timeout**: 12,000ms
- **Authentication**: `x-apisports-key` header loaded from `process.env.EXPO_PUBLIC_API_FOOTBALL_KEY`
- **Telemetry Seam**: `recordApiCall` tracks request count, methods, and endpoints for runtime dev diagnostics.

### HTTP 200 Error Payload Contracts

A known architectural challenge with API-Football is that **plan rejections, invalid parameters, and quota exhaustion return HTTP 200 OK** with error details nested inside the response body:

```json
{
  "get": "players",
  "parameters": { "id": "545", "season": "2026" },
  "errors": {
    "plan": "Free plans do not have access to this season, try from 2022 to 2024."
  },
  "results": 0,
  "response": []
}
```

MatchPulse handles this via a centralized Axios response interceptor `assertNoApiFootballErrors` (`lib/api/errors.ts`):
1. **Parses the `errors` object**: Distinguishes true empty datasets (`results: 0, errors: []`) from errors (`errors: { plan: "..." }`).
2. **Throws Typed Domain Errors**:
   - `UnsupportedEndpointError`: Thrown on plan restrictions (e.g., season limits or `/news` endpoint).
   - `QuotaExceededError`: Thrown when daily quota is exhausted (100 requests/day limit reached).
   - `ApiFootballError`: Thrown on parameter validation or server-side API errors.

### Dynamic Season Resolution Engine

To prevent hardcoded calendar years from crashing on Free API-Football accounts, MatchPulse implements dynamic season resolution (`lib/api/seasonResolver.ts`):
- **Plan Auto-Detection**: Queries `/status` on first launch to inspect subscription tier.
- **Error Learning**: Automatically parses error messages containing `"try from \d{4} to (\d{4})"` to dynamically calibrate the maximum allowed season (`cachedMaxPlanSeason = 2024`).
- **Resource Season Resolution**: Before querying leagues, teams, or players, the resolver cross-references available seasons with the account plan ceiling to pick the latest accessible season.

### Conservative Quota Protection

To maximize the Free plan's 100 requests/day limit:
- **Smart Query Retries**: `shouldRetryQuery` suppresses retries on `UnsupportedEndpointError`, `QuotaExceededError`, 403, and 404 responses. Retries are restricted strictly to transient network timeouts or 5xx server errors with exponential backoff.
- **Long Cache Lifetimes**: Live data is cached for 60s (5m in Data Saver); non-live fixtures for 10m (30m in Data Saver); standings for 30m (2h in Data Saver); player profiles for 12 hours.

---

## Environment Variables

MatchPulse reads its API key at runtime through Expo's public environment variable mechanism.

### Configuration (`.env`)

Copy the example configuration to create your local `.env`:

```bash
cp .env.example .env
```

Define your API-Football key in `.env`:

```env
# Free API key from https://dashboard.api-football.com (Free plan: 100 requests/day).
# Must be prefixed with EXPO_PUBLIC_ to be inlined by Expo at build time.
EXPO_PUBLIC_API_FOOTBALL_KEY=your_actual_api_sports_key_here
```

> [!NOTE]
> `EXPO_PUBLIC_` variables are inlined into the client bundle at build time. The API client is architected behind the `footballRepository` interface, allowing a future secure backend proxy to replace direct client requests without altering any screen or component logic.

---

## Getting Started & Local Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node `v22.13.1`)
- **Package Manager**: `npm` (v9+) or `yarn`
- **Expo CLI**: Bundled with `npx expo`
- **Android Environment**:
  - Android Studio with Android SDK (API 24+)
  - A physical Android device with USB debugging enabled OR an Android Virtual Device (AVD)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pratham-M12/MatchPulse.git
   cd matchpulse
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Add your EXPO_PUBLIC_API_FOOTBALL_KEY to .env
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npm run typecheck
   ```

### Running the Application

1. **Start the Metro Bundler**:
   ```bash
   npm start
   ```

2. **Launch on Android**:
   ```bash
   npm run android
   ```

### Testing Offline Persistence via ADB

To test offline cache hydration on a connected physical Android device or emulator:

1. **Populate Cache**: Launch the app with internet access and browse Home, Matches, and a Match Detail screen.
2. **Disable Connectivity**:
   ```bash
   adb shell svc data disable
   adb shell svc wifi disable
   ```
3. **Restart the Application**:
   ```bash
   adb shell am force-stop com.anonymous.matchpulse
   adb shell am start -n com.anonymous.matchpulse/.MainActivity
   ```
4. **Observe Offline Hydration**: The app launches immediately, restores all previously viewed fixtures from `AsyncStorage`, and displays offline status indicators.
5. **Re-Enable Connectivity**:
   ```bash
   adb shell svc data enable
   adb shell svc wifi enable
   ```
6. **Observe Automatic Sync**: React Query detects network recovery and updates stale queries in the background.

---

## Project Directory Structure

```
matchpulse/
â”œâ”€â”€ app/                            # Expo Router file-based route hierarchy
â”‚   â”œâ”€â”€ (tabs)/                     # Main bottom tab screens
â”‚   â”‚   â”œâ”€â”€ _layout.tsx             # Custom styled tab navigation bar
â”‚   â”‚   â”œâ”€â”€ index.tsx               # Home tab (Live fixtures, news, shortcuts)
â”‚   â”‚   â”œâ”€â”€ matches.tsx             # Matches tab (Tri-state filter, date picker)
â”‚   â”‚   â”œâ”€â”€ leagues.tsx             # Leagues tab (Competitions catalog)
â”‚   â”‚   â””â”€â”€ profile.tsx             # Profile tab (Saved favorites, preferences)
â”‚   â”œâ”€â”€ match/[id].tsx              # Match Detail screen (Multi-tab fixture centre)
â”‚   â”œâ”€â”€ player/[id].tsx             # Player Profile screen (Stats, biographical info)
â”‚   â”œâ”€â”€ team/[id].tsx               # Team Profile screen (Roster, season schedule)
â”‚   â”œâ”€â”€ league/[id].tsx             # League Detail screen (Standings table, top scorers)
â”‚   â”œâ”€â”€ search/index.tsx            # Search modal & query history
â”‚   â”œâ”€â”€ settings/index.tsx          # Settings screen (Data Saver, polling controls)
â”‚   â”œâ”€â”€ notifications/index.tsx     # In-app notification center history
â”‚   â”œâ”€â”€ dev/index.tsx               # Dev diagnostics & telemetry
â”‚   â””â”€â”€ _layout.tsx                 # Root layout, QueryClient, and offline hydration
â”œâ”€â”€ components/                     # Modular presentation components
â”‚   â”œâ”€â”€ entity/                     # Reusable team and league presentation cards
â”‚   â”œâ”€â”€ home/                       # HomeHeader, MatchList, NewsSection, NewsCard
â”‚   â”œâ”€â”€ layout/                     # ScreenContainer, Header, OfflineBanner
â”‚   â”œâ”€â”€ league/                     # StandingsTable, LeagueCard
â”‚   â”œâ”€â”€ match/                      # MatchCard, MatchHeader, MatchTimeline, MatchStats
â”‚   â”œâ”€â”€ navigation/                 # TabBarIcon, BackButton
â”‚   â”œâ”€â”€ profile/                    # FavoritesList, SettingsItem
â”‚   â””â”€â”€ ui/                         # Badge, Button, ErrorState, EmptyState, Typography
â”œâ”€â”€ data/                           # Seeded local data for offline development
â”‚   â”œâ”€â”€ competitions.ts             # Supported competitions seed list
â”‚   â”œâ”€â”€ matchDetails.ts             # Comprehensive mock match details fallback
â”‚   â”œâ”€â”€ matches.ts                  # Mock live and scheduled matches
â”‚   â”œâ”€â”€ players.ts                  # Mock player profiles
â”‚   â””â”€â”€ teams.ts                    # Seeded team profiles
â”œâ”€â”€ hooks/                          # Custom TanStack React Query hooks
â”‚   â”œâ”€â”€ useFixtureDetails.ts        # Parallel fixture overview, timeline, stats, lineups
â”‚   â”œâ”€â”€ useFootballNews.ts          # News query hook with error contract handling
â”‚   â”œâ”€â”€ useLiveFixtures.ts          # Focus-aware live matches polling
â”‚   â”œâ”€â”€ usePlayerDetails.ts         # Season-aware real player profile query
â”‚   â”œâ”€â”€ useStandings.ts             # League table standings query
â”‚   â””â”€â”€ useTeamDetails.ts           # Team profile, squad, and season fixtures
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ api/                        # Network transport, repository, and services
â”‚   â”‚   â”œâ”€â”€ client.ts               # Axios instance with interceptors and error assertions
â”‚   â”‚   â”œâ”€â”€ currentSeason.ts        # Fallback season derivation
â”‚   â”‚   â”œâ”€â”€ diagnostics.ts          # Request logging and call counter
â”‚   â”‚   â”œâ”€â”€ errors.ts               # Error taxonomy and retry policy
â”‚   â”‚   â”œâ”€â”€ leagueIds.ts            # Mapping between internal and API-Football league IDs
â”‚   â”‚   â”œâ”€â”€ queryConfig.ts          # Centralized cache timings, stale times, and poll logic
â”‚   â”‚   â”œâ”€â”€ queryKeys.ts            # Centralized query key factory
â”‚   â”‚   â”œâ”€â”€ repository.ts           # Domain-facing football repository
â”‚   â”‚   â”œâ”€â”€ seasonResolver.ts       # Dynamic season resolution and plan detection
â”‚   â”‚   â”œâ”€â”€ dto/                    # API-Football JSON schema interfaces
â”‚   â”‚   â”œâ”€â”€ mappers/                # Transform DTOs into domain models
â”‚   â”‚   â””â”€â”€ services/               # Specialized API service modules
â”‚   â”œâ”€â”€ format/                     # Date, time, and score formatting utilities
â”‚   â”œâ”€â”€ notifications/              # Local notification handler and reminder scheduling
â”‚   â”œâ”€â”€ query/                      # React Query client, persistence, and NetInfo sync
â”‚   â””â”€â”€ storage/                    # AsyncStorage wrapper for Zustand middleware
â”œâ”€â”€ store/                          # Zustand client-state stores
â”‚   â”œâ”€â”€ useFavoritesStore.ts        # Pinned teams, leagues, and matches
â”‚   â”œâ”€â”€ useInboxStore.ts            # Notification history records
â”‚   â”œâ”€â”€ usePreferencesStore.ts      # Data Saver, polling toggles, time formats
â”‚   â”œâ”€â”€ useRemindersStore.ts        # Scheduled match kickoff reminders
â”‚   â””â”€â”€ useSearchHistoryStore.ts    # Recent search queries
â”œâ”€â”€ theme/                          # Unified design system tokens
â”‚   â”œâ”€â”€ colors.js                   # Color palette (single source of truth)
â”‚   â”œâ”€â”€ radius.js                   # Border radius tokens
â”‚   â”œâ”€â”€ spacing.js                  # Spacing and layout tokens
â”‚   â”œâ”€â”€ typography.js               # Font weights and sizes
â”‚   â””â”€â”€ index.ts                    # TypeScript theme re-exports
â”œâ”€â”€ types/
â”‚   â””â”€â”€ football.ts                 # Domain models (Match, Team, Player, Competition)
â”œâ”€â”€ app.json                        # Expo application manifest
â”œâ”€â”€ package.json                    # Project dependencies and npm scripts
â””â”€â”€ tsconfig.json                   # TypeScript configuration
```

---

## Verified Implementation State & Known Limitations

### Engineering Verification Matrix

| Area / Feature | Status | Verification Detail |
| :--- | :---: | :--- |
| **API Error Contract (P2)** | Verified | Distinguishes HTTP 200 error payloads from empty results; parses `errors.plan` and `errors.requests`. |
| **Team Season Fixtures (P2)**| Verified | Removed unsupported Free-plan `last`/`next` parameters; queries valid season schedules. |
| **Real Player Profiles (P3)** | Verified | Lineups, events, and squads navigate to `/player/[id]` with real API IDs (e.g. Onana `#545`). |
| **Dynamic Season Resolver (P4)**| Verified | Auto-detects Free-plan season boundary (2024); prevents crashes caused by default calendar year. |
| **Live Match Polling (P5)** | Verified | 30s detail polling, 120s empty-list discovery polling; focus-aware, halts on background. |
| **Offline Persistence (P6)** | Verified | React Query cache persisted to `AsyncStorage`; cold launch hydrates in <1s; verified via ADB. |
| **Football News Engine (P7)** | Verified | Full architecture (DTO, mapper, service, repo, hook, UI); graceful empty/retry state on Free tier. |
| **GNews Proxy Migration (P9)** | Implemented | Cloudflare Worker proxy (`services/news-proxy/`) replaces API-Football `/news`; GNews Free tier; 30-min Cloudflare cache; key never in client bundle. |

### Provider Plan Constraints

MatchPulse is fully configured to operate under API-Football's **Free Tier Plan**. The following boundaries are enforced by the provider:

1. **Daily Request Quota**: Limited to **100 requests/day**. MatchPulse manages this via aggressive cache durations (up to 12 hours for static entities) and smart retry suppression.
2. **Season Limitations**: Free accounts do not have access to real-time 2025/2026 season data on certain endpoints. The dynamic season resolver automatically falls back to the most recent accessible season (e.g., 2024) to keep player profiles and standings operational.
3. **News Provider**: Football news is served via a self-hosted Cloudflare Worker proxy (`services/news-proxy/`) that queries the GNews Free tier. GNews Free plan articles carry a **12-hour publication delay** and are capped at 100 requests/day and 10 articles per request. The proxy must be deployed and `EXPO_PUBLIC_NEWS_PROXY_URL` set for news to load; without it, the app shows a neutral placeholder.

---

## License

No license has been specified for this project yet.
