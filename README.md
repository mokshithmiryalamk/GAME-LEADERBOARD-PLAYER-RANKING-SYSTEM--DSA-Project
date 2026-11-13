# RANKFORGE — Player Rankings & Match Arena

[![Academic Source Preserved](https://img.shields.io/badge/Original%20Java-8%20Files%20Preserved-10B981.svg)](#original-source-preservation)
[![Stage 9 Local Readiness](https://img.shields.io/badge/Stage%209-Safe%20Cleanup%20%26%20Local%20Readiness-B8F34B.svg)](#stage-9-implementation-safe-cleanup-practical-optimization--final-local-readiness)
[![Automated Tests](https://img.shields.io/badge/Tests-165%2F165%20Passing-00F5D4.svg)](#automated-verification)
[![Backend Stack](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.3.5%20%7C%20JPA%20%7C%20Flyway-00F5D4.svg)](#technology-stack--architecture)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206%20%7C%20Vitest%203-F15BB5.svg)](#technology-stack--architecture)
[![Visual Theme](https://img.shields.io/badge/Theme-Competitive%20Arcade%20Arena-F15BB5.svg)](#visual-identity--color-palette)

**RANKFORGE — Player Rankings & Match Arena** is an esports operations platform and educational Data Structures & Algorithms (DSA) suite. It transforms a core Java console-based academic project into a full-stack system featuring an authentic **Java Spring Boot 3.3.5** backend, persistent relational database (Spring Data JPA + Flyway migrations), interactive circular matchmaking lobbies, transactional dice-roll match simulations, LIFO match history undo tracking, competitive QuickSort ranking, and DSA algorithm laboratories.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Original Java Source & Attribution](#original-java-source--attribution)
3. [Original Source Preservation](#original-source-preservation)
4. [Identified Original Source Weaknesses](#identified-original-source-weaknesses)
5. [Visual Identity & Color Palette](#visual-identity--color-palette)
6. [Eight-Stage Development Roadmap](#eight-stage-development-roadmap)
7. [Stage 1 Implementation](#stage-1-current-implementation)
8. [Stage 2 Implementation: Player Registry & Leaderboard](#stage-2-implementation-player-registry--leaderboard)
9. [Stage 3 Implementation: Matchmaking Queue & Combat Arena](#stage-3-implementation-matchmaking-queue--combat-arena)
10. [Stage 4 Implementation: Match History Stack, Atomic Undo & Interactive DSA Lab](#stage-4-implementation-match-history-stack-atomic-undo--interactive-dsa-lab)
11. [Stage 5 Implementation: Java Spring Boot Backend Foundation](#stage-5-implementation-java-spring-boot-backend-foundation)
12. [Stage 6 Implementation: Persistent Database, Java Matchmaking Engine & Transaction-Safe Match History](#stage-6-implementation-persistent-database-java-matchmaking-engine--transaction-safe-match-history)
13. [Stage 7 Implementation: React + Vite Frontend Migration & Real Java Backend Integration](#stage-7-implementation-react--vite-frontend-migration--real-java-backend-integration)
14. [Stage 8 Implementation: Full-Stack Quality Assurance, Bug Fixes & Deployment Readiness](#stage-8-implementation-full-stack-quality-assurance-bug-fixes--deployment-readiness)
15. [Stage 9 Implementation: Safe Cleanup, Practical Optimization & Final Local Readiness](#stage-9-implementation-safe-cleanup-practical-optimization--final-local-readiness)
16. [Technology Stack & Architecture](#technology-stack--architecture)
17. [Running the Application Locally](#running-the-application-locally)
18. [Automated Verification](#automated-verification)
19. [Known Limitations](#known-limitations)

---

## Project Overview

The original Java project modeled a competitive multiplayer game where players can register as solo participants or team members, queue into a lobby, participate in randomized 1v1 and 2v2 matches, compete for high scores, and audit match results through a stack.

This web implementation preserves the integrity of that academic work in `original-source/` while wrapping it in a modern, esports-themed single-page application shell designed for developer portfolio presentation.

---

## Original Java Source & Attribution

* **Original Repository:** [`https://github.com/mokshithmiryalamk/GAME-LEADERBOARD-PLAYER-RANKING-SYSTEM--DSA-Project`](https://github.com/mokshithmiryalamk/GAME-LEADERBOARD-PLAYER-RANKING-SYSTEM--DSA-Project)
* **Default Branch:** `main` (not `master`)
* **Pinned Commit:** `9997165e4524f2e0e4f820b0ea5538c0f5c45401`
* **Original Author:** Mokshith Miryala

---

## Original Source Preservation

All **eight original repository files** are preserved exactly as written in `original-source/` with verified cryptographic integrity against the pinned GitHub commit:

| File Name | Canonical Git-Blob SHA-1 (`9997165`) | Raw SHA-256 Hash | Size (Bytes) | Role in Original Project |
| :--- | :--- | :--- | :---: | :--- |
| `Main.java` | `c4ef9899de383b170139005695301770ed5e579c` | `8ade3fb96fa714e4b4c0bb3dde0d2ee46b9c4b8ba6b21cd9d1f5130090cf2b8e` | 7,059 | Console menu driver & match simulation loop |
| `MatchHistoryStack.java` | `5465c8378cc65318f1638ba9170e32e4fdd0472a` | `0518e8e76c99d652a59c15317de46ceb750a3b4b9fc00b618264684e5bb34c39` | 1,423 | LIFO stack for tracking match winners and undo |
| `Player.java` | `6efb15f366bf2a67c4de8abcce769940ca3ac4c0` | `6c1717021ebd24142875951f56bd20950dcdbc85568bbff7906a727a21d51466` | 1,525 | Player entity (ID, name, team, level, score) |
| `PlayerArray.java` | `0e34cc79a12082d3320594eb9ba222a81cd40b4c` | `89bf9aa7046a6bcb90cd16b0bb49fa2cba22a4d33ad3b7c267788392c926b07d` | 12,382 | Fixed array storage, searches, and QuickSort |
| `PlayerList.java` | `44d603ce54c80521210cd1b3b562f7b378bcff77` | `a41f4492de5bc8ef8cd280f6e5922656862b920c60183d8a6c312ec54aeae0ca` | 2,317 | Singly-linked list for active player tracking |
| `PlayerQueue.java` | `77564fd62c87c220873f97c785e85c5884f0abf3` | `d2c83cedaa5cbffa54518544dd7c0f5e87a62399b103f1eee015ca7c797d0300` | 1,484 | FIFO matchmaking queue for player lobbies |
| `players.txt` | `94c3914aaa173d64d049825b39f3d8bdf8dcced2` | `82ade6c4df8ee684dd153b691af8b8bb5978f08c8f2e5933759c5555da6e6139` | 1,304 | Comma-delimited seed data (54 player records) |
| `README.md` | `7e21cc977624ba2905a60129aafa3658543d62e1` | `fd4ee77394b321cd397a17090a3c3bc274696fe7f6b7bcc6391c75cd8a11afe0` | 32 | Original academic project heading |

> **Note on Line Endings:** The preserved files match the canonical Git-blob SHA-1 values. If checked out on Windows with CRLF conversion, all 8 files match the original tree after standard line-ending normalization (`\r\n` to `\n`).

---

## Identified Original Source Weaknesses

During the Stage 1 code audit of the original Java files, several architectural edge cases were documented to ensure they are addressed during frontend implementation in Stages 2 through 4:

1. **Undo Double-Decrement Anomaly:** In `MatchHistoryStack.java` (line 37), `pop()` decrements the winner's score by 10 (`p.score -= 10;`). In `Main.java` (line 164), the undo menu choice immediately calls `manager.decrementScore(last, 10);` on the returned player, decrementing an additional 10 points (-20 total for a single undo).
2. **Linear Queue Index Exhaustion:** `PlayerQueue.java` increments `rear++` on enqueue and `front++` on dequeue without circular modulo wrap-around (`(rear + 1) % capacity`). Once 50 enqueues occur over time, the array overflows even if previous players have dequeued.
3. **Malformed File Record in `players.txt`:** Line 50 contains two concatenated records: `Shreya,150,90,5,Dragonshi,254,0,55,noiy`. The second record is partially merged into the team field.
4. **2v2 Match Undo Asymmetry:** In `PlayerArray.startMatch()`, a 2v2 match pushes both winning players to the history stack, but `Main.java` only pops one player during an undo operation.
5. **Duplicate ID Validation:** `addPlayer()` appends to the array without rejecting existing player IDs.

These findings are preserved in the original files as-is to respect academic fidelity, and will be gracefully sanitized in the reactive JavaScript data layer.

---

## Visual Identity & Color Palette

The application uses a **Competitive Arcade Arena** esports control center aesthetic. This palette is strictly separated from all other portfolio projects:

| Swatch | Color Name | Hex Token | Function |
| :---: | :--- | :--- | :--- |
| ![#0C0F12](https://via.placeholder.com/15/0C0F12/000000?text=+) | Deep Carbon Graphite | `#0C0F12` | Primary application canvas background |
| ![#12161A](https://via.placeholder.com/15/12161A/000000?text=+) | Dark Console Surface | `#12161A` | Sidebar, top bar, and table header background |
| ![#181E24](https://via.placeholder.com/15/181E24/000000?text=+) | Elevated Panel | `#181E24` | Card panels, podium base, matchup arena |
| ![#B8F34B](https://via.placeholder.com/15/B8F34B/000000?text=+) | **Electric Lime** | **`#B8F34B`** | Primary brand accent, High Score, Rank 1 Gold/Lime |
| ![#F15BB5](https://via.placeholder.com/15/F15BB5/000000?text=+) | **Cyber Magenta** | **`#F15BB5`** | Secondary accent, Match Arena versus badges, Rank 2 |
| ![#00F5D4](https://via.placeholder.com/15/00F5D4/000000?text=+) | **Neon Cyan** | **`#00F5D4`** | Tertiary accent, Level indicators, Rank 3, DSA Lab |
| ![#FEE440](https://via.placeholder.com/15/FEE440/000000?text=+) | Victory Gold | `#FEE440` | Trophy accents, champion indicators |
| ![#F2F5F4](https://via.placeholder.com/15/F2F5F4/000000?text=+) | Cool Neutral | `#F2F5F4` | Primary high-contrast typography |
| ![#9AA8AA](https://via.placeholder.com/15/9AA8AA/000000?text=+) | Muted Slate | `#9AA8AA` | Secondary typography, captions, table metadata |

---

## Eight-Stage Development Roadmap

* [x] **Stage 1: Foundation, Source Preservation, Application Shell & Design Tokens** *(Complete & Verified)*
* [x] **Stage 2: Player Registry Manifest, CRUD & QuickSort Ranking** *(Complete & Verified)*
* [x] **Stage 3: Matchmaking Queue & Esports Combat Simulator** *(Complete & Verified)*
* [x] **Stage 4: Match History Stack, Idempotent Undo & Interactive DSA Lab** *(Complete & Verified)*
* [x] **Stage 5: Java Spring Boot Backend Foundation & Live REST APIs** *(Complete & Verified)*
* [x] **Stage 6: Persistent Database, Java Matchmaking Engine & Transaction-Safe Match History** *(Complete & Verified)*
* [ ] **Stage 7: React + Vite Modern Frontend Migration & API Integration** *(Planned)*
* [ ] **Stage 8: Master Integration, End-to-End QA, Production Hardening & Portfolio Release** *(Planned)*

---

## Stage 2 Implementation: Player Registry & Leaderboard

Stage 2 transforms views 2 and 3 into fully functional, reactive management studios backed by client-side persistence and verified algorithms:

### 1. Seed Dataset Audit & Quarantine (`js/seed-data.js`)
* Audited all 54 lines of `original-source/players.txt`.
* Extracted **53 clean records**. Line 50 (`Shreya,150,90,5,Dragonshi,254,0,55,noiy`) was identified as a malformed concatenation of two records with 9 comma-separated fields; it has been safely quarantined with full explanatory metadata.
* Normalized team affiliations (`KLH` standardized for `klh`, `NoTeam` for solo players).

### 2. Algorithmic Search Engine (`js/player-algorithms.js`)
Faithfully reproduces original Java `PlayerArray.java` methods with telemetry timers and comparison counters:
* **Linear Search by ID ($O(N)$):** Sequential search with full loop comparison counting.
* **Linear Search by Name ($O(N)$):** Case-insensitive search returning all matching handle records.
* **Linear Search by Team ($O(N)$):** Case-insensitive filter supporting recognized teams and Solo players.
* **Binary Search by ID ($O(\log N)$):** Operates on a sorted snapshot array without mutating canonical registry order. Tracks interval halving steps ($\le \lceil \log_2 N \rceil + 1$).
* **Hash-Map Search by ID ($O(1)$):** Direct key-to-record map evaluation in constant time.
* **QuickSort Leaderboard ($O(N \log N)$):** Divide-and-conquer descending ranking algorithm strictly following `PlayerArray.leaderboardQuick()` and `partition()` using Lomuto partitioning with end-element pivot `players[end].score`. Features deterministic tie-breaking on equal score using ascending player ID.

### 3. Reactive Player Data Store (`js/player-data.js`)
* Stores players under LocalStorage key `game_leaderboard_players_v1`.
* Enforces domain validation: positive unique integer ID, non-empty handle ($\le 40$ chars), level 1–999, non-negative integer score.
* New players register with score 0 per Java constructor `Player(name, id, level)`.
* Full CRUD: `getAll()`, `getById()`, `add()`, `update()`, `delete()`, `resetDemoData()`, `getRanked()`, `getMetrics()`.
* Player ID is immutable during updates; score is preserved.
* Deep cloning prevents external mutation of internal arrays.
* Built-in XSS sanitizer (`escapeHTML`).

### 4. Interactive UI & Modal Workflows
* **Player Registry (`js/player-manager.js`):**
  * Live searchable table with handle avatars and tier badges.
  * Search algorithm selector with real-time performance telemetry chip (algorithm name, complexity, comparison count, execution time in ms, matching records).
  * Team filter pills (All, Warriors, Knights, Dragons, KLH, Solo).
  * Accessible modals for Adding, Editing, Deleting, and Viewing Player Profiles.
  * Reset Demo Data action to restore the 53 authentic seed players at any time.
* **Ranked Leaderboard (`js/leaderboard-manager.js`):**
  * Dynamic Top-3 Podium (Rank 1 Electric Lime `#B8F34B`, Rank 2 Cyber Magenta `#F15BB5`, Rank 3 Neon Cyan `#00F5D4`).
  * Full QuickSort standings table with rank badges, team filters, and live search.
* **Overview Dashboard Sync (`js/app.js`):**
  * Arena Overview KPI cards dynamically reflect roster metrics (Total Roster, Top Score, Champion handle) via reactive store subscriptions.
* **UI Components:**
  * Accessible modal controller with focus trapping and ESC key listener (`js/ui/modal.js`).
  * Competitive arcade toast notification system (`js/ui/toast.js`).

---

## Stage 3 Implementation: Matchmaking Queue & Combat Arena

Stage 3 implements the interactive gameplay loop, circular matchmaking queue, and transactional dice-combat simulation:

### 1. Circular Matchmaking Queue (`js/match-queue.js`)
* **Solves Original Java Flaw:** In Java `PlayerQueue.java`, linear `front++` and `rear++` pointers eventually exhaust array capacity after repeated matches. The frontend replaces this with a **Circular Queue** (`(rear + 1) % capacity` and `(front + 1) % capacity`), preserving the authentic 50-player capacity while operating indefinitely without memory leakage or index out-of-bounds errors.
* **Immutable ID Storage:** Stores unique player IDs rather than mutable/stale object copies. Hydrates live player profiles directly from `GamePlayerData`.
* **Strict Validation:** Rejects duplicate player IDs, rejects unregistered players, and automatically purges queued players if deleted from the Registry.
* **FIFO Discipline:** Provides `enqueue()`, `dequeue()`, `removeById()` (Leave Lobby), `hasTwoPlayers()`, `hasFourPlayers()`, and `clear()`.

### 2. Persistent Matchmaking State (`js/match-data.js`)
* Persists lobby queue state in LocalStorage (`game_leaderboard_queue_v1`) and completed match records (`game_leaderboard_matches_v1`).
* On reload, validates all stored queue IDs against the player database, silently dropping any stale references.
* Full integration with **Reset Demo Data**: resets queue and completed matches automatically.

### 3. Dice-Combat Rules & Atomic Transactions (`js/match-engine.js`)
* **Mirroring Java `Main.rollNumber()`:** Generates randomized integers between 1 and 100 inclusive. Supports dependency-injected RNG for deterministic automated test verification.
* **Solo 1v1 Matches:** Front two queued challengers roll 1–100. The player with the higher roll is declared winner and awarded exactly +10 points. Both participants are dequeued from the lobby upon match completion.
* **Team 2v2 Squad Clash:** Front four queued players form Squad Alpha (Team 1) and Squad Omega (Team 2). Each participant rolls 1–100. Squad rolls are summed and compared. Both winning players receive +10 points each (+20 team points total).
* **Sudden Death Tie Policy:** In the event of equal dice rolls (or equal squad totals), a transparent **Sudden Death Reroll** is automatically triggered and logged until a decisive champion emerges.
* **Atomic Score Transactions:** `GamePlayerData.applyMatchScoreAward()` guarantees all-or-nothing execution—if any winner validation fails, no points are modified. Re-entrancy locks prevent double-clicks or repeated submissions.

### 4. Interactive Match Arena Interface (`js/arena-manager.js`)
* **Lobby Management:** Real-time capacity counter (`0 / 50 Challengers`), player selection dropdown, "Join Lobby", "Quick Seed 4 Challengers", and "Clear Lobby" actions.
* **FIFO Queue Cards:** Displays queue order (`#1, #2...`), player avatars, handles, levels, and individual "Leave Lobby" buttons.
* **Esports Matchup Visualizer:** Challenger Alpha vs Challenger Omega cards, cyber versus pill, animated dice roll simulation (flickering numbers), accessible reduced-motion support, and celebratory victory announcements.
* **Cross-Module Reactive Sync:** Match wins immediately trigger QuickSort ranking updates on the Leaderboard, podium recalculation, Player Registry updates, and Arena Overview KPI synchronization (`#kpi-active-lobby`, `#kpi-matches-played`, `#kpi-top-score`).

### 5. Preparation for Stage 4 History & Idempotent Undo
Every completed match produces a structured, immutable record containing:
* `matchId`: Unique timestamped identifier
* `matchType`: `'1v1'` or `'2v2'`
* `participantIds`: Complete list of challenger IDs
* `teamA` & `teamB`: Individual roll values and squad totals
* `winnerTeam` & `winnerIds`: Validated winning IDs
* `scoreDelta`: Exact points awarded (10)
* `tieRerolls`: Chronological log of any sudden death reroll rounds
* `timestamp`: ISO-8601 completion time
* `status`: `'COMPLETED'`

This structure allows Stage 4 to implement full Match History timelines and an idempotent single-step undo that eliminates the double-decrement anomaly found in original Java `MatchHistoryStack.java`.

---

## Stage 4 Implementation: Match History Stack, Atomic Undo & Interactive DSA Lab

Stage 4 completes the auditing and educational visualizer pillars of the application:

### 1. Match History & LIFO Audit Timeline (`js/history-manager.js`)
* **Strict LIFO Presentation:** Matches are rendered in true reverse chronological order (newest on top), matching the stack discipline of `MatchHistoryStack.java`.
* **Multi-Criteria Filtering:** Filter pills for "All Matches", "Solo 1v1", "Team 2v2", "Completed", and "Undone".
* **Real-Time Search:** Live filtering across match IDs, participant IDs, and player handle snapshots.
* **Telemetry Counter:** Live "Active Stack Depth: N / 100" indicator displaying the count of eligible active completed matches.
* **Interactive Match Dossier:** Modal inspection showing participant scores, dice rolls, sudden death reroll rounds, and winner breakdowns.

### 2. Atomic LIFO Undo Engine (`js/match-undo.js`)
* **Solves Java Bug A (Double Deduction):** In the original Java code (`MatchHistoryStack.java` + `Main.java`), popping a match subtracted 10 points inside `pop()`, then subtracted another 10 points in `Main`, causing a catastrophic -20 score penalty. The web engine strictly decrements exactly 10 points once per winner, returning their score precisely to the pre-match value.
* **Solves Java Bug B (Partial 2v2 Undo):** In Java, 2v2 matches pushed winners separately, meaning popping once only reversed one teammate. The web engine treats the entire match record as an atomic transaction, deducting 10 points from both winning squad members simultaneously.
* **LIFO Stack Discipline:** Only the latest eligible completed match can be undone. Non-top matches cannot be popped out of order.
* **Re-Entrancy & Double-Undo Guards:** Re-entrancy locks prevent rapid concurrent calls; already undone matches cannot be undone again.
* **Score Clamping:** Scores are clamped safely at $\ge 0$ (never negative).

### 3. Multi-Key LocalStorage Transaction Journaling (`js/match-data.js`)
* Multi-key mutations (player score reversal + match status update) are wrapped in a crash-resilient transaction journal stored under key `game_leaderboard_tx_journal_v1`.
* If a runtime error or browser reload interrupts an undo, the journal reconciles and rolls back safely on initialization.

### 4. Referential Integrity & Player Deletion Policy
* **`canSafelyDeletePlayer(id)` Guard:** If a player is a winning participant in the latest active match pending undo, deleting them from the Player Registry is blocked with an explanatory error notice until the match is undone or superseded.
* **Immutable Participant Snapshots:** Every match record retains an immutable `playersSnapshot` (`id`, `name`, `team`, `level`) taken at match time. Historical cards and dossiers display cleanly even if non-conflicting players are deleted later.

### 5. Interactive DSA Educational Studio (`js/dsa/dsa-manager.js`)
An interactive, step-by-step laboratory covering all 7 core algorithms and data structures implemented across the Java source code:
1. **PlayerArray:** Demonstrates contiguous memory slot allocation, $O(1)$ direct index access (`players[idx]`), and sequential traversal.
2. **PlayerList:** Interactive singly-linked list chain demonstrating $O(1)$ head insertion (`addRecent`), $O(N)$ tail append (`registerTournament`), and $O(N)$ score-ordered chain insertion (`insertByScore`).
3. **PlayerQueue:** Interactive circular FIFO queue (capacity 6 sandbox) visualizing modulo wrap-around `rear = (rear + 1) % capacity` and `front = (front + 1) % capacity`, contrasting directly against the original Java linear exhaustion bug.
4. **MatchHistoryStack:** Vertical LIFO stack column visualizing push operations, `top` pointer increments, and atomic pop undo reversals.
5. **Hash Map:** Hash indexing visualization showing `hash(id) = id % 5`, bucket distribution, and instantaneous $O(1)$ key lookup.
6. **Search Engine Comparison:** Side-by-side comparative trace evaluating Linear Search $O(N)$ comparisons against Binary Search $O(\log N)$ interval halving ($low$, $mid$, $high$).
7. **QuickSort Lomuto Partitioning:** Step-by-step visualization of descending ranking: end-element pivot selection, scanning pointers $i$ and $j$, element swaps, and deterministic tie-breaking on equal scores using ascending player IDs.

**Laboratory Features:**
* Controls: Step Forward, Step Backward, Auto-Play/Pause, Reset, and Speed selector ($0.5\times$, $1.0\times$, $2.0\times$).
* Custom Actions: Topic-specific simulation triggers (e.g., "Insert at Head", "Enqueue Challenger", "Lookup ID #104").
* Live Narrative Log: Dynamic step-by-step explanations and Big-O computational complexity badges.
* Strict Sandbox Isolation: The DSA Lab operates entirely on isolated educational demo datasets, never polluting the live player registry or match records.

---

## Stage 5 Implementation: Java Spring Boot Backend Foundation

Stage 5 establishes a robust, enterprise-grade **Java Spring Boot 3.3.5** backend (`backend/`) on **Java 21**, reusing and modernizing the algorithmic foundations of the original Java codebase while exposing clean RESTful APIs.

### 1. Backend Architecture & Package Structure

```
backend/
├── pom.xml                               # Maven Project Descriptor (Java 21, Spring Boot 3.3.5)
├── src/
│   ├── main/
│   │   ├── java/com/rankforge/
│   │   │   ├── RankforgeBackendApplication.java  # Application Entrypoint
│   │   │   ├── config/
│   │   │   │   └── WebConfig.java               # Global CORS filter (React & local dev support)
│   │   │   ├── controller/
│   │   │   │   ├── HealthController.java        # GET /api/health
│   │   │   │   ├── LeaderboardController.java   # GET /api/leaderboard (team, limit)
│   │   │   │   └── PlayerController.java        # CRUD + Search + Reset endpoints
│   │   │   ├── dto/
│   │   │   │   ├── ErrorResponse.java           # Structured RFC 7807-style error DTO
│   │   │   │   ├── HealthResponse.java          # Health telemetry & seed status DTO
│   │   │   │   └── LeaderboardEntryResponse.java # Ranked player with rank number DTO
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java  # HTTP 400/404/500 JSON error interceptor
│   │   │   │   └── PlayerNotFoundException.java # Domain entity not found exception
│   │   │   ├── model/
│   │   │   │   └── Player.java                  # Authentic Player domain model
│   │   │   ├── repository/
│   │   │   │   └── InMemoryPlayerRepository.java # PlayerArray-inspired array + hash storage
│   │   │   └── service/
│   │   │       ├── LeaderboardService.java      # Lomuto QuickSort descending engine
│   │   │       └── PlayerService.java           # CRUD business logic & hash/linear search
│   │   └── resources/
│   │       └── application.properties           # Port 8080, seed path, error options
│   └── test/
│       └── java/com/rankforge/
│           ├── RankforgeBackendApplicationTests.java # Context loading smoke test
│           ├── controller/
│           │   ├── HealthControllerTest.java        # Health endpoint MockMvc tests
│           │   ├── LeaderboardControllerTest.java   # QuickSort ranking & filter tests
│           │   └── PlayerControllerTest.java        # CRUD, search, and error tests
│           └── service/
│               ├── LeaderboardServiceTest.java      # Lomuto QuickSort & tie-break tests
│               └── PlayerServiceTest.java           # Hash search & repository tests
```

### 2. Original Java Source Reuse & Adaptation Matrix

| Original Java Source | Role in Academic Source | Modern Spring Boot Implementation | Architectural Enhancements |
| :--- | :--- | :--- | :--- |
| `Player.java` | Console player entity | `com.rankforge.model.Player` | Preserved all 5 core fields (`id`, `name`, `score`, `level`, `team`), 4 original constructors, and row-formatting `toString()`. Added Jackson no-arg constructor, getters/setters, defensive copy constructor, and equals/hashCode based on immutable `id`. |
| `PlayerArray.java` (Lomuto QuickSort) | `leaderboardQuick(int start, int end)` & `partition()` | `LeaderboardService.quickSortDesc()` & `partition()` | Faithfully preserved Lomuto partition logic: selects `pivot = players[end].score`, scans with pointer `i = start - 1`, and swaps elements into descending score order. Enhanced with deterministic tie-breaking: equal scores resolve by ascending player ID. |
| `PlayerArray.java` (Search Engine) | `searchByIdHash(int id)`, `searchByName(String)`, `searchByTeam(String)` | `PlayerService` & `InMemoryPlayerRepository` | Reuses constant-time $O(1)$ Hash Search backed by `HashMap<Integer, Player>`. Linear searches by name and team operate over internal array snapshot ($O(N)$), with case-insensitive token matching. |
| `players.txt` | Raw 54-line comma-delimited seed data | `InMemoryPlayerRepository.loadSeedData()` | Automatically parses 53 valid records on startup. Safely detects and quarantines malformed Line 50 (`Shreya,150,90,5,Dragonshi,254,0,55,noiy`) with logged telemetry, preventing corrupt state while preserving full seed fidelity. |

### 3. REST API Specification

| HTTP Method | Endpoint | Query Parameters | Description | Status Codes |
| :---: | :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | — | System status, service identity, and seed dataset audit metrics | `200 OK` |
| `GET` | `/api/players` | — | Retrieve all registered players | `200 OK` |
| `GET` | `/api/players/{id}` | — | Retrieve a specific player by unique numeric ID | `200 OK`, `404 Not Found` |
| `GET` | `/api/players/search` | `query` (string) | Case-insensitive search across player handle and team name | `200 OK` |
| `POST` | `/api/players` | — | Register a new player (JSON payload: `id`, `name`, `team`, `level`) | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/players/{id}` | — | Update existing player's handle, level, or team (ID is immutable) | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/players/{id}` | — | Remove player from repository | `204 No Content`, `404 Not Found` |
| `POST` | `/api/players/reset` | — | Reset repository back to the 53 authentic seed players | `200 OK` |
| `GET` | `/api/leaderboard` | `team` (optional), `limit` (optional) | Lomuto QuickSorted leaderboard with rank numbering | `200 OK` |

### 4. Seed Data Audit & Quarantine Policy

The Spring Boot backend maintains an automated seed loader that reads `original-source/players.txt` (or packaged classpath fallback) during initialization:
* **Total Raw Records:** 54 lines audited.
* **Valid Parsed Records:** 53 authentic esports competitors initialized into in-memory storage.
* **Quarantined Records:** 1 record (Line 50: `Shreya,150,90,5,Dragonshi,254,0,55,noiy`).
* **Quarantine Rationale:** Line 50 contains 9 comma-separated values produced by accidental concatenation of two distinct records. The repository logs an explanatory diagnostic message and exposes quarantine telemetry through `GET /api/health` without crashing.

---

## Stage 6 Implementation: Persistent Database, Java Matchmaking Engine & Transaction-Safe Match History

Stage 6 completes the authoritative backend data layer and multiplayer combat simulation, migrating from in-memory arrays to an enterprise-grade **Spring Data JPA** architecture with **Flyway** schema migrations, genuine Java DSA circular matchmaking lobbies, and a transactional dice-combat match engine.

### 1. Database Persistence & Relational Schema (`backend/src/main/resources/db/migration/V1__init_schema.sql`)

* **Local Development Engine:** File-based **H2 database** (`jdbc:h2:file:./data/rankforgedb;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE;WRITE_DELAY=0`). Works out-of-the-box without requiring a separate PostgreSQL installation.
* **Production Deployment Ready:** Configurable through environment variables (`DB_URL`, `DB_DRIVER`, `DB_USERNAME`, `DB_PASSWORD`) with PostgreSQL dialect compatibility.
* **Automated Test Isolation:** Runs against an independent, ephemeral in-memory H2 database (`jdbc:h2:mem:testdb;MODE=PostgreSQL`).
* **Flyway Version Control:** Schema is managed strictly through Flyway migration `V1__init_schema.sql` with Hibernate schema validation (`ddl-auto=validate`), prohibiting unchecked runtime auto-mutations.
* **Tables Created:**
  * `players`: Unique numeric ID, handle name, score, level, team affiliation, created/updated timestamps.
  * `matchmaking_queue`: Unique player reference (`player_id`), circular slot index (`slot_index` 0..49), and FIFO enqueue timestamp.
  * `matches`: Match type (`1v1` or `2v2`), audit status (`COMPLETED` or `UNDONE`), winning side (`ALPHA` or `OMEGA`), score award, summary narrative, played timestamp, undone timestamp.
  * `match_participants`: Foreign keys to match and player, immutable snapshot data (name, team, level), side (`ALPHA` or `OMEGA`), dice roll (1..100), victory flag, and score delta (+10 or 0).
  * `match_tie_rerolls`: Tracks round-by-round sudden death tie-breaking rolls.

### 2. Java Circular Matchmaking Queue (`JavaCircularQueue.java` & `QueueService.java`)

* **Authentic DSA Execution:** Adapts `original-source/PlayerQueue.java`, resolving its linear capacity exhaustion bug by implementing true circular buffer pointer wrap-around:
  $$\text{rear} = (\text{rear} + 1) \bmod \text{capacity}$$
  $$\text{front} = (\text{front} + 1) \bmod \text{capacity}$$
* **Rigorous Invariants:**
  * Strict maximum capacity of **50 players**.
  * Rejects duplicate players (`DuplicateQueuePlayerException` -> HTTP 409 Conflict).
  * Rejects nonexistent players (`PlayerNotFoundException` -> HTTP 404 Not Found).
  * Concurrency and transaction-safe: synchronized state management synchronized with database persistence.
  * Full support for FIFO dequeueing, order-preserving `removeById` (Leave Lobby), and bulk clearing.

### 3. Transactional Combat Simulator (`MatchService.java`)

* **Solo Mode (1v1):** Consumes front two queued contenders (Challenger Alpha & Challenger Omega). Rolls 1..100 using pluggable `DiceRoller` abstraction. Highest roll wins +10 score. In case of ties, automatic **Sudden Death Rerolls** are logged and resolved deterministically.
* **Team Mode (2v2 Squad Clash):** Consumes front 4 contenders. Squad Alpha (#1 & #2) clashes with Squad Omega (#3 & #4). Sum of squad dice rolls determines winning side. Both winning squad members receive +10 points each (+20 team points total).
* **Atomic Transactions:** Both match creation, queue consumption, participant snapshotting, and player score updates are wrapped in `@Transactional`. If any step fails, the entire transaction rolls back cleanly—no players are consumed, no scores modified.

### 4. LIFO Match History Stack & Flaw-Free Undo (`MatchHistoryService.java`)

Adapts the stack discipline from `original-source/MatchHistoryStack.java`, solving all documented academic weaknesses:
1. **Eliminated Double Deduction (Bug A):** Original code subtracted 10 points in `MatchHistoryStack.pop()` and another 10 points in `Main.java` (-20 total). The Java backend decrements exactly one +10 award per winning participant once.
2. **Atomically Undoes 2v2 Matches (Bug B):** Reverses both winning teammates simultaneously in one atomic transaction.
3. **No Zero-Clamping:** Disables artificial `Math.max(0, ...)` clamping to maintain mathematical audit integrity.
4. **Audit Durability:** Reverted matches are marked with status `UNDONE` and timestamp `undoneAt`; records are never deleted from database history.
5. **Referential Integrity Guard:** Prohibits deleting players who are winning participants in active reversible matches pending LIFO undo, returning HTTP 409 Conflict.

### 5. Complete REST API Specification

| HTTP Method | Endpoint | Query / Body Parameters | Description | Status Code |
| :---: | :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | — | System health, seed statistics, queue length, and match depth | `200 OK` |
| `GET` | `/api/players` | — | Retrieve all registered players from database | `200 OK` |
| `GET` | `/api/players/{id}` | — | Retrieve specific player by ID (returns RFC 7807 on 404) | `200 OK`, `404 Not Found` |
| `GET` | `/api/players/search` | `query`, `name`, `team` | Algorithmic linear search across player handle and team affiliation | `200 OK` |
| `POST` | `/api/players` | JSON player body | Register new contender (validates unique ID, scores start at 0) | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/players/{id}` | JSON player body | Update player handle, level, or team (score is protected) | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/players/{id}` | — | Remove player (guarded against active undo conflicts) | `200 OK`, `409 Conflict` |
| `POST` | `/api/players/reset` | — | Restore 53 authentic seed players, clearing queues and matches | `200 OK` |
| `GET` | `/api/leaderboard` | `team` (opt), `limit` (opt) | Lomuto QuickSorted leaderboard with rank numbering | `200 OK` |
| `GET` | `/api/queue` | — | Retrieve waiting lobby contenders in FIFO order | `200 OK` |
| `POST` | `/api/queue` | `{"playerId": int}` | Enqueue contender into circular matchmaking lobby | `201 Created`, `400`, `409 Conflict` |
| `DELETE` | `/api/queue/{id}` | — | Contender leaves matchmaking lobby | `200 OK`, `400 Bad Request` |
| `POST` | `/api/queue/clear` | — | Clear all contenders from lobby | `200 OK` |
| `POST` | `/api/matches/play` | `{"matchType": "1v1" \| "2v2"}` | Execute match, roll dice, award score, consume queue | `201 Created`, `400 Bad Request` |
| `POST` | `/api/matches/solo` | — | Alias for 1v1 solo combat simulation | `201 Created`, `400 Bad Request` |
| `POST` | `/api/matches/team` | — | Alias for 2v2 squad clash simulation | `201 Created`, `400 Bad Request` |
| `GET` | `/api/matches` | `status` (opt), `limit` (opt) | Retrieve match audit history in LIFO order (newest first) | `200 OK` |
| `GET` | `/api/matches/{id}` | — | Retrieve detailed match dossier with participants and rolls | `200 OK`, `400 Bad Request` |
| `POST` | `/api/matches/undo` | — | Atomic LIFO undo: reverses scores of latest eligible match | `200 OK`, `400 Bad Request` |

---

## Stage 7 Implementation: React + Vite Frontend Migration & Real Java Backend Integration

Stage 7 completes the modern full-stack evolution of RANKFORGE by migrating the client layer to **React 19 + Vite 6**, while establishing the Java Spring Boot backend as the **sole, authoritative business-logic authority**.

### 1. Architectural Authority & Backend Delegation
* **Zero Client-Side QuickSort:** The client never runs sorting algorithms for rankings; all standings are retrieved directly from `GET /api/leaderboard` powered by `LeaderboardService.java` (Lomuto partitioning).
* **Zero Client-Side Matchmaking Queues:** The circular FIFO queue is managed by `QueueService.java` with atomic database transactions.
* **Zero Client-Side Dice/Winner Logic:** Combat calculations and score increments (+10 PTS) are performed exclusively in `MatchService.java`.
* **Zero Client-Side LocalStorage State:** Player scores, queue occupancy, and match history are persisted solely in the database.

### 2. Modern React 19 Component Architecture (`frontend/src/`)
* **`api/client.js`:** Centralized, resilient fetch client handling RFC 7807 `ProblemDetail` errors, auto-parsing `detail`, `title`, and `message` properties.
* **`views/OverviewView.jsx`:** Mission dashboard showcasing live KPIs (53 Contenders, Queue Occupancy, Total Matches, Current Champion), system architecture cards, and canonical roster reset modal.
* **`views/PlayerRegistryView.jsx`:** Contender registry with real-time multi-criteria search, team filter tabs (All, Warriors, Knights, Dragons, NoTeam), Add Contender modal with unique ID validation, Edit Contender modal with protected immutable score, and referential-safe Delete Contender flow.
* **`views/LeaderboardView.jsx`:** Live QuickSort standings table with Top 3 gold/silver/bronze podium cards, team badges, score differentials vs #1 champion, and limit selectors.
* **`views/MatchArenaView.jsx`:** Interactive 10-slot circular queue ring buffer visualizer (`slotIndex 0..9`), matchmaking lobby manager, 1v1 solo and 2v2 team combat triggers, dice animation suspense, and authoritative victory cards.
* **`views/MatchHistoryView.jsx`:** Reverse-chronological LIFO audit stack, active reversible stack depth counter, filter pills, detailed combat dossier modal, and atomic undo confirmation dialog.
* **`views/DsaLabView.jsx`:** Complete educational studio featuring all 7 interactive laboratories (PlayerArray, PlayerList, PlayerQueue, MatchHistoryStack, Hash Map, Search Engine, QuickSort Lomuto) with playback controls (Step Back, Step Forward, Auto-Play, Reset, Speed) and Big-O complexity badges.
* **Design Token Fidelity:** Preserved the distinct Competitive Arcade Arena esports palette (`#0C0F12`, `#12161A`, `#181E24`, `#B8F34B`, `#F15BB5`, `#00F5D4`).

---

## Stage 8 Implementation: Full-Stack Quality Assurance, Bug Fixes & Deployment Readiness

Stage 8 completes the end-to-end stabilization, defect remediation, and full-stack integration polish of RANKFORGE.

### 1. Key Defect Fixes & System Enhancements
* **CORS Origin Resolution & Preflight Handshake:** Fixed HTTP 403 Forbidden on preflight/POST requests when navigating to `http://127.0.0.1:5173`. In `WebConfig.java`, updated CORS mapping to support flexible origin patterns (`http://localhost:*`, `http://127.0.0.1:*`) alongside configurable environment properties (`cors.allowed-origins`).
* **Accessible Modal Visibility Remediation:** Fixed an issue where the Add Contender and Edit Contender modal dialogs were injected into the DOM with `.modal-overlay` but remained invisible due to `.modal-overlay { opacity: 0; visibility: hidden; }` in `main.css`. Explicitly applied `className="modal-overlay is-open"` and inline fallback visibility styles to both `PlayerRegistryView.jsx` and `ConfirmModal.jsx`.
* **50-Capacity Circular Queue Buffer Visualization:** Aligned frontend visualizer in `MatchArenaView.jsx` with the backend's true 50-player capacity (`JavaCircularQueue.DEFAULT_CAPACITY = 50`). Implemented a 5-bank selector (Slots 0–9, 10–19, 20–29, 30–39, 40–49) with occupancy badges and added a `⚡ Quick Seed 4` button for rapid lobby testing.
* **Production Demo Reset Safeguard:** In `PlayerController.java`, added an operational safeguard (`rankforge.demo.reset-enabled`) to allow disabling `/api/players/reset` in production environments, returning `403 Forbidden` with RFC 7807 problem details when disabled.
* **Environment-Aware API Client Configuration:** Updated `frontend/src/api/client.js` to utilize `import.meta.env.VITE_API_BASE_URL || '/api'`, eliminating hardcoded paths and allowing easy deployment to cloud environments (Vercel, Railway, Render).
* **Pedagogical Visual Simulation Clarification:** Added clear notice disclaimers in `DsaLabView.jsx` distinguishing educational client-side step simulations from authoritative compiled Java backend algorithms (`QuickSort.java`, `JavaCircularQueue.java`, `MatchHistoryStack.java`).
* **Cleaned UI Development Stage Tags:** Replaced development phase badges in Header (`Full-Stack Esports Engine`) and Sidebar (`Core`, `Roster`, `Ranked`, `Lobby`, `Audit`, `Interactive`) with production-ready esports console terminology.
* **Vitest Testing Cleanliness:** Wrapped asynchronous navigation transitions in `waitFor` blocks in `App.test.jsx`, eliminating React `act(...)` console warnings during automated test runs.

### 2. Live Browser QA Verification
Executed end-to-end browser testing with the built-in Browser QA Engineer agent against `http://127.0.0.1:5173`:
* **Player Registry:** Successfully opened `+ Add Contender` modal, enrolled contender `#999 Valkyrie` (Score 50, Lvl 5, Warriors), verified toast notification and table rendering, updated Valkyrie to Level 6, and deleted Valkyrie with confirmation modal.
* **Combat Arena:** Used `⚡ Quick Seed 4` to populate queue slots 0..3, executed `⚔️ Play 1v1 Solo` (Match #33) with dice roll suspense (28 vs 94) and victory banner (+10 PTS), re-queued contenders, and executed `🛡️ Play 2v2 Team` (Match #34) with victory banner (+10 PTS each).
* **Match History & LIFO Undo Stack:** Audited match timeline verifying strict reverse-chronological order (Match #34 on top), clicked `↩️ Atomic Undo Last Match`, confirmed in modal dialog, and verified atomic point reversal (`(Reversed)`), database entity status update to `UNDONE`, and active stack depth decrement from 2 to 1.

---

## Stage 9 Implementation: Safe Cleanup, Practical Optimization & Final Local Readiness

Stage 9 makes RANKFORGE cleaner, easier to maintain, and fully prepared for local execution and future version control publishing without architectural changes or disruption to existing functionality.

### 1. Key Cleanup & Optimization Accomplishments
* **Removed Abandoned Experimental Artifact:** Safely purged `package.json.react-migration.bak` from the project root after confirming zero references across all code, tests, and configurations.
* **Comprehensive Multi-Tier `.gitignore` Exclusions:** Expanded root `.gitignore` to comprehensively exclude Maven build outputs (`**/target/`), Vite production bundles (`**/dist/`, `**/dist-ssr/`), node caches (`.npm/`), environment/secret files (`.env*`), test dumps (`*.dump`, `*.dumpstream`), OS system files (`desktop.ini`, `ehthumbs.db`), and database files (`**/data/`, `*.mv.db`, `*.trace.db`).
* **Corrected Test Count Reconciliation:**
  - *Stage 8 Historical Correction:* Stage 8 reported 51 backend tests, 13 React tests, 30 live E2E assertions, and 70 legacy regression tests, which totaled **164 tests** (not 165).
  - *Stage 9 Enhanced Baseline:* Added a 52nd backend JUnit 5 test (`testResetDemoDataEndpointDisabledReturnsForbidden`) to verify the production reset safeguard. The new grand total is **165 tests** (52 backend + 13 React + 30 live E2E assertions + 70 legacy regression).
* **Production Roster Reset Safeguard & Environment Profile:**
  - Added `backend/src/main/resources/application-prod.properties` defining `rankforge.demo.reset-enabled=${RANKFORGE_RESET_ENABLED:false}` so destructive anonymous database resets are disabled by default in production.
  - Added unit test `PlayerControllerTest.testResetDemoDataEndpointDisabledReturnsForbidden()` verifying that when `rankforge.demo.reset-enabled=false`, invoking `POST /api/players/reset` immediately responds with `HTTP 403 Forbidden` and message `"Roster reset is restricted in this environment."`.
* **Clarified Player Registration Scoring in UI:** Updated the Add Contender form in `PlayerRegistryView.jsx` to render the initial score as a disabled, read-only field (`0 PTS (Default)`) with an informative tooltip, accurately reflecting the Java backend's academic rule that all new contenders start with exactly 0 rating points.
* **Lightweight Deployment Preparedness:** Verified clean production packaging for both `frontend/` (`npm run build` in 611 ms) and `backend/` (`mvn clean package -DskipTests`), with environment-variable hooks ready for cloud deployment (`VITE_API_BASE_URL` and `SPRING_DATASOURCE_*`).

---

## Technology Stack & Architecture

### Frontend (Modern React SPA)
* **Framework:** React 19 (`react`, `react-dom`)
* **Build System & Dev Server:** Vite 6 (`@vitejs/plugin-react`)
* **Testing:** Vitest 3, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
* **Styling:** Modular CSS3 with custom design tokens (`src/styles/design-tokens.css` and `src/styles/main.css`)
* **Dev Proxy:** Automated proxying of `/api` requests to `http://localhost:8080`

### Legacy Frontend (Static SPA Shell - Preserved for Regression Testing)
* **Markup:** Semantic HTML5 (`index.html`)
* **Scripting:** Modular ES6 JavaScript (`js/`)
* **Backup:** Exact Stage 4 snapshot preserved in `stage4-vanilla-backup/`

### Backend (Enterprise REST Services)
* **Runtime:** Java 21 LTS (`OpenJDK 21.0.12.1`)
* **Framework:** Spring Boot 3.3.5 (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-test`)
* **Database & Persistence:** H2 (local file-based `./data/rankforgedb`), PostgreSQL runtime driver, Flyway migrations
* **Build System:** Apache Maven 3.9+
* **Testing:** JUnit 5, MockMvc, AssertJ
* **Error Handling:** RFC 7807 compliant `ProblemDetail` with Spring `@RestControllerAdvice`
* **Build System:** Apache Maven 3.9+
* **Testing:** JUnit 5, MockMvc, AssertJ
* **Error Handling:** RFC 7807 compliant `ProblemDetail` with Spring `@RestControllerAdvice`

---

## Running the Application Locally

### 1. Running the Spring Boot Backend

#### Prerequisites:
* Java Development Kit (JDK) 21 or higher
* Apache Maven 3.9+ (or use system maven `mvn`)

#### Run Unit & Integration Tests:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/backend
mvn clean test
```

#### Build Packaged JAR:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/backend
mvn clean package
```

#### Launch Backend Server:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/backend
java -jar target/rankforge-backend-1.0.0.jar
```
The REST API will be available at `http://localhost:8080/api/health`.

### 2. Running the Modern React + Vite Frontend

#### Run Local Development Server:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. All API requests (`/api/*`) are automatically proxied to `http://localhost:8080`.

#### Run Frontend Vitest Suite:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/frontend
npm test
```

#### Build Production Bundle:
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/frontend
npm run build
```

### 3. Running the Legacy Frontend (Static SPA Shell)

Because the legacy frontend is a standalone static web application, no build tools or package installations are required.

#### Option A: Python HTTP Server
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

#### Option B: Direct File Opening
Open `D:/Moki/Portfolio/projects/Game_Leaderboard/index.html` directly in any modern browser.

---

## Automated Verification

The project includes comprehensive automated verification suites covering all completed frontend and backend stages:

### Run Frontend React Vitest Suite (13 Tests)
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/frontend
npm test
```

### Run Backend JUnit 5 Suite (52 Tests)
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard/backend
mvn test
```

### Run Stage 8/9 Live Full-Stack QA & Integration Suite (30 Assertions)
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard
# Ensure backend is running on port 8080
node scratch/verify_stage8_e2e.js
```

### Run Legacy Regression Suites (70 Tests)
```bash
cd D:/Moki/Portfolio/projects/Game_Leaderboard
node scratch/verify_stage1.js
node scratch/test_stage2.js
node scratch/test_stage3.js
node scratch/test_stage4.js
```

### Combined Verification Summary:
* **Stage 1 Suite:** 12 / 12 Passing (Preservation, Git-blob SHA-1 hashes, DOM integrity, design tokens, app coordinator)
* **Stage 2 Suite:** 18 / 18 Passing (Seed audit, Linear/Binary/Hash search, QuickSort Lomuto, tie-breaking, CRUD, LocalStorage persistence, DOM modals/toolbars)
* **Stage 3 Suite:** 20 / 20 Passing (Circular queue, FIFO ordering, capacity 50, wrap-around protection, 1v1/2v2 dice combat, sudden death ties, atomic score transactions, cross-module sync)
* **Stage 4 Suite:** 20 / 20 Passing (Match history LIFO stack, Bug A & Bug B idempotent undo, transaction journaling, referential integrity deletion policy, all 7 interactive DSA lab algorithms and trace generators)
* **Backend JUnit 5 Suite:** 52 / 52 Passing (Spring Boot context, Health endpoint, Player CRUD & validation, Lomuto QuickSort, Seed quarantine & idempotent restart, Java circular queue 50-player capacity & 51st rejection, Solo 1v1 & Team 2v2 combat transactions, sudden-death tie rerolls, atomic LIFO match history undo, referential deletion guards, concurrent race conditions, production reset safeguard enabled/disabled 403 test)
* **React Frontend Vitest Suite:** 13 / 13 Passing (App shell navigation across 6 views, API client error parsing & RFC 7807 problem details, contender search & team filter, QuickSort podium & standings table, circular queue 50-capacity buffer slots & combat roll, LIFO stack undo modal, 7 DSA lab simulation steps)
* **Stage 8/9 Full-Stack QA & E2E Suite:** 30 / 30 Passing (Live Spring Boot health, 53 seed player audit, QuickSort standings, CRUD, queue FIFO slots, capacity 50 bounds check, 1v1 solo combat, 2v2 team combat, LIFO stack order, atomic undo reversal, roster reset)
* **Grand Total Passing Automated Tests:** **165 / 165** (100% PASS rate across all suites: 52 + 13 + 30 + 70 = 165; Stage 8 baseline reconciled as 164)

---

## Known Limitations

1. **Stage 1 Scope:** Feature engines (Player CRUD, QuickSort calculations, Queue array operations, Dice rolling, History popping) are strictly reserved for Stages 2 through 4.
2. **Headless Terminal Screen Capture:** Capturing automated visual screenshots in sandboxed terminal environments without virtual framebuffers is not supported. Browser testing was conducted locally.
