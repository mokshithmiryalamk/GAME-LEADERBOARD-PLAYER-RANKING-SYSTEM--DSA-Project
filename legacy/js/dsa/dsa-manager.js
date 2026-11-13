/**
 * GAME LEADERBOARD - INTERACTIVE DATA STRUCTURES & ALGORITHMS LAB
 * Genuine, educational, step-by-step interactive laboratory covering all 7 Java DSA topics:
 * 1. PlayerArray (Indexed Array Storage & O(1) Access)
 * 2. PlayerList (Singly Linked List: Head Insert, Append, Score Chain)
 * 3. PlayerQueue (Circular FIFO Queue & Wrap-Around vs Java Linear Flaw)
 * 4. MatchHistoryStack (LIFO Stack & Match Reversals)
 * 5. Hash Map (ID Key Indexing & Hash Buckets)
 * 6. Search Comparison (Linear O(N) vs Binary Search O(log N))
 * 7. QuickSort Lomuto Partition (End Pivot, Swaps & Tie-Breaking)
 *
 * Requirements:
 * - Operates strictly on isolated educational snapshot datasets (never corrupts live roster).
 * - Interactive controls: Step Forward, Step Backward, Auto-Play/Pause, Reset, Speed selector.
 * - Dynamic explanation narrative log detailing operations and Big-O computational complexities.
 */

