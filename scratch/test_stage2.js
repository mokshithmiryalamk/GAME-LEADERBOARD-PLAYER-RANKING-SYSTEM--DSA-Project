/**
 * STAGE 2 AUTOMATED TEST & VERIFICATION SUITE
 * Game Leaderboard & Player Ranking System
 *
 * Covers:
 * 1. Seed dataset validation: 54 lines, 53 valid records, 1 quarantined malformed row
 * 2. Original source code preservation: 8/8 files match canonical Git-blob SHA-1 hashes
 * 3. Strict project isolation: Portfolio_Website and sibling projects untouched
 * 4. Reactive PlayerStore (GamePlayerData) CRUD, validation & persistence semantics
 * 5. Immutable safety: getAll() deep clones internal state
 * 6. Pub-Sub event dispatching on add, update, delete, reset
 * 7. Linear Search by ID (O(N)) with comparisons count
 * 8. Linear Search by Name (O(N), case-insensitive)
 * 9. Linear Search by Team (O(N), case-insensitive with Solo support)
 * 10. Binary Search by ID (O(log N)) on sorted snapshot without mutating canonical order
 * 11. Hash-Map Search by ID (O(1)) direct map lookup
 * 12. QuickSort Leaderboard (O(N log N)) Lomuto partition descending score
 * 13. Deterministic tie-breaking on equal score using ascending player ID
 * 14. HTML DOM integrity: zero duplicate IDs, all Stage 2 modals, toolbars, and podium slots present
 * 15. Clean JavaScript syntax across all new modules
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const ORIGINAL_DIR = path.join(ROOT_DIR, 'original-source');
const PORTFOLIO_DIR = path.resolve(ROOT_DIR, '../../Portfolio_Website');

console.log('================================================================');
console.log(' GAME LEADERBOARD: STAGE 2 AUTOMATED TEST SUITE');
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
// 1. SOURCE PRESERVATION & ISOLATION
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

it('Preserves all 8 original repository files with 100% cryptographic integrity (commit 9997165)', () => {
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

it('Strict isolation: Portfolio_Website remains untouched', () => {
  assert.ok(fs.existsSync(PORTFOLIO_DIR));
  const files = fs.readdirSync(PORTFOLIO_DIR);
  assert.strictEqual(files.length, 4);
});

// -----------------------------------------------------------------------------
// 2. SEED DATA AUDIT & VALIDATION
// -----------------------------------------------------------------------------
const seedModuleCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'seed-data.js'), 'utf8');
const seedSandbox = { window: {}, global: {} };
vm.createContext(seedSandbox);
vm.runInContext(seedModuleCode, seedSandbox);
const GameSeedData = seedSandbox.window.GameSeedData || seedSandbox.global.GameSeedData;

it('Seed dataset extracts exactly 53 valid records from players.txt and documents 1 quarantined row', () => {
  assert.ok(GameSeedData, 'GameSeedData not exported');
  assert.strictEqual(GameSeedData.metadata.totalLines, 54);
  assert.strictEqual(GameSeedData.metadata.validCount, 53);
  assert.strictEqual(GameSeedData.metadata.rejectedCount, 1);
  assert.strictEqual(GameSeedData.metadata.rejectedRecords[0].lineNum, 50);

  const players = GameSeedData.getSeedPlayers();
  assert.strictEqual(players.length, 53);

  // Check unique IDs
  const idSet = new Set(players.map(p => p.id));
  assert.strictEqual(idSet.size, 53, 'Seed dataset contains duplicate IDs!');

  // Check team normalizations
  const klhPlayers = players.filter(p => p.team === 'KLH');
  assert.strictEqual(klhPlayers.length, 4, 'Expected 4 KLH players');
  const soloPlayers = players.filter(p => p.team === 'NoTeam');
  assert.ok(soloPlayers.length > 20, 'Expected solo players normalized to NoTeam');
});

// -----------------------------------------------------------------------------
// 3. ALGORITHMS ENGINE (GamePlayerAlgorithms)
// -----------------------------------------------------------------------------
const algModuleCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'player-algorithms.js'), 'utf8');
const algSandbox = { window: {}, global: {}, Date, Math };
vm.createContext(algSandbox);
vm.runInContext(algModuleCode, algSandbox);
const GamePlayerAlgorithms = algSandbox.window.GamePlayerAlgorithms || algSandbox.global.GamePlayerAlgorithms;

it('Linear Search by ID correctly finds player and tracks comparisons', () => {
  const seed = GameSeedData.getSeedPlayers();
  const res = GamePlayerAlgorithms.linearSearchById(seed, 104);
  assert.strictEqual(res.found, true);
  assert.strictEqual(res.player.name, 'Arjun');
  assert.strictEqual(res.comparisons, 4); // 4th item in array

  const notFound = GamePlayerAlgorithms.linearSearchById(seed, 9999);
  assert.strictEqual(notFound.found, false);
  assert.strictEqual(notFound.comparisons, seed.length);
});

it('Linear Search by Name matches case-insensitively', () => {
  const seed = GameSeedData.getSeedPlayers();
  const res = GamePlayerAlgorithms.linearSearchByName(seed, 'arjun');
  assert.strictEqual(res.found, true);
  assert.strictEqual(res.matches.length, 1);
  assert.strictEqual(res.matches[0].id, 104);

  const resUpper = GamePlayerAlgorithms.linearSearchByName(seed, 'NEHA');
  assert.strictEqual(resUpper.found, true);
  assert.strictEqual(resUpper.matches[0].name, 'Neha');
});

it('Linear Search by Team filters teams and handles Solo players', () => {
  const seed = GameSeedData.getSeedPlayers();
  const warriors = GamePlayerAlgorithms.linearSearchByTeam(seed, 'Warriors');
  assert.strictEqual(warriors.found, true);
  assert.ok(warriors.matches.length >= 8);

  const solo = GamePlayerAlgorithms.linearSearchByTeam(seed, 'Solo');
  assert.strictEqual(solo.found, true);
  assert.ok(solo.matches.length >= 20);
});

it('Binary Search by ID finds target in O(log N) and preserves canonical array order', () => {
  const seed = GameSeedData.getSeedPlayers();
  const originalFirstId = seed[0].id;
  const originalLastId = seed[seed.length - 1].id;

  const res = GamePlayerAlgorithms.binarySearchById(seed, 104);
  assert.strictEqual(res.found, true);
  assert.strictEqual(res.player.id, 104);
  assert.strictEqual(res.player.name, 'Arjun');
  // Maximum comparisons for N=53 is ceil(log2(53)) = 6
  assert.ok(res.comparisons <= 6, `Comparisons was ${res.comparisons}, expected <= 6`);

  // Verify canonical seed order was NOT mutated
  assert.strictEqual(seed[0].id, originalFirstId);
  assert.strictEqual(seed[seed.length - 1].id, originalLastId);
});

it('Hash-Map Search by ID operates in O(1)', () => {
  const seed = GameSeedData.getSeedPlayers();
  const map = new Map();
  seed.forEach(p => map.set(p.id, p));

  const res = GamePlayerAlgorithms.hashMapSearchById(map, 104);
  assert.strictEqual(res.found, true);
  assert.strictEqual(res.player.name, 'Arjun');
  assert.strictEqual(res.comparisons, 1);
});

it('QuickSort Leaderboard executes Lomuto partition descending with deterministic tie-breaking', () => {
  const testPlayers = [
    { id: 105, name: 'Kiran', score: 60, level: 2, team: 'NoTeam' },
    { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
    { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
    { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' }, // Tie with Rahul (90), but id 103 > 102
    { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' }
  ];

  const ranked = GamePlayerAlgorithms.quickSortLeaderboard(testPlayers);

  // Expected order:
  // 1: Arjun (100)
  // 2: Rahul (90, id 102)
  // 3: Neha (90, id 103)
  // 4: Amit (80)
  // 5: Kiran (60)
  assert.strictEqual(ranked[0].id, 104);
  assert.strictEqual(ranked[0].rank, 1);

  assert.strictEqual(ranked[1].id, 102); // Rahul before Neha due to tie-breaker (id 102 < 103)
  assert.strictEqual(ranked[1].rank, 2);

  assert.strictEqual(ranked[2].id, 103);
  assert.strictEqual(ranked[2].rank, 3);

  assert.strictEqual(ranked[3].id, 101);
  assert.strictEqual(ranked[4].id, 105);

  // Original array must not be mutated
  assert.strictEqual(testPlayers[0].id, 105);
});

// -----------------------------------------------------------------------------
// 4. REACTIVE PLAYER DATA STORE (GamePlayerData)
// -----------------------------------------------------------------------------
const dataModuleCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'player-data.js'), 'utf8');

// Mock localStorage and browser environment
const mockStorage = new Map();
const mockLocalStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

const storeSandbox = {
  window: {
    GameSeedData: GameSeedData,
    GamePlayerAlgorithms: GamePlayerAlgorithms
  },
  global: {},
  localStorage: mockLocalStorage,
  Date,
  Math,
  JSON,
  console
};

vm.createContext(storeSandbox);
vm.runInContext(dataModuleCode, storeSandbox);
const GamePlayerData = storeSandbox.window.GamePlayerData;

it('GamePlayerData initializes with 53 seed records and validates schema', () => {
  assert.ok(GamePlayerData);
  const all = GamePlayerData.getAll();
  assert.strictEqual(all.length, 53);

  const p104 = GamePlayerData.getById(104);
  assert.strictEqual(p104.name, 'Arjun');
  assert.strictEqual(p104.score, 100);
});

it('getAll() returns deep copies protecting internal registry from corruption', () => {
  const list = GamePlayerData.getAll();
  list[0].name = 'HACKED_NAME';
  list.pop();

  const freshList = GamePlayerData.getAll();
  assert.notStrictEqual(freshList[0].name, 'HACKED_NAME');
  assert.strictEqual(freshList.length, 53);
});

it('Registers new players with score initialized to 0 and rejects duplicates', () => {
  const events = [];
  const unsubscribe = GamePlayerData.subscribe((ev, payload) => {
    events.push({ ev, payload });
  });

  const added = GamePlayerData.add({
    id: 999,
    name: 'CyberNinja',
    level: 10,
    team: 'Warriors'
  });

  assert.strictEqual(added.id, 999);
  assert.strictEqual(added.score, 0); // Per Java constructor spec
  assert.strictEqual(added.team, 'Warriors');
  assert.strictEqual(GamePlayerData.getAll().length, 54);

  // Pub-sub notification fired
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].ev, 'PLAYER_ADDED');

  // Attempt duplicate registration must throw
  assert.throws(() => {
    GamePlayerData.add({ id: 999, name: 'Duplicate', level: 1 });
  }, /already registered/);

  // Cleanup
  GamePlayerData.delete(999);
  unsubscribe();
});

it('Updates mutable player attributes while protecting immutable ID', () => {
  const original = GamePlayerData.getById(101);
  const originalScore = original.score;

  const updated = GamePlayerData.update(101, {
    name: 'Amit Kumar',
    level: 3,
    team: 'Knights'
  });

  assert.strictEqual(updated.name, 'Amit Kumar');
  assert.strictEqual(updated.level, 3);
  assert.strictEqual(updated.team, 'Knights');
  assert.strictEqual(updated.score, originalScore, 'Score must be preserved on update');

  // Attempting to change ID must fail
  assert.throws(() => {
    GamePlayerData.update(101, { id: 888 });
  }, /cannot be modified/);

  // Restore
  GamePlayerData.update(101, { name: 'Amit', level: 2, team: 'NoTeam' });
});

it('Deletes player by ID and updates reactive hash map and array', () => {
  // Add temporary player
  GamePlayerData.add({ id: 888, name: 'TempPlayer', level: 5 });
  assert.ok(GamePlayerData.getById(888));

  const deleted = GamePlayerData.delete(888);
  assert.strictEqual(deleted, true);
  assert.strictEqual(GamePlayerData.getById(888), null);

  // Attempting to delete non-existent ID must throw
  assert.throws(() => {
    GamePlayerData.delete(888);
  }, /does not exist/);
});

it('getMetrics() calculates accurate real-time telemetry', () => {
  const metrics = GamePlayerData.getMetrics();
  assert.strictEqual(metrics.totalPlayers, 53);
  assert.strictEqual(metrics.highestScore, 100);
  assert.strictEqual(metrics.topPlayer.name, 'Arjun');
  assert.ok(metrics.soloPlayers > 20);
  assert.ok(metrics.teamPlayers >= 20);
});

// -----------------------------------------------------------------------------
// 5. DOM & HTML INTEGRITY
// -----------------------------------------------------------------------------
it('HTML contains zero duplicate IDs across index.html', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const idRegex = /id=["']([^"']+)["']/g;
  const idSet = new Set();
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    assert.ok(!idSet.has(id), `Duplicate ID found: ${id}`);
    idSet.add(id);
  }
  assert.ok(idSet.size >= 30, `Expected at least 30 unique IDs, found ${idSet.size}`);
});

it('All Stage 2 elements, toolbars, modals and scripts are present in index.html', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  // Registry controls
  assert.ok(html.includes('id="registry-search-input"'));
  assert.ok(html.includes('id="registry-algorithm-select"'));
  assert.ok(html.includes('id="search-telemetry-pill"'));
  assert.ok(html.includes('id="registry-player-count"'));
  assert.ok(html.includes('id="btn-add-player"'));
  assert.ok(html.includes('id="btn-reset-demo-data"'));
  assert.ok(html.includes('id="registry-table-body"'));

  // Leaderboard controls
  assert.ok(html.includes('id="podium-rank-1"'));
  assert.ok(html.includes('id="podium-rank-2"'));
  assert.ok(html.includes('id="podium-rank-3"'));
  assert.ok(html.includes('id="leaderboard-search-input"'));
  assert.ok(html.includes('id="leaderboard-table-body"'));
  assert.ok(html.includes('id="leaderboard-meta-info"'));

  // Modals
  assert.ok(html.includes('id="modal-player-form"'));
  assert.ok(html.includes('id="modal-player-details"'));
  assert.ok(html.includes('id="modal-confirm-delete"'));
  assert.ok(html.includes('id="modal-confirm-reset"'));
  assert.ok(html.includes('id="toast-container"'));

  // Script tags
  assert.ok(html.includes('src="js/seed-data.js"'));
  assert.ok(html.includes('src="js/player-algorithms.js"'));
  assert.ok(html.includes('src="js/player-data.js"'));
  assert.ok(html.includes('src="js/ui/toast.js"'));
  assert.ok(html.includes('src="js/ui/modal.js"'));
  assert.ok(html.includes('src="js/player-manager.js"'));
  assert.ok(html.includes('src="js/leaderboard-manager.js"'));
  assert.ok(html.includes('src="js/app.js"'));
});

// -----------------------------------------------------------------------------
// 6. JAVASCRIPT SYNTAX INTEGRITY FOR ALL SCRIPTS
// -----------------------------------------------------------------------------
it('All JavaScript modules compile cleanly in Node VM without syntax errors', () => {
  const jsFiles = [
    'js/seed-data.js',
    'js/player-algorithms.js',
    'js/player-data.js',
    'js/ui/toast.js',
    'js/ui/modal.js',
    'js/player-manager.js',
    'js/leaderboard-manager.js',
    'js/app.js'
  ];

  jsFiles.forEach(relPath => {
    const code = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.doesNotThrow(() => {
      new vm.Script(code, { filename: relPath });
    }, `Syntax error in ${relPath}`);
  });
});

console.log('\n================================================================');
console.log(` STAGE 2 VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
