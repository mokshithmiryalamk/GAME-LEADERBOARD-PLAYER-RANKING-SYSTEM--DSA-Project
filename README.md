# RANKFORGE — Player Rankings & Match Arena

[![Academic Source Preserved](https://img.shields.io/badge/Original%20Java-8%20Files%20Preserved-10B981.svg)](#original-source-preservation)
[![Automated Tests](https://img.shields.io/badge/Tests-165%2F165%20Passing-00F5D4.svg)](#automated-verification)
[![Backend Stack](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.3.5%20%7C%20JPA%20%7C%20Flyway-00F5D4.svg)](#technology-stack--architecture)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206%20%7C%20Vitest%203-F15BB5.svg)](#technology-stack--architecture)
[![Visual Theme](https://img.shields.io/badge/Theme-Competitive%20Arcade%20Arena-F15BB5.svg)](#visual-identity--design-system)

**RANKFORGE — Player Rankings & Match Arena** is an esports tournament operations platform and educational Data Structures & Algorithms (DSA) suite. It transforms a core Java console-based academic project into a full-stack system featuring an authentic **Java Spring Boot 3.3.5** backend, persistent relational database (Spring Data JPA + Flyway migrations), interactive circular matchmaking lobbies, transactional dice-roll match simulations, LIFO match history undo tracking, competitive QuickSort ranking, and an interactive 7-lab DSA demonstration suite.

---

## Key Features

- **Competitive Player Registry:** Full CRUD operations with instant search (Linear $O(N)$, Binary $O(\log N)$, and Hash Map $O(1)$) across solo and squad participants.
- **Dynamic QuickSort Leaderboard:** Real-time $O(N \log N)$ Lomuto partitioning with deterministic tie-breaking on equal scores using ascending player IDs.
- **Circular Matchmaking Arena:** Bounded circular FIFO queue preventing array exhaustion, supporting 1v1 duels, 2v2 squad battles, and sudden-death rerolls.
- **Transactional Match History & Undo:** Strict LIFO stack tracking with atomic score rollback and referential integrity protection.
- **Interactive DSA Lab:** 7 step-by-step visualizers covering Arrays, Linked Lists, Circular Queues, LIFO Stacks, Hash Tables, Search Algorithms, and QuickSort.
- **Production-Ready Full-Stack:** React 19 + Vite 6 frontend integrated with a Java 21 + Spring Boot 3.3.5 REST API and persistent database.

---

## Project Structure

```text
RANKFORGE/
├── backend/                  # Java 21 + Spring Boot 3.3.5 REST API, JPA, Flyway, Maven
│   ├── src/main/java/        # Controllers, Services, DTOs, Entities, Repositories
│   ├── src/main/resources/   # Flyway migrations (V1-V4), seed data, application.properties
│   └── src/test/java/        # 52 automated JUnit 5 / Spring Boot integration tests
├── frontend/                 # React 19 + Vite 6 Single Page Application
│   ├── src/components/       # Modular UI components (Registry, Leaderboard, Arena, History, DSALab)
│   ├── src/services/         # Unified API client & state adapters
│   └── src/__tests__/        # 13 Vitest unit and component tests
├── original-source/          # Preserved academic Java files & seed data (commit 9997165)
├── legacy/                   # Preserved Stage 1–4 Vanilla JS prototype
│   ├── index.html            # Prototype single-page application shell
│   ├── css/                  # Design tokens & core stylesheets
│   └── js/                   # Prototype state managers and simulation scripts
├── tests/                    # Automated regression and verification suites (165 tests total)
│   ├── verify_stage1.js      # Stage 1 foundation & source preservation checks (12 tests)
│   ├── test_stage2.js        # Stage 2 registry & algorithm tests (18 tests)
│   ├── test_stage3.js        # Stage 3 matchmaking & arena tests (20 tests)
│   ├── test_stage4.js        # Stage 4 history & undo tests (20 tests)
│   ├── verify_stage7_e2e.js  # Live HTTP REST endpoint verification
│   └── verify_stage8_e2e.js  # Full-stack E2E regression suite (30 assertions)
├── docs/                     # Architectural documentation & engineering notes
│   └── DEVELOPMENT_HISTORY.md # Complete 8-stage historical evolution & design rationale
├── .gitignore                # Comprehensive Git exclusions for Java, Node, IDEs, and builds
└── README.md                 # Project documentation & runbook
```

---

## Technology Stack & Architecture

| Tier | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS, Lucide Icons, Vitest 3 | Modern esports UI, optimistic state updates, real-time views, 7 DSA visualizers |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Data JPA, Flyway, Maven | REST API endpoints, business logic, validation, transaction management |
| **Database** | H2 (in-memory / file-persisted), PostgreSQL compatible | Relational schema, automated Flyway migrations (`V1`–`V4`), seed data loading |
| **Algorithms** | Lomuto QuickSort, Bounded Circular Queue, LIFO Stack | In-memory algorithm implementations with theoretical Big-O guarantees |

---

## Authentic DSA Implementation & Bug Fixes

RANKFORGE preserves the foundational algorithms of the original academic submission while resolving key edge-case limitations:

1. **Queue Starvation Fixed:** The original linear array queue exhausted capacity once head reached tail. RANKFORGE implements a true circular queue using modular arithmetic (`(head + 1) % capacity`), allowing indefinite enqueue/dequeue operations.
2. **Double Score Reversal Fixed:** The academic undo logic suffered from double deduction during score reversal. RANKFORGE wraps score updates in an atomic rollback journal, guaranteeing exact $+10$ / $-10$ reversibility with a floor at zero.
3. **Deterministic QuickSort:** Leaderboard sorting implements descending Lomuto partitioning with secondary key comparison (`player.id` ascending) to ensure identical sort output across all executions.

---

## Running the Application Locally

### Prerequisites

- **Java Development Kit (JDK):** Version 21 or higher
- **Node.js:** Version 20 or higher (with npm)
- **Git:** Version 2.30+

### 1. Start the Java Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

* Backend API will start on: `http://localhost:8080`
* Swagger / Health check: `http://localhost:8080/api/v1/players`
* Database console (H2 dev mode): `http://localhost:8080/h2-console`

### 2. Start the React Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

* Access the web application at: `http://localhost:5173`
* The frontend proxies API requests automatically to `http://localhost:8080`.

---

## Automated Verification

The application is validated by a 165-test automated test suite across all architectural tiers:

```bash
# 1. Run Backend Maven Test Suite (52 tests)
cd backend && mvn test

# 2. Run React Vitest Suite (13 tests)
cd frontend && npm test -- --run

# 3. Verify React Production Build
cd frontend && npm run build

# 4. Run Legacy Regression Suites (70 tests)
node tests/verify_stage1.js
node tests/test_stage2.js
node tests/test_stage3.js
node tests/test_stage4.js

# 5. Run Live HTTP Integration Suite (30 assertions, requires running backend)
node tests/verify_stage8_e2e.js
```

---

## Original Source Preservation

All **eight original repository files** from the academic submission are preserved verbatim in `original-source/` with verified cryptographic integrity against the pinned GitHub commit:

* **Original Repository:** [`https://github.com/mokshithmiryalamk/GAME-LEADERBOARD-PLAYER-RANKING-SYSTEM--DSA-Project`](https://github.com/mokshithmiryalamk/GAME-LEADERBOARD-PLAYER-RANKING-SYSTEM--DSA-Project)
* **Pinned Original Commit:** `9997165e4524f2e0e4f820b0ea5538c0f5c45401`
* **Original Author:** Mokshith Miryala

| File Name | Canonical Git-Blob SHA-1 (`9997165`) | Size | Role in Original Project |
| :--- | :--- | :---: | :--- |
| `Main.java` | `c4ef9899de383b170139005695301770ed5e579c` | 7.1 KB | Console menu driver & match simulation loop |
| `MatchHistoryStack.java` | `5465c8378cc65318f1638ba9170e32e4fdd0472a` | 1.4 KB | LIFO stack for tracking match winners and undo |
| `Player.java` | `6efb15f366bf2a67c4de8abcce769940ca3ac4c0` | 1.5 KB | Core player model (ID, name, team, level, score) |
| `PlayerArray.java` | `0e34cc79a12082d3320594eb9ba222a81cd40b4c` | 12.4 KB | Fixed array storage, searches, and QuickSort |
| `PlayerList.java` | `44d603ce54c80521210cd1b3b562f7b378bcff77` | 2.3 KB | Singly-linked list for active player tracking |
| `PlayerQueue.java` | `77564fd62c87c220873f97c785e85c5884f0abf3` | 1.5 KB | FIFO matchmaking queue for player lobbies |
| `players.txt` | `94c3914aaa173d64d049825b39f3d8bdf8dcced2` | 1.3 KB | Comma-delimited seed data (54 player records) |
| `README.md` | `7e21cc977624ba2905a60129aafa3658543d62e1` | 32 B | Original academic repository heading |

---

## Visual Identity & Design System

The application features an esports-focused **Competitive Arcade Arena** aesthetic:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Carbon** | `#0C0F12` | Primary background, viewport shell |
| **Surface Dark** | `#151A21` | Panel backgrounds, cards, modal sheets |
| **Electric Lime** | `#B8F34B` | Primary interactive accent, active navigation, CTA buttons |
| **Cyber Magenta** | `#F15BB5` | Secondary accent, match indicators, rank promotions |
| **Neon Cyan** | `#00F5D4` | Data visualization metrics, algorithm pointers, telemetry |
| **Victory Gold** | `#FEE440` | Podium first-place highlights, win banners |

---

## Engineering History

For in-depth documentation of the complete multi-stage architectural migration from the original console prototype to the full-stack Spring Boot + React application, see [`docs/DEVELOPMENT_HISTORY.md`](docs/DEVELOPMENT_HISTORY.md).
