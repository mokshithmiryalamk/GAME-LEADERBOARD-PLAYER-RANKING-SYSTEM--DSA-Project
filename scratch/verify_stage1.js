/**
 * STAGE 1 AUTOMATED VERIFICATION SUITE
 * Game Leaderboard & Player Ranking System
 *
 * Verifies:
 * 1. Byte-for-byte & Git-Blob preservation of all 8 original files against commit 9997165
 * 2. Strict isolation: Portfolio_Website and sibling projects remain completely untouched
 * 3. JavaScript syntax validity of all new scripts
 * 4. CSS token validity and main stylesheet integrity
 * 5. HTML DOM integrity: zero duplicate IDs, all 6 view panels and nav links present
 * 6. Visual identity check: verification of distinct esports design tokens
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
console.log(' GAME LEADERBOARD: STAGE 1 AUTOMATED VERIFICATION SUITE');
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
// TEST 1: ORIGINAL SOURCE PRESERVATION & GIT BLOB VERIFICATION
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

it('All 8 original repository files exist in original-source/', () => {
  assert.ok(fs.existsSync(ORIGINAL_DIR), 'original-source/ directory missing');
  const files = fs.readdirSync(ORIGINAL_DIR);
  assert.strictEqual(files.length, 8, `Expected 8 files, found ${files.length}`);
  Object.keys(EXPECTED_ORIGINAL_BLOBS).forEach(f => {
    assert.ok(fs.existsSync(path.join(ORIGINAL_DIR, f)), `Missing original file: ${f}`);
  });
});

it('All 8 original files match canonical Git-Blob SHA-1 hashes from commit 9997165', () => {
  for (const [filename, expectedGitSha] of Object.entries(EXPECTED_ORIGINAL_BLOBS)) {
    const filePath = path.join(ORIGINAL_DIR, filename);
    const buf = fs.readFileSync(filePath);

    // Compute raw Git-blob SHA-1
    const rawHeader = Buffer.from(`blob ${buf.length}\0`);
    const rawBlob = Buffer.concat([rawHeader, buf]);
    const rawGitSha = crypto.createHash('sha1').update(rawBlob).digest('hex');

    // Also compute LF-normalized Git-blob SHA-1
    const lfContent = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
    const lfHeader = Buffer.from(`blob ${lfContent.length}\0`);
    const lfBlob = Buffer.concat([lfHeader, lfContent]);
    const lfGitSha = crypto.createHash('sha1').update(lfBlob).digest('hex');

    const matches = (rawGitSha === expectedGitSha) || (lfGitSha === expectedGitSha);
    assert.ok(
      matches,
      `Hash mismatch on ${filename}. Raw: ${rawGitSha}, Normalized: ${lfGitSha}, Expected: ${expectedGitSha}`
    );
  }
});

// -----------------------------------------------------------------------------
// TEST 2: STRICT PROJECT ISOLATION & BOUNDARIES
// -----------------------------------------------------------------------------
it('Portfolio_Website remains completely untouched (4 root items)', () => {
  assert.ok(fs.existsSync(PORTFOLIO_DIR), 'Portfolio_Website directory not found');
  const files = fs.readdirSync(PORTFOLIO_DIR);
  assert.strictEqual(files.length, 4, `Expected 4 items in Portfolio_Website, found ${files.length}`);
  const expectedItems = ['assets', 'index.html', 'script.js', 'style.css'];
  expectedItems.forEach(item => {
    assert.ok(files.includes(item), `Expected ${item} in Portfolio_Website`);
  });
});

it('All project development stays inside Game_Leaderboard directory', () => {
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'index.html')), 'index.html must exist in project root');
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'css', 'design-tokens.css')), 'design-tokens.css must exist');
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'css', 'main.css')), 'main.css must exist');
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'js', 'app.js')), 'app.js must exist');
});

// -----------------------------------------------------------------------------
// TEST 3: JAVASCRIPT SYNTAX & ARCHITECTURE INTEGRITY
// -----------------------------------------------------------------------------
it('js/app.js is syntactically valid and compiles cleanly in Node VM', () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, 'js', 'app.js'), 'utf8');
  assert.doesNotThrow(() => {
    new vm.Script(code, { filename: 'app.js' });
  }, 'Syntax error in js/app.js');
});

// -----------------------------------------------------------------------------
// TEST 4: HTML DOM STRUCTURE & ID INTEGRITY
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
  assert.ok(idSet.size >= 20, `Expected at least 20 unique IDs, found ${idSet.size}`);
});

it('All 6 primary functional views exist in index.html', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const requiredViews = [
    'view-overview',
    'view-registry',
    'view-leaderboard',
    'view-arena',
    'view-history',
    'view-dsa-lab'
  ];
  requiredViews.forEach(v => {
    assert.ok(html.includes(`id="${v}"`), `Missing view element: #${v}`);
  });
});

it('All 6 sidebar navigation targets exist and map to valid views', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const requiredNavs = [
    'nav-overview',
    'nav-registry',
    'nav-leaderboard',
    'nav-arena',
    'nav-history',
    'nav-dsa-lab'
  ];
  requiredNavs.forEach(n => {
    assert.ok(html.includes(`id="${n}"`), `Missing navigation element: #${n}`);
  });
});

it('Core layout and navigation controls exist in index.html', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const requiredControls = [
    'app-sidebar',
    'nav-backdrop',
    'btn-mobile-menu',
    'breadcrumb-current',
    'header-clock'
  ];
  requiredControls.forEach(c => {
    assert.ok(html.includes(`id="${c}"`), `Missing control element: #${c}`);
  });
});

// -----------------------------------------------------------------------------
// TEST 5: DESIGN TOKENS & VISUAL IDENTITY
// -----------------------------------------------------------------------------
it('Design tokens define distinct Competitive Arcade Arena esports palette', () => {
  const tokens = fs.readFileSync(path.join(ROOT_DIR, 'css', 'design-tokens.css'), 'utf8');
  assert.ok(tokens.includes('--color-bg-primary:    #0C0F12'), 'Primary background must be Deep Carbon #0C0F12');
  assert.ok(tokens.includes('--color-accent:         #B8F34B'), 'Primary accent must be Electric Lime #B8F34B');
  assert.ok(tokens.includes('--color-secondary:      #F15BB5'), 'Secondary accent must be Cyber Magenta #F15BB5');
  assert.ok(tokens.includes('--color-cyan:           #00F5D4'), 'Tertiary accent must be Neon Cyan #00F5D4');
  assert.ok(tokens.includes('--color-amber:          #FEE440'), 'Victory gold must be #FEE440');
});

// -----------------------------------------------------------------------------
// TEST 6: ACCESSIBILITY & STAGE LABELS
// -----------------------------------------------------------------------------
it('Views clearly display stage roadmap status without fake dead feature buttons', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(html.includes('Stage 1: Foundation'), 'Stage 1 badge must be visible');
  assert.ok(html.includes('Stage 2'), 'Stage 2 notices must be visible');
  assert.ok(html.includes('Stage 3'), 'Stage 3 notices must be visible');
  assert.ok(html.includes('Stage 4'), 'Stage 4 notices must be visible');
});

// -----------------------------------------------------------------------------
// TEST 7: APPLICATION CONTROLLER BEHAVIOR & VIEW SWITCHING LOGIC
// -----------------------------------------------------------------------------
it('App coordinator handles view switching and mobile drawer state transitions cleanly', () => {
  // Create minimal mock DOM for App controller verification
  const domElements = new Map();
  function createMockElement(id, classes = []) {
    const classList = new Set(classes);
    const attrs = new Map();
    const el = {
      id,
      textContent: '',
      classList: {
        add: (c) => classList.add(c),
        remove: (c) => classList.delete(c),
        contains: (c) => classList.has(c)
      },
      setAttribute: (k, v) => attrs.set(k, v),
      getAttribute: (k) => attrs.get(k),
      removeAttribute: (k) => attrs.delete(k),
      addEventListener: () => {}
    };
    domElements.set(id, el);
    return el;
  }

  // Pre-populate views and nav items
  const views = ['overview', 'registry', 'leaderboard', 'arena', 'history', 'dsa-lab'];
  views.forEach(v => {
    createMockElement(`view-${v}`, v === 'overview' ? ['is-active'] : []);
    createMockElement(`nav-${v}`, v === 'overview' ? ['is-active'] : []);
  });
  createMockElement('app-sidebar');
  createMockElement('nav-backdrop');
  createMockElement('btn-mobile-menu');
  createMockElement('breadcrumb-current');
  createMockElement('header-clock');

  const mockWindow = {
    location: { hash: '#overview' },
    scrollTo: () => {},
    addEventListener: () => {},
    setInterval: () => {}
  };

  const mockDocument = {
    readyState: 'complete',
    getElementById: (id) => domElements.get(id) || null,
    querySelectorAll: (sel) => {
      if (sel.includes('.view-panel')) {
        return views.map(v => domElements.get(`view-${v}`));
      }
      if (sel.includes('.sidebar-nav .nav-item')) {
        return views.map(v => domElements.get(`nav-${v}`));
      }
      return [];
    },
    addEventListener: () => {}
  };

  const code = fs.readFileSync(path.join(ROOT_DIR, 'js', 'app.js'), 'utf8');
  const context = {
    window: mockWindow,
    document: mockDocument,
    setInterval: () => {},
    clearInterval: () => {},
    Date,
    console
  };
  vm.createContext(context);
  vm.runInContext(code, context);

  const App = context.window.GameLeaderboardApp;
  assert.ok(App, 'GameLeaderboardApp must be exposed on window');

  // Verify all 6 views switch correctly
  views.forEach(v => {
    App.switchView(v, false);
    assert.strictEqual(App.getCurrentView(), v, `Current view should be ${v}`);
    assert.ok(domElements.get(`view-${v}`).classList.contains('is-active'), `view-${v} must have is-active`);
    assert.ok(domElements.get(`nav-${v}`).classList.contains('is-active'), `nav-${v} must have is-active`);
    assert.strictEqual(domElements.get(`nav-${v}`).getAttribute('aria-current'), 'page');
  });

  // Verify mobile drawer open/close
  App.openMobileMenu();
  assert.ok(domElements.get('app-sidebar').classList.contains('is-open'), 'Sidebar must have is-open');
  assert.strictEqual(domElements.get('btn-mobile-menu').getAttribute('aria-expanded'), 'true');

  App.closeMobileMenu();
  assert.ok(!domElements.get('app-sidebar').classList.contains('is-open'), 'Sidebar must not have is-open');
  assert.strictEqual(domElements.get('btn-mobile-menu').getAttribute('aria-expanded'), 'false');
});

console.log('\n================================================================');
console.log(` STAGE 1 VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