(function (window, document) {
  'use strict';

  // Educational sandbox seed items
  const DEMO_ITEMS = [
    { id: 101, name: 'Amit', score: 80, team: 'Solo', level: 2 },
    { id: 102, name: 'Rahul', score: 90, team: 'Warriors', level: 4 },
    { id: 103, name: 'Neha', score: 90, team: 'Knights', level: 3 },
    { id: 104, name: 'Arjun', score: 100, team: 'Warriors', level: 5 },
    { id: 105, name: 'Kiran', score: 60, team: 'Solo', level: 2 },
    { id: 106, name: 'Ravi', score: 70, team: 'Dragons', level: 3 }
  ];

  const DSALab = {
    activeTopic: 'array', // 'array' | 'list' | 'queue' | 'stack' | 'hash' | 'search' | 'quicksort'
    isPlaying: false,
    playInterval: null,
    playSpeedMs: 700,
    currentStepIndex: 0,
    traceSteps: [],

    // Sandbox states for each active visualizer
    state: {},

    init: function () {
      this.cacheElements();
      this.bindEvents();
      this.switchTopic('array');
    },

    cacheElements: function () {
      this.topicTabs = document.querySelectorAll('.dsa-topic-tab');
      this.canvasEl = document.getElementById('dsa-canvas-area');
      this.explanationEl = document.getElementById('dsa-step-explanation');
      this.complexityBadge = document.getElementById('dsa-complexity-badge');
      this.stepCounterEl = document.getElementById('dsa-step-counter');

      this.btnStepBack = document.getElementById('btn-dsa-step-back');
      this.btnStepForward = document.getElementById('btn-dsa-step-forward');
      this.btnPlayPause = document.getElementById('btn-dsa-play-pause');
      this.btnReset = document.getElementById('btn-dsa-reset');
      this.speedSelect = document.getElementById('dsa-speed-select');
      this.actionControls = document.getElementById('dsa-custom-actions');
    },

    bindEvents: function () {
      // Topic Tab switching
      this.topicTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.topicTabs.forEach(t => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          const topic = tab.getAttribute('data-topic');
          this.switchTopic(topic);
        });
      });

      // Navigation Step Controls
      if (this.btnStepForward) {
        this.btnStepForward.addEventListener('click', () => this.stepForward());
      }
      if (this.btnStepBack) {
        this.btnStepBack.addEventListener('click', () => this.stepBackward());
      }
      if (this.btnPlayPause) {
        this.btnPlayPause.addEventListener('click', () => this.toggleAutoPlay());
      }
      if (this.btnReset) {
        this.btnReset.addEventListener('click', () => this.resetSimulation());
      }
      if (this.speedSelect) {
        this.speedSelect.addEventListener('change', (e) => {
          this.playSpeedMs = Number(e.target.value) || 700;
          if (this.isPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
          }
        });
      }
    },

    stopAutoPlay: function () {
      if (this.playInterval) {
        clearInterval(this.playInterval);
        this.playInterval = null;
      }
      this.isPlaying = false;
      if (this.btnPlayPause) this.btnPlayPause.textContent = '▶ Play';
    },

    startAutoPlay: function () {
      this.isPlaying = true;
      if (this.btnPlayPause) this.btnPlayPause.textContent = '⏸ Pause';
      this.playInterval = setInterval(() => {
        if (this.currentStepIndex < this.traceSteps.length - 1) {
          this.stepForward();
        } else {
          this.stopAutoPlay();
        }
      }, this.playSpeedMs);
    },

    toggleAutoPlay: function () {
      if (this.isPlaying) {
        this.stopAutoPlay();
      } else {
        if (this.currentStepIndex >= this.traceSteps.length - 1) {
          this.currentStepIndex = 0;
        }
        this.startAutoPlay();
      }
    },

    switchTopic: function (topic) {
      this.stopAutoPlay();
      this.activeTopic = topic;
      this.currentStepIndex = 0;
      this.traceSteps = [];

      // Generate trace based on topic
      switch (topic) {
        case 'array':
          this.buildArrayTrace();
          break;
        case 'list':
          this.buildListTrace();
          break;
        case 'queue':
          this.buildQueueTrace();
          break;
        case 'stack':
          this.buildStackTrace();
          break;
        case 'hash':
          this.buildHashTrace();
          break;
        case 'search':
          this.buildSearchTrace();
          break;
        case 'quicksort':
          this.buildQuickSortTrace();
          break;
      }

      this.renderActionControls();
      this.renderCurrentStep();
    },

    resetSimulation: function () {
      this.stopAutoPlay();
      this.currentStepIndex = 0;
      this.renderCurrentStep();
    },

    stepForward: function () {
      if (this.currentStepIndex < this.traceSteps.length - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
      }
    },

    stepBackward: function () {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        this.renderCurrentStep();
      }
    },

    // =========================================================================
    // 1. TOPIC: PLAYER ARRAY (O(1) ACCESS & CONTIGUOUS SLOTS)
    // =========================================================================
    buildArrayTrace: function () {
      const items = DEMO_ITEMS.map(p => ({ ...p }));
      this.traceSteps = [
        {
          title: 'PlayerArray: Contiguous Memory Layout',
          complexity: 'O(1) Index Access • O(N) Traversal',
          explanation: 'PlayerArray.java allocates a fixed array (capacity 100). Elements are stored in contiguous memory slots accessible directly via index [0..N-1].',
          activeIndex: null,
          items: items
        },
        ...items.map((item, idx) => ({
          title: `Direct Index Lookup: players[${idx}]`,
          complexity: 'O(1) Direct Memory Access',
          explanation: `Pointer access at index [${idx}] yields ${item.name} (#${item.id}, Score: ${item.score}). Zero search overhead; address computed in O(1).`,
          activeIndex: idx,
          items: items
        })),
        {
          title: 'Array Traversal Complete',
          complexity: 'O(N) Complete Scan',
          explanation: `Full sequential iteration inspected all ${items.length} occupied slots across the contiguous block. Unused capacity remains allocated up to 100 slots.`,
          activeIndex: null,
          items: items
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 2. TOPIC: PLAYER LIST (SINGLY LINKED LIST)
    // =========================================================================
    buildListTrace: function () {
      this.traceSteps = [
        {
          title: 'PlayerList: Singly Linked List Chain',
          complexity: 'Head: O(1) • Insert by Score: O(N)',
          explanation: 'PlayerList.java models dynamic nodes holding a Player payload and a `next` pointer. Dynamic memory overcomes fixed array size limits.',
          nodes: [],
          activeNodeId: null
        },
        {
          title: 'Insert at Head (addRecent)',
          complexity: 'O(1) Time',
          explanation: 'Main.java calls addRecent(Kiran). A new node is allocated; newNode.next points to current head, and head shifts to newNode.',
          nodes: [{ id: 105, name: 'Kiran', score: 60 }],
          activeNodeId: 105
        },
        {
          title: 'Insert at Head: Amit',
          complexity: 'O(1) Time',
          explanation: 'addRecent(Amit): newNode.next points to Kiran. Head is updated to Amit. O(1) head insertion preserves most recent players first.',
          nodes: [{ id: 101, name: 'Amit', score: 80 }, { id: 105, name: 'Kiran', score: 60 }],
          activeNodeId: 101
        },
        {
          title: 'Append to Tail (registerTournament)',
          complexity: 'O(N) Time',
          explanation: 'registerTournament(Ravi): Traverses to tail pointer (temp.next == null), then sets temp.next = newNode. Takes O(N) time without tail pointer.',
          nodes: [{ id: 101, name: 'Amit', score: 80 }, { id: 105, name: 'Kiran', score: 60 }, { id: 106, name: 'Ravi', score: 70 }],
          activeNodeId: 106
        },
        {
          title: 'Score-Ordered Chain Insertion (insertByScore)',
          complexity: 'O(N) Time',
          explanation: 'insertByScore(Arjun, 100 PTS): Compares head score (80 < 100). Arjun becomes the new head of the descending score chain!',
          nodes: [{ id: 104, name: 'Arjun', score: 100 }, { id: 101, name: 'Amit', score: 80 }, { id: 105, name: 'Kiran', score: 60 }, { id: 106, name: 'Ravi', score: 70 }],
          activeNodeId: 104
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 3. TOPIC: CIRCULAR QUEUE (FIFO & WRAP-AROUND)
    // =========================================================================
    buildQueueTrace: function () {
      const cap = 6; // 6-slot sandbox to clearly visualize wrap-around
      this.traceSteps = [
        {
          title: 'Circular Match Queue (Capacity 6 Mini-Lobby)',
          complexity: 'O(1) Enqueue • O(1) Dequeue',
          explanation: 'Java PlayerQueue failed after repeated matches because front and rear grew linearly without modulo wrap-around. Our Circular Queue uses (rear + 1) % capacity.',
          slots: new Array(cap).fill(null),
          front: 0,
          rear: -1,
          count: 0
        },
        {
          title: 'Enqueue #101 (Amit)',
          complexity: 'O(1) Enqueue',
          explanation: 'rear = (rear + 1) % 6 -> slot [0]. Amit enters the lobby.',
          slots: [101, null, null, null, null, null],
          front: 0,
          rear: 0,
          count: 1
        },
        {
          title: 'Enqueue #102 & #103',
          complexity: 'O(1) Enqueue',
          explanation: 'rear moves to slot [1] and [2]. Queue count reaches 3 challengers.',
          slots: [101, 102, 103, null, null, null],
          front: 0,
          rear: 2,
          count: 3
        },
        {
          title: 'Dequeue #101 (Match Started)',
          complexity: 'O(1) Dequeue',
          explanation: 'front = (front + 1) % 6 -> front moves to slot [1]. Slot [0] is freed for future challengers!',
          slots: [null, 102, 103, null, null, null],
          front: 1,
          rear: 2,
          count: 2
        },
        {
          title: 'Enqueue #104, #105, #106',
          complexity: 'O(1) Enqueue',
          explanation: 'Challengers fill slots [3], [4], [5]. rear is at end of physical array [5].',
          slots: [null, 102, 103, 104, 105, 106],
          front: 1,
          rear: 5,
          count: 5
        },
        {
          title: 'CIRCULAR WRAP-AROUND: Enqueue #107',
          complexity: 'O(1) Circular Wrap',
          explanation: 'CRITICAL DEMONSTRATION: In Java PlayerQueue, rear++ crashed here. In our Circular Queue, rear = (5 + 1) % 6 = 0! Challenger #107 wraps around to slot [0] safely!',
          slots: [107, 102, 103, 104, 105, 106],
          front: 1,
          rear: 0,
          count: 6
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 4. TOPIC: LIFO STACK (MATCH HISTORY & UNDO)
    // =========================================================================
    buildStackTrace: function () {
      this.traceSteps = [
        {
          title: 'MatchHistoryStack: LIFO Stack Initial State',
          complexity: 'O(1) Push • O(1) Pop (Undo)',
          explanation: 'MatchHistoryStack.java implements a Last-In, First-Out stack. Completed matches are pushed onto top; the latest match is popped to undo.',
          stack: []
        },
        {
          title: 'Push Match 1 (Solo 1v1: Arjun vs Rahul)',
          complexity: 'O(1) Push',
          explanation: 'Arjun wins 1v1 (+10 PTS). Complete match record pushed to stack. top pointer moves to index 0.',
          stack: [{ id: 'match_1v1_001', type: '1v1', winner: 'Arjun (+10)' }]
        },
        {
          title: 'Push Match 2 (Team 2v2: Squad Alpha wins)',
          complexity: 'O(1) Push',
          explanation: '2v2 match finishes. Winning squad (Amit & Neha) awarded +10 PTS each. Match record pushed to top (index 1).',
          stack: [
            { id: 'match_1v1_001', type: '1v1', winner: 'Arjun (+10)' },
            { id: 'match_2v2_002', type: '2v2', winner: 'Amit & Neha (+10 Each)' }
          ]
        },
        {
          title: 'Pop / Undo Latest Match (Bug A & B Corrected)',
          complexity: 'O(1) Atomic Reversal',
          explanation: 'UNDO TRIGGERED: Pops Match 2 from top. Both winning squad members lose exactly 10 PTS atomically (Fixes Java Bug B partial undo and Bug A double deduction). top pointer shifts to Match 1.',
          stack: [{ id: 'match_1v1_001', type: '1v1', winner: 'Arjun (+10)' }],
          undoneMatch: 'match_2v2_002'
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 5. TOPIC: HASH MAP SEARCH (O(1) ID LOOKUP)
    // =========================================================================
    buildHashTrace: function () {
      const bucketCount = 5;
      const seedPlayers = [
        { id: 101, name: 'Amit' },
        { id: 102, name: 'Rahul' },
        { id: 103, name: 'Neha' },
        { id: 104, name: 'Arjun' },
        { id: 105, name: 'Kiran' }
      ];

      this.traceSteps = [
        {
          title: 'Hash Map: Key-to-Bucket Indexing',
          complexity: 'O(1) Average Lookup Time',
          explanation: 'PlayerArray.searchByIdHash(id) uses hash mapping. Integer IDs are converted to bucket indexes via hash(id) = id % bucketCount.',
          buckets: [[], [], [], [], []],
          targetId: null,
          found: false
        },
        {
          title: 'Bucket Distribution Hash Map Population',
          complexity: 'O(1) Insertion',
          explanation: 'IDs hashed into 5 buckets: 101 % 5 = 1, 102 % 5 = 2, 103 % 5 = 3, 104 % 5 = 4, 105 % 5 = 0.',
          buckets: [
            [{ id: 105, name: 'Kiran' }],
            [{ id: 101, name: 'Amit' }],
            [{ id: 102, name: 'Rahul' }],
            [{ id: 103, name: 'Neha' }],
            [{ id: 104, name: 'Arjun' }]
          ],
          targetId: null,
          found: false
        },
        {
          title: 'Instant Lookup: searchByIdHash(104)',
          complexity: 'O(1) Evaluation',
          explanation: 'Hash calculation: 104 % 5 = 4. Jumps directly to bucket [4] in O(1) time and retrieves Arjun! Zero linear scanning across other players.',
          buckets: [
            [{ id: 105, name: 'Kiran' }],
            [{ id: 101, name: 'Amit' }],
            [{ id: 102, name: 'Rahul' }],
            [{ id: 103, name: 'Neha' }],
            [{ id: 104, name: 'Arjun' }]
          ],
          targetId: 104,
          highlightBucket: 4,
          found: true
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 6. TOPIC: LINEAR VS BINARY SEARCH
    // =========================================================================
    buildSearchTrace: function () {
      const sorted = [
        { id: 101, name: 'Amit' },
        { id: 102, name: 'Rahul' },
        { id: 103, name: 'Neha' },
        { id: 105, name: 'Kiran' },
        { id: 106, name: 'Ravi' },
        { id: 108, name: 'Vikram' },
        { id: 110, name: 'Karthik' }
      ];

      this.traceSteps = [
        {
          title: 'Binary Search: Sorted Key Array Required',
          complexity: 'O(log N) vs Linear O(N)',
          explanation: 'binarySearchById(int id) requires array sorted by ID. Each step evaluates the midpoint and cuts the remaining search space by half (divide-and-conquer).',
          array: sorted,
          low: 0,
          high: 6,
          mid: 3,
          targetId: 108,
          comparisons: 0
        },
        {
          title: 'Step 1: Low = 0, High = 6, Mid = 3',
          complexity: 'Comparisons: 1',
          explanation: 'Mid index is 3 (Kiran, ID 105). Compare: 105 < 108. Target is in right half; low shifts to mid + 1 (4). Discards left half completely!',
          array: sorted,
          low: 4,
          high: 6,
          mid: 5,
          targetId: 108,
          comparisons: 1
        },
        {
          title: 'Step 2: Low = 4, High = 6, Mid = 5',
          complexity: 'Comparisons: 2',
          explanation: 'Mid index is 5 (Vikram, ID 108). Compare: 108 == 108. Target found in only 2 comparisons! Linear search would have required 6 comparisons.',
          array: sorted,
          low: 4,
          high: 6,
          mid: 5,
          targetId: 108,
          comparisons: 2,
          found: true
        }
      ];
      return this.traceSteps;
    },

    // =========================================================================
    // 7. TOPIC: QUICKSORT LOMUTO PARTITIONING
    // =========================================================================
    buildQuickSortTrace: function () {
      // 5-player snapshot showing descending score with equal-score tie-breaking
      const arr = [
        { id: 105, name: 'Kiran', score: 60 },
        { id: 102, name: 'Rahul', score: 90 },
        { id: 101, name: 'Amit', score: 80 },
        { id: 103, name: 'Neha', score: 90 },
        { id: 104, name: 'Arjun', score: 100 }
      ];

      this.traceSteps = [
        {
          title: 'QuickSort Lomuto Partitioning Initial Array',
          complexity: 'O(N log N) Average',
          explanation: 'PlayerArray.leaderboardQuick() implements Lomuto partitioning. The pivot is chosen as the last element: pivot = players[end].score.',
          items: arr.map(p => ({ ...p })),
          pivotIdx: 4,
          i: -1,
          j: 0
        },
        {
          title: 'Scanning: Compare j=0 against Pivot (Arjun, 100 PTS)',
          complexity: 'Comparing Descending Order',
          explanation: 'Comparing Kiran (60 PTS) vs Pivot Arjun (100 PTS). 60 < 100: no swap; j increments.',
          items: arr.map(p => ({ ...p })),
          pivotIdx: 4,
          i: -1,
          j: 1
        },
        {
          title: 'Equal Score Tie-Break: Rahul (90) vs Neha (90)',
          complexity: 'Deterministic Tie Policy',
          explanation: 'Rahul and Neha share equal score (90). Tie is deterministically broken using player ID ascending: ID 102 < ID 103 ranks higher.',
          items: arr.map(p => ({ ...p })),
          pivotIdx: 4,
          i: 0,
          j: 2
        },
        {
          title: 'Final Descending QuickSort Result',
          complexity: 'Rankings 1 to 5 Assigned',
          explanation: 'All partitions resolved recursively. Standings: 1. Arjun (100), 2. Rahul (90, ID 102), 3. Neha (90, ID 103), 4. Amit (80), 5. Kiran (60).',
          items: [
            { id: 104, name: 'Arjun', score: 100, rank: 1 },
            { id: 102, name: 'Rahul', score: 90, rank: 2 },
            { id: 103, name: 'Neha', score: 90, rank: 3 },
            { id: 101, name: 'Amit', score: 80, rank: 4 },
            { id: 105, name: 'Kiran', score: 60, rank: 5 }
          ],
          pivotIdx: null,
          i: null,
          j: null,
          isDone: true
        }
      ];
      return this.traceSteps;
    },

    renderActionControls: function () {
      if (!this.actionControls) return;

      if (this.activeTopic === 'list') {
        this.actionControls.innerHTML = `
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="list-head">Insert at Head O(1)</button>
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="list-tail">Append Tail O(N)</button>
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="list-score">Score Insert O(N)</button>
        `;
      } else if (this.activeTopic === 'queue') {
        this.actionControls.innerHTML = `
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="queue-enqueue">Enqueue Challenger</button>
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="queue-dequeue">Dequeue FIFO</button>
        `;
      } else if (this.activeTopic === 'hash') {
        this.actionControls.innerHTML = `
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="hash-104">Lookup ID #104</button>
          <button type="button" class="btn btn--secondary btn--sm" data-dsa-action="hash-102">Lookup ID #102</button>
        `;
      } else {
        this.actionControls.innerHTML = '';
      }

      // Bind action buttons
      const btns = this.actionControls.querySelectorAll('[data-dsa-action]');
      btns.forEach(b => {
        b.addEventListener('click', (e) => {
          const action = e.target.getAttribute('data-dsa-action');
          this.handleCustomAction(action);
        });
      });
    },

    handleCustomAction: function (action) {
      if (action === 'list-head') {
        this.currentStepIndex = 1;
      } else if (action === 'list-tail') {
        this.currentStepIndex = 3;
      } else if (action === 'list-score') {
        this.currentStepIndex = 4;
      } else if (action === 'queue-enqueue') {
        this.currentStepIndex = 5;
      } else if (action === 'queue-dequeue') {
        this.currentStepIndex = 3;
      } else if (action === 'hash-104' || action === 'hash-102') {
        this.currentStepIndex = 2;
      }
      this.renderCurrentStep();
    },

    renderCurrentStep: function () {
      if (!this.canvasEl || this.traceSteps.length === 0) return;

      const step = this.traceSteps[this.currentStepIndex];

      if (this.explanationEl) {
        this.explanationEl.textContent = step.explanation;
      }
      if (this.complexityBadge) {
        this.complexityBadge.textContent = step.complexity;
      }
      if (this.stepCounterEl) {
        this.stepCounterEl.textContent = `Step ${this.currentStepIndex + 1} of ${this.traceSteps.length}`;
      }

      // Delegate rendering to active topic renderer
      switch (this.activeTopic) {
        case 'array':
          this.renderArrayCanvas(step);
          break;
        case 'list':
          this.renderListCanvas(step);
          break;
        case 'queue':
          this.renderQueueCanvas(step);
          break;
        case 'stack':
          this.renderStackCanvas(step);
          break;
        case 'hash':
          this.renderHashCanvas(step);
          break;
        case 'search':
          this.renderSearchCanvas(step);
          break;
        case 'quicksort':
          this.renderQuickSortCanvas(step);
          break;
      }
    },

    renderArrayCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-array-slots">
            ${step.items.map((item, idx) => `
              <div class="dsa-array-cell ${step.activeIndex === idx ? 'dsa-array-cell--active' : ''}">
                <span class="dsa-slot-index font-mono">[${idx}]</span>
                <span class="dsa-slot-name">${item.name}</span>
                <span class="dsa-slot-score font-mono">${item.score} PTS</span>
                <span class="dsa-slot-id font-mono">#${item.id}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    renderListCanvas: function (step) {
      if (step.nodes.length === 0) {
        this.canvasEl.innerHTML = `
          <div class="dsa-viz-container">
            <h4 class="dsa-viz-title">${step.title}</h4>
            <div class="dsa-empty-node font-mono">Head -> NULL (Empty Linked List)</div>
          </div>
        `;
        return;
      }

      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-linked-chain">
            <div class="dsa-head-pointer font-mono">HEAD ➔</div>
            ${step.nodes.map((n, idx) => `
              <div class="dsa-list-node ${step.activeNodeId === n.id ? 'dsa-list-node--active' : ''}">
                <div class="dsa-node-payload">
                  <span class="dsa-node-name">${n.name}</span>
                  <span class="dsa-node-score font-mono">${n.score} PTS</span>
                </div>
                <div class="dsa-node-pointer font-mono">NEXT ➔</div>
              </div>
            `).join('')}
            <div class="dsa-null-terminator font-mono">NULL</div>
          </div>
        </div>
      `;
    },

    renderQueueCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-queue-slots">
            ${step.slots.map((val, idx) => {
              const isFront = step.front === idx;
              const isRear = step.rear === idx;
              return `
                <div class="dsa-queue-slot ${val !== null ? 'dsa-queue-slot--occupied' : ''}">
                  <span class="dsa-queue-slot-idx font-mono">[${idx}]</span>
                  <div class="dsa-queue-slot-val font-mono">${val ? `#${val}` : 'EMPTY'}</div>
                  <div class="dsa-queue-pointers">
                    ${isFront ? '<span class="dsa-ptr dsa-ptr--front">FRONT</span>' : ''}
                    ${isRear ? '<span class="dsa-ptr dsa-ptr--rear">REAR</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="dsa-queue-meta font-mono" style="margin-top: var(--space-4); font-size: 0.75rem; color: var(--color-cyan);">
            Capacity: 6 • Count: ${step.count} • Front: [${step.front}] • Rear: [${step.rear}]
          </div>
        </div>
      `;
    },

    renderStackCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-stack-column">
            ${step.stack.length === 0 ? '<div class="dsa-empty-node font-mono">Stack is Empty (top = -1)</div>' : ''}
            ${step.stack.map((item, idx) => {
              const isTop = idx === step.stack.length - 1;
              return `
                <div class="dsa-stack-frame ${isTop ? 'dsa-stack-frame--top' : ''}">
                  <span class="dsa-stack-badge font-mono">${isTop ? 'TOP ➔' : `[${idx}]`}</span>
                  <div class="dsa-stack-info">
                    <strong>${item.id}</strong> (${item.type})
                    <span style="color: var(--color-accent);">${item.winner}</span>
                  </div>
                </div>
              `;
            }).reverse().join('')}
          </div>
          <div class="font-mono" style="margin-top: var(--space-3); font-size: 0.75rem; color: var(--color-text-muted);">
            LIFO Order: Latest match pushed is at TOP. Pop() removes the top match directly.
          </div>
        </div>
      `;
    },

    renderHashCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-hash-table">
            ${step.buckets.map((bucket, bIdx) => `
              <div class="dsa-hash-bucket ${step.highlightBucket === bIdx ? 'dsa-hash-bucket--hit' : ''}">
                <span class="dsa-bucket-label font-mono">Bucket [${bIdx}]</span>
                <div class="dsa-bucket-entries">
                  ${bucket.length === 0 ? '<span class="dsa-empty-tag font-mono">empty</span>' : ''}
                  ${bucket.map(e => `
                    <div class="dsa-hash-entry ${step.targetId === e.id ? 'dsa-hash-entry--target' : ''}">
                      #${e.id} : ${e.name}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    renderSearchCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-search-array">
            ${step.array.map((item, idx) => {
              const inRange = idx >= step.low && idx <= step.high;
              const isMid = idx === step.mid;
              return `
                <div class="dsa-search-cell ${inRange ? 'dsa-search-cell--inrange' : 'dsa-search-cell--out'} ${isMid ? 'dsa-search-cell--mid' : ''} ${step.found && isMid ? 'dsa-search-cell--found' : ''}">
                  <span class="dsa-slot-index font-mono">[${idx}]</span>
                  <span class="dsa-slot-id font-mono">#${item.id}</span>
                  <span class="dsa-slot-name">${item.name}</span>
                  <div class="dsa-search-tags">
                    ${idx === step.low ? '<span class="dsa-tag dsa-tag--low">LOW</span>' : ''}
                    ${isMid ? '<span class="dsa-tag dsa-tag--mid">MID</span>' : ''}
                    ${idx === step.high ? '<span class="dsa-tag dsa-tag--high">HIGH</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    renderQuickSortCanvas: function (step) {
      this.canvasEl.innerHTML = `
        <div class="dsa-viz-container">
          <h4 class="dsa-viz-title">${step.title}</h4>
          <div class="dsa-quicksort-bars">
            ${step.items.map((item, idx) => {
              const isPivot = step.pivotIdx === idx;
              const isComparing = step.j === idx;
              return `
                <div class="dsa-qs-item ${isPivot ? 'dsa-qs-item--pivot' : ''} ${isComparing ? 'dsa-qs-item--compare' : ''}">
                  <div class="dsa-qs-bar" style="height: ${item.score * 1.4}px;">
                    <span class="dsa-qs-score font-mono">${item.score}</span>
                  </div>
                  <span class="dsa-qs-name">${item.name}</span>
                  <span class="dsa-qs-id font-mono">#${item.id}</span>
                  ${isPivot ? '<span class="badge badge--lime" style="font-size: 0.6rem; margin-top: 4px;">PIVOT</span>' : ''}
                  ${item.rank ? `<span class="badge badge--cyan" style="font-size: 0.6rem; margin-top: 4px;">RANK #${item.rank}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  };

  window.GameDSALab = DSALab;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
