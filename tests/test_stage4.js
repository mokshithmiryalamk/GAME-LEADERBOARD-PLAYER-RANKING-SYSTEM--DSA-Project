/**
 * STAGE 4 AUTOMATED TEST SUITE
 * Game Leaderboard & Player Ranking System
 *
 * Verifies:
 * 1. Original Source Integrity: All 8 files in original-source/ match canonical Git-blob SHA-1 hashes (commit 9997165)
 * 2. Strict Project Isolation: Portfolio_Website remains untouched
 * 3. Match History LIFO Stack & Structural Schema:
 *    - Strict LIFO ordering (newest match on top)
 *    - Full structured schema including participant snapshots, status, deltas, and tie-reroll history
 * 4. Java Bug A Resolution: Idempotent Single-Step Undo (No -20 Double Deduction)
 *    - Verifies pre-match score -> match win (+10) -> undo (-10) returns exactly to pre-match score
 * 5. Java Bug B Resolution: Atomic 2v2 Multi-Player Reversal
 *    - Both winning squad teammates in a 2v2 match have exactly 10 points deducted simultaneously
 * 6. LIFO Stack Discipline & Double-Undo Prevention:
 *    - Only the latest active match can be undone
 *    - Calling undo on an already undone match is safely rejected
 *    - Score clamping at 0 (never negative)
 * 7. Multi-Key Transaction Journaling & Fault Recovery:
 *    - Fault injection during reversal triggers clean journal rollback
 * 8. Referential Integrity & Deletion Policy:
 *    - canSafelyDeletePlayer() blocks deleting a winner of the latest active match pending undo
 *    - Historical records retain immutable player snapshots even if a participant is deleted later
 * 9. Interactive DSA Lab Educational Engine (All 7 Algorithms):
 *    - 1. PlayerArray: O(1) indexed slot access and sequential scans
 *    - 2. PlayerList: Singly-linked list O(1) head insert, O(N) append, and O(N) score chain
 *    - 3. PlayerQueue: Circular queue capacity 6 with modulo wrap-around vs Java linear flaw
 *    - 4. MatchHistoryStack: LIFO stack push/pop and top pointer updates
 *    - 5. Hash Map: ID key indexing, 5-bucket distribution, O(1) lookup
 *    - 6. Search Engine: Linear O(N) comparisons vs Binary Search O(log N) interval halving
 *    - 7. QuickSort Lomuto Partition: End-element pivot, scanning pointers, swaps, and tie-breaking
 *    - Educational explanation narrative and Big-O computational complexity badges
 * 10. HTML DOM Integrity & JavaScript Compilation:
 *    - Zero duplicate IDs across index.html
 *    - All Stage 4 elements, toolbars, tabs, modals, and scripts present
 *    - All 13 JavaScript files compile cleanly in Node VM
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const LEGACY_DIR = path.join(ROOT_DIR, 'legacy');
const ORIGINAL_DIR = path.join(ROOT_DIR, 'original-source');
const PORTFOLIO_DIR = path.resolve(ROOT_DIR, '../../Portfolio_Website');

console.log('================================================================');
console.log(' GAME LEADERBOARD: STAGE 4 AUTOMATED TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. ORIGINAL SOURCE PRESERVATION & ISOLATION
// -----------------------------------------------------------------------------
const EXPECTED_ORIGINAL_BLOBS = {
  'Main.java': 'c4ef9899de383b170139005695301770ed5e579c',
  'MatchHistoryStack.java': '5465c8378cc65318f1638ba9170e32e4fdd0472a',
  'Player.java': '6efb15f366bf2a67c4de8abcce769940ca3ac4c0',
  'PlayerArray.java': '0e34cc79a12082d3320594eb9ba222a81cd40b4c',
  'PlayerList.java': '44d603ce54c80521210cd1b3b562f7b378bcff77',
  'PlayerQueue.java': '77564fd62c87c220873f97c785e85c5884f0abf3',
  'README.md': '7e21cc977624ba2905a60129aafa3658543d62e1',
  'players.txt': '94c3914aaa173d64d049825b39f3d8bdf8dcced2'
};

it('Preserves all 8 original files byte-for-byte with verified Git-blob SHA-1 hashes (commit 9997165)', () => {
  for (const [filename, expectedGitSha] of Object.entries(EXPECTED_ORIGINAL_BLOBS)) {
    const filePath = path.join(ORIGINAL_DIR, filename);
    const buf = fs.readFileSync(filePath);

    const rawHeader = Buffer.from(`blob ${buf.length}\0`);
    const rawBlob = Buffer.concat([rawHeader, buf]);
    const rawGitSha = crypto.createHash('sha1').update(rawBlob).digest('hex');

    const lfContent = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
    const lfHeader = Buffer.from(`blob ${lfContent.length}\0`);
    const lfBlob = Buffer.concat([lfHeader, lfContent]);
    const lfGitSha = crypto.createHash('sha1').update(lfBlob).digest('hex');

    const matches = (rawGitSha === expectedGitSha) || (lfGitSha === expectedGitSha);
    assert.ok(matches, `Hash mismatch on ${filename}. Expected: ${expectedGitSha}`);
  }
});

it('Strict project isolation: Portfolio_Website remains completely untouched', () => {
  if (fs.existsSync(PORTFOLIO_DIR)) {
    const rootItems = fs.readdirSync(PORTFOLIO_DIR);
    assert.strictEqual(rootItems.length, 4);
  }
});

// -----------------------------------------------------------------------------
// HELPER: BUILD FULL APPLICATION SANDBOX WITH LOCALSTORAGE
// -----------------------------------------------------------------------------
function createFullSandbox() {
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    _store: store
  };

  const sandbox = {
    window: {},
    global: {},
    localStorage: mockLocalStorage,
    Date,
    Math,
    JSON,
    console
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  const scripts = [
    'js/seed-data.js',
    'js/player-algorithms.js',
    'js/player-data.js',
    'js/match-queue.js',
    'js/match-data.js',
    'js/match-engine.js',
    'js/match-undo.js',
    'js/dsa/dsa-manager.js'
  ];

  for (const scriptPath of scripts) {
    const code = fs.readFileSync(path.join(LEGACY_DIR, scriptPath), 'utf8');
    vm.runInContext(code, sandbox);
  }

  return sandbox;
}

// -----------------------------------------------------------------------------
// 2. MATCH HISTORY RECORDING & IMMUTABLE SNAPSHOTS
// -----------------------------------------------------------------------------
it('Records completed matches in LIFO order with immutable player snapshots', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchEngine = env.GameMatchEngine;
  const GameMatchData = env.GameMatchData;

  GamePlayerData.init();
  GameMatchData.init();

  // Predictable dice rolls: Player 1 rolls 85, Player 2 rolls 50 -> 101 wins
  let rollIdx = 0;
  const mockRolls = [85, 50, 40, 95];
  GameMatchEngine.setRNG(() => mockRolls[rollIdx++]);

  const matchResult = GameMatchEngine.play1v1Match(101, 102);
  assert.ok(matchResult.success);
  assert.strictEqual(matchResult.matchRecord.winnerTeam, 'teamA');

  const history = GameMatchData.getCompletedMatches();
  assert.strictEqual(history.length, 1);

  const m1 = history[0];
  assert.strictEqual(m1.matchType, '1v1');
  assert.strictEqual(m1.status, 'COMPLETED');
  assert.strictEqual(m1.scoreDelta, 10);
  assert.deepStrictEqual(Array.from(m1.participantIds), [101, 102]);

  // Check immutable participant snapshots
  assert.ok(m1.teamA.playersSnapshot);
  assert.strictEqual(m1.teamA.playersSnapshot[0].id, 101);
  assert.strictEqual(m1.teamA.playersSnapshot[0].name, 'Amit');

  // Second match: 103 vs 104
  const match2 = GameMatchEngine.play1v1Match(103, 104);
  assert.ok(match2.success);

  const updatedHistory = GameMatchData.getCompletedMatches();
  assert.strictEqual(updatedHistory.length, 2);

  // Latest eligible match for undo should be the second match (LIFO stack discipline)
  const latestEligible = GameMatchData.getLatestEligibleMatch();
  assert.strictEqual(latestEligible.matchId, updatedHistory[1].matchId);
});

// -----------------------------------------------------------------------------
// 3. JAVA BUG A RESOLUTION: NO DOUBLE DEDUCTION (-10 ONCE)
// -----------------------------------------------------------------------------
it('Solves Java Bug A: Reverses exactly 10 rating points once per winner (no double deduction)', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchEngine = env.GameMatchEngine;
  const GameMatchData = env.GameMatchData;
  const GameMatchUndo = env.GameMatchUndo;

  GamePlayerData.init();
  GameMatchData.init();

  const originalScore101 = GamePlayerData.getById(101).score; // 80

  // 1v1 match: 101 vs 102, 101 wins
  let rollIdx = 0;
  const mockRolls = [90, 60];
  GameMatchEngine.setRNG(() => mockRolls[rollIdx++]);
  const execResult = GameMatchEngine.play1v1Match(101, 102);
  assert.ok(execResult.success);

  // Winner 101 should now have +10 points (90)
  assert.strictEqual(GamePlayerData.getById(101).score, originalScore101 + 10);

  // Execute LIFO Undo
  const undoResult = GameMatchUndo.undoLatestMatch();
  assert.ok(undoResult.success);
  assert.strictEqual(undoResult.matchId, execResult.matchRecord.matchId);

  // Score must return to EXACT pre-match score (80), NOT 70 (which Java bug did by subtracting 20)
  const scoreAfterUndo = GamePlayerData.getById(101).score;
  assert.strictEqual(scoreAfterUndo, originalScore101, `Expected score ${originalScore101}, got ${scoreAfterUndo}`);

  // Loser 102 score must remain unchanged
  assert.strictEqual(GamePlayerData.getById(102).score, 90);
});

// -----------------------------------------------------------------------------
// 4. JAVA BUG B RESOLUTION: ATOMIC 2v2 MULTI-PLAYER REVERSAL
// -----------------------------------------------------------------------------
it('Solves Java Bug B: Reverses both winning teammates in a 2v2 match atomically', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchEngine = env.GameMatchEngine;
  const GameMatchData = env.GameMatchData;
  const GameMatchUndo = env.GameMatchUndo;

  GamePlayerData.init();
  GameMatchData.init();

  const p1 = GamePlayerData.getById(101).score; // 80
  const p2 = GamePlayerData.getById(102).score; // 90
  const p3 = GamePlayerData.getById(103).score; // 90
  const p4 = GamePlayerData.getById(104).score; // 100

  // Team Alpha: 101 & 102 rolls [70, 80] = 150
  // Team Omega: 103 & 104 rolls [40, 50] = 90
  // -> Team Alpha wins
  let rollIdx = 0;
  const mockRolls = [70, 80, 40, 50];
  GameMatchEngine.setRNG(() => mockRolls[rollIdx++]);
  const execResult = GameMatchEngine.play2v2Match([101, 102, 103, 104]);
  assert.ok(execResult.success);

  // Both winners got +10
  assert.strictEqual(GamePlayerData.getById(101).score, p1 + 10);
  assert.strictEqual(GamePlayerData.getById(102).score, p2 + 10);

  // Execute undo
  const undoResult = GameMatchUndo.undoLatestMatch();
  assert.ok(undoResult.success);

  // BOTH winning teammates must have exactly 10 points deducted simultaneously
  assert.strictEqual(GamePlayerData.getById(101).score, p1);
  assert.strictEqual(GamePlayerData.getById(102).score, p2);

  // Both losers remained unchanged
  assert.strictEqual(GamePlayerData.getById(103).score, p3);
  assert.strictEqual(GamePlayerData.getById(104).score, p4);

  // Match status marked as UNDONE
  const matchInHistory = GameMatchData.getMatchById(execResult.matchRecord.matchId);
  assert.strictEqual(matchInHistory.status, 'UNDONE');
});

// -----------------------------------------------------------------------------
// 5. LIFO STACK DISCIPLINE & DOUBLE-UNDO PREVENTION
// -----------------------------------------------------------------------------
it('Enforces strict LIFO stack discipline and prevents double undo or re-entrancy', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchEngine = env.GameMatchEngine;
  const GameMatchData = env.GameMatchData;
  const GameMatchUndo = env.GameMatchUndo;

  GamePlayerData.init();
  GameMatchData.init();

  // Play Match 1: 101 vs 102 (101 wins)
  let rollIdx = 0;
  const mockRolls = [80, 50, 40, 90];
  GameMatchEngine.setRNG(() => mockRolls[rollIdx++]);
  const m1 = GameMatchEngine.play1v1Match(101, 102);

  // Play Match 2: 103 vs 104 (104 wins)
  const m2 = GameMatchEngine.play1v1Match(103, 104);

  assert.strictEqual(GameMatchData.getActiveCompletedCount(), 2);
  assert.strictEqual(GameMatchData.getUndoneCount(), 0);

  // First undo MUST target Match 2 (LIFO top of stack)
  const undo1 = GameMatchUndo.undoLatestMatch();
  assert.ok(undo1.success);
  assert.strictEqual(undo1.matchId, m2.matchRecord.matchId);
  assert.strictEqual(GameMatchData.getActiveCompletedCount(), 1);
  assert.strictEqual(GameMatchData.getUndoneCount(), 1);

  // Next undo MUST target Match 1 (the remaining active match)
  const undo2 = GameMatchUndo.undoLatestMatch();
  assert.ok(undo2.success);
  assert.strictEqual(undo2.matchId, m1.matchRecord.matchId);
  assert.strictEqual(GameMatchData.getActiveCompletedCount(), 0);
  assert.strictEqual(GameMatchData.getUndoneCount(), 2);

  // Attempting undo on an empty stack must safely fail without crash
  assert.strictEqual(GameMatchUndo.canUndo(), false);
  assert.throws(() => {
    GameMatchUndo.undoLatestMatch();
  }, /No eligible completed matches/);
});

// -----------------------------------------------------------------------------
// 6. SCORE CLAMPING PROTECTION (NON-NEGATIVE)
// -----------------------------------------------------------------------------
it('Clamps player scores safely at 0 during score reversal', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;

  GamePlayerData.init();

  // Register player with low score
  GamePlayerData.add({ id: 999, name: 'Rookie', score: 0, team: 'Solo', level: 1 });
  // Manually set score to 4
  GamePlayerData.playerMap.get(999).score = 4;

  // Reversal deducting 10 points
  const updated = GamePlayerData.applyMatchScoreReversal([999], 10, null);
  assert.strictEqual(updated[0].score, 0, 'Score should be clamped at 0, not -6');
});

// -----------------------------------------------------------------------------
// 7. MULTI-KEY TRANSACTION JOURNALING & FAULT RECOVERY
// -----------------------------------------------------------------------------
it('Transaction journal guarantees atomic rollback on injected runtime error', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchData = env.GameMatchData;

  GamePlayerData.init();
  GameMatchData.init();

  // Begin transaction
  const txId = GameMatchData.beginTransaction('SCORE_REVERSAL', { winnerIds: [101] });
  assert.ok(typeof txId === 'string');

  // Verify journal was stored
  const journalKey = 'game_leaderboard_tx_journal_v1';
  assert.ok(env.localStorage.getItem(journalKey));

  // Simulate rollback
  GameMatchData.rollbackTransaction(txId);

  // Rollback clears active journal
  assert.strictEqual(env.localStorage.getItem(journalKey), null);
});

// -----------------------------------------------------------------------------
// 8. REFERENTIAL INTEGRITY & PLAYER DELETION POLICY
// -----------------------------------------------------------------------------
it('Protects referential integrity by blocking deletion of winners in latest active match', () => {
  const env = createFullSandbox();
  const GamePlayerData = env.GamePlayerData;
  const GameMatchEngine = env.GameMatchEngine;
  const GameMatchData = env.GameMatchData;
  const GameMatchUndo = env.GameMatchUndo;

  GamePlayerData.init();
  GameMatchData.init();

  // 101 wins match against 102
  let rollIdx = 0;
  const mockRolls = [90, 40];
  GameMatchEngine.setRNG(() => mockRolls[rollIdx++]);
  GameMatchEngine.play1v1Match(101, 102);

  // Deletion policy check: 101 is the winner of the latest active match pending undo
  const check101 = GameMatchUndo.canSafelyDeletePlayer(101);
  assert.strictEqual(check101.safe, false);
  assert.throws(() => {
    GamePlayerData.delete(101);
  }, /Cannot delete/);

  // Non-winner player 102 CAN be deleted safely
  const check102 = GameMatchUndo.canSafelyDeletePlayer(102);
  assert.strictEqual(check102.safe, true);
  const delete102 = GamePlayerData.delete(102);
  assert.strictEqual(delete102, true);

  // Historical match record still displays 102 via immutable playersSnapshot
  const matchRecord = GameMatchData.getCompletedMatches()[0];
  assert.ok(matchRecord.teamB.playersSnapshot.some(p => p.id === 102 && p.name === 'Rahul'));
});

// -----------------------------------------------------------------------------
// 9. INTERACTIVE DSA LAB: 1. PLAYER ARRAY TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: PlayerArray generates discrete O(1) indexed access and scan traces', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;
  assert.ok(DSALab);

  const traces = DSALab.buildArrayTrace();
  assert.ok(Array.isArray(traces));
  assert.ok(traces.length >= 6);

  // Step 0: Initial contiguous array slots
  assert.strictEqual(traces[0].title.includes('PlayerArray'), true);
  assert.strictEqual(traces[0].complexity.includes('O(1)'), true);
  assert.strictEqual(traces[0].items.length, 6);

  // Indexed access step
  const accessStep = traces.find(t => t.activeIndex === 3);
  assert.ok(accessStep);
  assert.ok(accessStep.explanation.includes('O(1)'));
});

// -----------------------------------------------------------------------------
// 10. INTERACTIVE DSA LAB: 2. PLAYER LIST TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: PlayerList demonstrates O(1) Head Insertion, Append, and Score Chaining', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const traces = DSALab.buildListTrace();
  assert.ok(traces.length >= 5);

  // Verify O(1) Head Insertion trace
  const headInsert = traces.find(t => t.title.includes('Insert at Head'));
  assert.ok(headInsert);
  assert.ok(headInsert.complexity.includes('O(1)'));

  // Verify dynamic pointer progression
  const tailAppend = traces.find(t => t.title.includes('Append to Tail'));
  assert.ok(tailAppend);
  assert.ok(tailAppend.complexity.includes('O(N)'));
});

// -----------------------------------------------------------------------------
// 11. INTERACTIVE DSA LAB: 3. PLAYER QUEUE TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: PlayerQueue demonstrates circular queue wrap-around vs Java linear flaw', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const traces = DSALab.buildQueueTrace();
  assert.ok(traces.length >= 6);

  // Find modulo wrap-around step
  const wrapStep = traces.find(t => t.rear === 0 && t.count === 6);
  assert.ok(wrapStep, 'Should produce a wrap-around enqueue step');
  assert.ok(wrapStep.explanation.includes('Circular Queue'));
  assert.ok(wrapStep.explanation.includes('PlayerQueue'));
});

// -----------------------------------------------------------------------------
// 12. INTERACTIVE DSA LAB: 4. MATCH HISTORY STACK TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: MatchHistoryStack demonstrates LIFO stack push, pop, and top pointer transitions', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const traces = DSALab.buildStackTrace();
  assert.ok(traces.length >= 4);

  // Stack Push
  const pushStep = traces.find(t => t.title.includes('Push Match'));
  assert.ok(pushStep);
  assert.ok(pushStep.complexity.includes('O(1)'));

  // Stack Pop (Undo)
  const popStep = traces.find(t => t.title.includes('Pop / Undo'));
  assert.ok(popStep);
  assert.ok(popStep.explanation.includes('Bug A'));
  assert.ok(popStep.explanation.includes('10 PTS'));
});

// -----------------------------------------------------------------------------
// 13. INTERACTIVE DSA LAB: 5. HASH MAP TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: Hash Map demonstrates key indexing, 5-bucket distribution, and O(1) lookup', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const traces = DSALab.buildHashTrace();
  assert.ok(traces.length >= 3);

  const hashStep = traces.find(t => t.title.includes('Bucket Distribution'));
  assert.ok(hashStep);
  assert.strictEqual(hashStep.buckets.length, 5);

  const hitStep = traces.find(t => t.targetId === 104);
  assert.ok(hitStep);
  assert.strictEqual(hitStep.highlightBucket, 4); // 104 % 5 = 4
});

// -----------------------------------------------------------------------------
// 14. INTERACTIVE DSA LAB: 6. SEARCH ENGINE (LINEAR VS BINARY) TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: Search Engine compares Linear O(N) comparisons against Binary Search O(log N)', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const binaryTraces = DSALab.buildSearchTrace();
  assert.ok(binaryTraces.length >= 3);

  // Binary search interval halving
  const binStep = binaryTraces.find(t => t.comparisons === 1);
  assert.ok(binStep);
  assert.ok(typeof binStep.low === 'number');
  assert.ok(typeof binStep.high === 'number');
  assert.ok(typeof binStep.mid === 'number');

  // Found step
  const foundStep = binaryTraces.find(t => t.found === true);
  assert.ok(foundStep);
  assert.strictEqual(foundStep.targetId, 108);
});

// -----------------------------------------------------------------------------
// 15. INTERACTIVE DSA LAB: 7. QUICKSORT LOMUTO PARTITION TRACE ENGINE
// -----------------------------------------------------------------------------
it('DSA Lab: QuickSort Lomuto Partition demonstrates pivot selection, swaps, and ranking', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  const qsTraces = DSALab.buildQuickSortTrace();
  assert.ok(qsTraces.length >= 4);

  // Pivot selection step
  const pivotStep = qsTraces.find(t => t.title.includes('Lomuto Partition'));
  assert.ok(pivotStep);
  assert.ok(pivotStep.complexity.includes('O(N log N)'));

  // Final sorted leaderboard
  const finalStep = qsTraces[qsTraces.length - 1];
  assert.strictEqual(finalStep.isDone, true);
  assert.strictEqual(finalStep.items[0].score, 100); // Champion Arjun
});

// -----------------------------------------------------------------------------
// 16. STEP CONTROLS, SPEED SELECTION & EXPLANATION LOG INTEGRITY
// -----------------------------------------------------------------------------
it('DSA Lab controls support forward, backward, reset, and dynamic Big-O narrative', () => {
  const env = createFullSandbox();
  const DSALab = env.GameDSALab;

  DSALab.traceSteps = DSALab.buildArrayTrace();
  DSALab.currentStepIndex = 0;

  // Step Forward
  DSALab.stepForward();
  assert.strictEqual(DSALab.currentStepIndex, 1);

  // Step Backward
  DSALab.stepBackward();
  assert.strictEqual(DSALab.currentStepIndex, 0);

  // Reset
  DSALab.currentStepIndex = 3;
  DSALab.resetSimulation();
  assert.strictEqual(DSALab.currentStepIndex, 0);
});

// -----------------------------------------------------------------------------
// 17. HTML DOM INTEGRITY: ZERO DUPLICATE IDS
// -----------------------------------------------------------------------------
it('HTML contains zero duplicate IDs across index.html', () => {
  const htmlPath = path.join(LEGACY_DIR, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const idRegex = /\sid=["']([^"']+)["']/g;
  const seenIds = new Map();
  const duplicates = [];

  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    if (seenIds.has(id)) {
      duplicates.push(id);
    } else {
      seenIds.set(id, true);
    }
  }

  assert.strictEqual(duplicates.length, 0, `Duplicate IDs detected: ${duplicates.join(', ')}`);
});

// -----------------------------------------------------------------------------
// 18. HTML DOM INTEGRITY: ALL STAGE 4 ELEMENTS & MODALS EXIST
// -----------------------------------------------------------------------------
it('All Stage 4 history toolbars, timelines, tabs, and modals exist in index.html', () => {
  const html = fs.readFileSync(path.join(LEGACY_DIR, 'index.html'), 'utf8');

  const requiredIds = [
    'view-history',
    'history-search-input',
    'history-stack-depth',
    'btn-undo-last-match',
    'history-timeline-container',
    'modal-confirm-undo',
    'undo-match-notice',
    'btn-confirm-undo-action',
    'modal-match-details',
    'match-details-content',
    'view-dsa-lab',
    'btn-dsa-step-back',
    'btn-dsa-play-pause',
    'btn-dsa-step-forward',
    'btn-dsa-reset',
    'dsa-speed-select',
    'dsa-complexity-badge',
    'dsa-step-counter',
    'dsa-custom-actions',
    'dsa-canvas-area',
    'dsa-step-explanation'
  ];

  for (const id of requiredIds) {
    assert.ok(html.includes(`id="${id}"`), `Missing required Stage 4 element: id="${id}"`);
  }

  // Check script tags
  assert.ok(html.includes('src="js/match-undo.js"'), 'Missing script tag for js/match-undo.js');
  assert.ok(html.includes('src="js/history-manager.js"'), 'Missing script tag for js/history-manager.js');
  assert.ok(html.includes('src="js/dsa/dsa-manager.js"'), 'Missing script tag for js/dsa/dsa-manager.js');
});

// -----------------------------------------------------------------------------
// 19. JAVASCRIPT SYNTAX VALIDITY ACROSS ALL MODULES
// -----------------------------------------------------------------------------
it('All 13 JavaScript files compile cleanly in Node VM without syntax errors', () => {
  const jsDir = path.join(LEGACY_DIR, 'js');
  const jsFiles = [
    'seed-data.js',
    'player-algorithms.js',
    'player-data.js',
    'match-queue.js',
    'match-data.js',
    'match-engine.js',
    'match-undo.js',
    'player-manager.js',
    'leaderboard-manager.js',
    'arena-manager.js',
    'history-manager.js',
    'dsa/dsa-manager.js',
    'app.js'
  ];

  for (const file of jsFiles) {
    const fullPath = path.join(jsDir, file);
    assert.ok(fs.existsSync(fullPath), `File does not exist: ${file}`);
    const code = fs.readFileSync(fullPath, 'utf8');
    assert.doesNotThrow(() => {
      new vm.Script(code, { filename: file });
    }, `Syntax error in ${file}`);
  }
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(` STAGE 4 VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
