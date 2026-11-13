import React, { useState, useEffect, useRef } from 'react';

const TOPICS = [
  { id: 'array', name: 'PlayerArray', icon: '📦', subtitle: 'Indexed O(1) Storage', complexity: 'Time: O(1) access, O(N) search | Space: O(N)' },
  { id: 'list', name: 'PlayerList', icon: '🔗', subtitle: 'Singly Linked List', complexity: 'Time: O(1) head insert, O(N) append | Space: O(N)' },
  { id: 'queue', name: 'PlayerQueue', icon: '🔄', subtitle: 'Circular FIFO Queue', complexity: 'Time: O(1) enqueue, O(1) dequeue | Space: O(K)' },
  { id: 'stack', name: 'MatchHistoryStack', icon: '🥞', subtitle: 'LIFO Undo Stack', complexity: 'Time: O(1) push, O(1) pop | Space: O(M)' },
  { id: 'hash', name: 'Hash Map', icon: '🗂️', subtitle: 'ID Hash Buckets', complexity: 'Time: O(1) average, O(N) worst | Space: O(B)' },
  { id: 'search', name: 'Search Algorithms', icon: '🔍', subtitle: 'Linear vs Binary Search', complexity: 'Linear: O(N) | Binary: O(log N) | Space: O(1)' },
  { id: 'quicksort', name: 'QuickSort Lomuto', icon: '⚡', subtitle: 'Divide & Conquer Partition', complexity: 'Time: O(N log N) avg, O(N²) worst | Space: O(log N)' },
];

export default function DsaLabView() {
  const [activeTopic, setActiveTopic] = useState('array');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const timerRef = useRef(null);

  // Generate trace steps based on topic
  const getTopicData = (topic) => {
    switch (topic) {
      case 'array':
        return [
          {
            title: 'Initial Contender Array Allocation',
            explanation: 'Allocating fixed-size contiguous memory array for 6 contenders. Direct indexing provides instant O(1) pointer arithmetic access.',
            items: [
              { index: 0, id: 101, name: 'Amit', score: 80, active: false },
              { index: 1, id: 102, name: 'Rahul', score: 90, active: false },
              { index: 2, id: 103, name: 'Neha', score: 90, active: false },
              { index: 3, id: 104, name: 'Arjun', score: 100, active: false },
              { index: 4, id: 105, name: 'Kiran', score: 60, active: false },
              { index: 5, id: 106, name: 'Ravi', score: 70, active: false },
            ],
          },
          {
            title: 'O(1) Direct Memory Dereference',
            explanation: 'Accessing playerArray[3] calculates Memory_Base + (3 * sizeof(Player)) in constant time O(1). Arjun (ID 104, 100 PTS) fetched instantly.',
            items: [
              { index: 0, id: 101, name: 'Amit', score: 80, active: false },
              { index: 1, id: 102, name: 'Rahul', score: 90, active: false },
              { index: 2, id: 103, name: 'Neha', score: 90, active: false },
              { index: 3, id: 104, name: 'Arjun', score: 100, active: true },
              { index: 4, id: 105, name: 'Kiran', score: 60, active: false },
              { index: 5, id: 106, name: 'Ravi', score: 70, active: false },
            ],
          },
          {
            title: 'In-Place Point Increment Mutation',
            explanation: 'Arjun wins combat. playerArray[3].score mutated from 100 to 110 PTS with zero array re-allocation.',
            items: [
              { index: 0, id: 101, name: 'Amit', score: 80, active: false },
              { index: 1, id: 102, name: 'Rahul', score: 90, active: false },
              { index: 2, id: 103, name: 'Neha', score: 90, active: false },
              { index: 3, id: 104, name: 'Arjun', score: 110, active: true, mutated: true },
              { index: 4, id: 105, name: 'Kiran', score: 60, active: false },
              { index: 5, id: 106, name: 'Ravi', score: 70, active: false },
            ],
          },
        ];

      case 'list':
        return [
          {
            title: 'Head Insert O(1)',
            explanation: 'Creating new Node("Amit", 101, 80). New node points to existing head. O(1) operation without shifting elements.',
            nodes: ['[Amit #101 (80)] -> NULL'],
          },
          {
            title: 'Prepend Second Contender',
            explanation: 'Creating Node("Rahul", 102, 90). Node.next points to Amit. Head updated to Rahul in O(1) constant time.',
            nodes: ['[Rahul #102 (90)] ->', '[Amit #101 (80)] -> NULL'],
          },
          {
            title: 'Append O(N) Traversal',
            explanation: 'Appending Node("Neha", 103, 90) requires traversing from Head to Tail (2 hops). Node attached at end.',
            nodes: ['[Rahul #102 (90)] ->', '[Amit #101 (80)] ->', '[Neha #103 (90)] -> NULL'],
          },
        ];

      case 'queue':
        return [
          {
            title: 'Empty Circular Buffer (Capacity 5)',
            explanation: 'Buffer with Head = 0, Tail = 0, Count = 0. Modulo arithmetic (idx % 5) enables infinite wrap-around.',
            slots: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            head: 0,
            tail: 0,
          },
          {
            title: 'Enqueue 3 Players',
            explanation: 'Enqueued Amit, Rahul, Neha. Tail moves to index 3. Head remains at 0. Count = 3.',
            slots: ['Amit (80)', 'Rahul (90)', 'Neha (90)', 'EMPTY', 'EMPTY'],
            head: 0,
            tail: 3,
          },
          {
            title: 'Dequeue Head for 1v1 Combat',
            explanation: 'Consuming Amit for combat. Head advances via (0 + 1) % 5 = 1. Slot 0 is freed for reuse.',
            slots: ['[RECYCLED]', 'Rahul (90)', 'Neha (90)', 'EMPTY', 'EMPTY'],
            head: 1,
            tail: 3,
          },
          {
            title: 'Wrap-Around Enqueue',
            explanation: 'Enqueuing Kiran and Ravi. Tail wraps past slot 4 to slot 0: (4 + 1) % 5 = 0. No memory reallocation required!',
            slots: ['Ravi (70) [WRAPPED]', 'Rahul (90)', 'Neha (90)', 'Arjun (100)', 'Kiran (60)'],
            head: 1,
            tail: 0,
          },
        ];

      case 'stack':
        return [
          {
            title: 'Empty LIFO Match Stack',
            explanation: 'Stack pointer Top = -1. Stack ready to record combat results.',
            stack: [],
          },
          {
            title: 'Push Match #1 to Stack',
            explanation: 'Match #1 (Amit vs Rahul -> Winner: Rahul +10) pushed to stack. Top = 0.',
            stack: ['Match #1: Amit vs Rahul (Winner: Rahul +10)'],
          },
          {
            title: 'Push Match #2 to Stack',
            explanation: 'Match #2 (Neha vs Arjun -> Winner: Arjun +10) pushed on top. Top = 1.',
            stack: [
              'Match #2: Neha vs Arjun (Winner: Arjun +10) [TOP]',
              'Match #1: Amit vs Rahul (Winner: Rahul +10)',
            ],
          },
          {
            title: 'Atomic Undo: Pop Top Match',
            explanation: 'Popping Match #2. 10 points deducted from Arjun atomically. Match #1 is now top of the stack.',
            stack: ['Match #1: Amit vs Rahul (Winner: Rahul +10) [NEW TOP]'],
          },
        ];

      case 'hash':
        return [
          {
            title: 'Hash Bucket Initialization (Size: 4)',
            explanation: 'Buckets [0, 1, 2, 3]. Hash function: bucketIndex = (playerId) % 4.',
            buckets: [[], [], [], []],
          },
          {
            title: 'Insert Players with Hashing',
            explanation: 'ID 101 % 4 = 1 -> Bucket 1. ID 102 % 4 = 2 -> Bucket 2. ID 104 % 4 = 0 -> Bucket 0.',
            buckets: [
              ['[#104 Arjun]'],
              ['[#101 Amit]'],
              ['[#102 Rahul]'],
              [],
            ],
          },
          {
            title: 'Collision Resolution via Chaining',
            explanation: 'ID 105 % 4 = 1. Collides with Amit in Bucket 1! Chained to Bucket 1 linked list in O(1).',
            buckets: [
              ['[#104 Arjun]'],
              ['[#101 Amit] -> [#105 Kiran] (Collision Chain)'],
              ['[#102 Rahul]'],
              [],
            ],
          },
        ];

      case 'search':
        return [
          {
            title: 'Target: Find Contender ID #104 (Arjun)',
            explanation: 'Array has 6 elements. Comparing Linear Search O(N) vs Binary Search O(log N).',
            array: [101, 102, 103, 104, 105, 106],
            linearIdx: 0,
            binaryRange: [0, 5],
            binaryMid: 2,
          },
          {
            title: 'Step 1: Check Indices',
            explanation: 'Linear checks idx 0 (101 != 104). Binary inspects mid idx 2 (103 < 104), instantly eliminating lower 50%!',
            array: [101, 102, 103, 104, 105, 106],
            linearIdx: 1,
            binaryRange: [3, 5],
            binaryMid: 4,
          },
          {
            title: 'Step 2: Binary Search Finds Target in 2 Ops',
            explanation: 'Binary checks mid idx 4 (105 > 104), pivots to idx 3 (#104 FOUND!). Linear search still evaluating idx 2.',
            array: [101, 102, 103, 104, 105, 106],
            linearIdx: 2,
            binaryRange: [3, 3],
            binaryMid: 3,
            found: true,
          },
        ];

      case 'quicksort':
        return [
          {
            title: 'Lomuto Partition: Choose End Pivot',
            explanation: 'Initial unsorted scores: [80, 90, 60, 100, 70]. Pivot selected as end element 70. i = -1, j = 0.',
            arr: [80, 90, 60, 100, 70],
            pivot: 70,
            i: -1,
            j: 0,
          },
          {
            title: 'Scan Elements & Swap Smaller to Left',
            explanation: 'Score 60 < 70 (Pivot). i increments to 0. Swap arr[0] (80) with arr[2] (60).',
            arr: [60, 90, 80, 100, 70],
            pivot: 70,
            i: 0,
            j: 2,
          },
          {
            title: 'Place Pivot in Sorted Position',
            explanation: 'Swap pivot (70) with arr[i + 1] (90). All elements left of 70 are <= 70, all right are > 70.',
            arr: [60, 70, 80, 100, 90],
            pivot: 70,
            pivotPlaced: true,
          },
          {
            title: 'Recursive Sorting Completed',
            explanation: 'Sub-arrays sorted recursively. Final descending standings: 100, 90, 80, 70, 60.',
            arr: [100, 90, 80, 70, 60],
            completed: true,
          },
        ];

      default:
        return [];
    }
  };

  const currentTopicData = getTopicData(activeTopic);
  const activeStepData = currentTopicData[currentStep] || currentTopicData[0];
  const activeTopicMeta = TOPICS.find((t) => t.id === activeTopic);

  // Play / Pause auto playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= currentTopicData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTopicData.length, speedMs]);

  // Topic switch handler
  const handleSelectTopic = (topicId) => {
    setIsPlaying(false);
    setActiveTopic(topicId);
    setCurrentStep(0);
  };

  return (
    <section id="view-dsa-lab" className="view-panel is-active" aria-labelledby="dsa-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Data Structures &amp; Algorithms Laboratory</span>
          <span className="badge badge--cyan">7 Interactive Labs</span>
        </div>
        <h1 id="dsa-title" className="page-title">
          Interactive DSA Algorithm Simulator
        </h1>
        <p className="page-description">
          Step-by-step interactive visualizer for the core Java Data Structures and Algorithms powering RANKFORGE.
          Explore memory layouts, Big-O computational complexities, and algorithmic execution traces.
        </p>
      </header>

      {/* Educational Simulation Notice */}
      <div className="stage-notice" role="region" aria-label="Educational Disclaimer" style={{ marginBottom: '1.5rem' }}>
        <span className="stage-notice__icon" aria-hidden="true">🔬</span>
        <div>
          <h2 className="stage-notice__title">Pedagogical Visual Simulation</h2>
          <p className="stage-notice__body">
            This laboratory renders client-side step-by-step visual simulations of the 7 core Data Structures and Algorithms.
            In production gameplay, ranking, and matchmaking, the authoritative calculations and mutations are executed exclusively
            by the compiled Java Spring Boot backend (<code>QuickSort.java</code>, <code>JavaCircularQueue.java</code>, <code>MatchHistoryStack.java</code>).
          </p>
        </div>
      </div>

      {/* TOPIC SELECTION TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={`btn ${activeTopic === topic.id ? 'btn--primary' : 'btn--outline'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => handleSelectTopic(topic.id)}
          >
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE LAB CARD */}
      <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                {activeTopicMeta?.icon} {activeTopicMeta?.name}
              </h2>
              <span className="badge badge--lime">{activeTopicMeta?.subtitle}</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent, #00F5D4)' }}>
              {activeTopicMeta?.complexity}
            </div>
          </div>

          {/* PLAYBACK CONTROLS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--outline"
              style={{ padding: '0.4rem 0.75rem' }}
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            >
              ⏮ Step Back
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ padding: '0.4rem 1rem' }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸ Pause' : '▶ Auto-Play'}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ padding: '0.4rem 0.75rem' }}
              disabled={currentStep >= currentTopicData.length - 1}
              onClick={() => setCurrentStep((p) => Math.min(currentTopicData.length - 1, p + 1))}
            >
              Step Next ⏭
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ padding: '0.4rem 0.75rem' }}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
            >
              🔄 Reset
            </button>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff', fontSize: '0.8rem' }}
            >
              <option value={1500}>0.5x Slow</option>
              <option value={800}>1.0x Normal</option>
              <option value={350}>2.0x Fast</option>
            </select>
          </div>
        </div>

        {/* STEP BANNER */}
        <div style={{ background: '#0C0F12', border: '1px solid #2A323D', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-primary, #B8F34B)', fontSize: '1rem' }}>
              Step {currentStep + 1} of {currentTopicData.length}: {activeStepData?.title}
            </span>
            <span className="badge badge--neutral font-mono">
              Trace Index {currentStep}
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {activeStepData?.explanation}
          </p>
        </div>

        {/* VISUAL CANVAS STAGE */}
        <div
          style={{
            background: 'var(--color-surface-raised, #181E24)',
            border: '1px solid #2A323D',
            borderRadius: '10px',
            padding: '2rem 1.5rem',
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          {/* ARRAY VISUALIZER */}
          {activeTopic === 'array' && activeStepData.items && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {activeStepData.items.map((it) => (
                <div
                  key={it.index}
                  style={{
                    backgroundColor: it.active ? 'rgba(184, 243, 75, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                    border: it.active ? '2px solid var(--color-primary, #B8F34B)' : '1px solid #2A323D',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    minWidth: '100px',
                    transform: it.active ? 'scale(1.05)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                    [{it.index}]
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{it.name}</div>
                  <div style={{ fontSize: '0.85rem', color: it.mutated ? 'var(--color-secondary, #F15BB5)' : 'var(--color-accent, #00F5D4)', fontFamily: 'var(--font-mono)' }}>
                    {it.score} PTS
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LINKED LIST VISUALIZER */}
          {activeTopic === 'list' && activeStepData.nodes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {activeStepData.nodes.map((nodeText, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(0, 245, 212, 0.08)',
                    border: '1px solid var(--color-accent, #00F5D4)',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent, #00F5D4)',
                    fontSize: '0.9rem',
                  }}
                >
                  {nodeText}
                </div>
              ))}
            </div>
          )}

          {/* CIRCULAR QUEUE VISUALIZER */}
          {activeTopic === 'queue' && activeStepData.slots && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {activeStepData.slots.map((slotText, idx) => {
                const isHead = idx === activeStepData.head;
                const isTail = idx === activeStepData.tail;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: isHead ? '2px solid #FFD700' : isTail ? '2px solid #F15BB5' : '1px solid #2A323D',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      textAlign: 'center',
                      minWidth: '110px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      Slot {idx} {isHead && '👑 HEAD'} {isTail && '🎯 TAIL'}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{slotText}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIFO STACK VISUALIZER */}
          {activeTopic === 'stack' && (
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
              {activeStepData.stack.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>[EMPTY STACK]</div>
              ) : (
                activeStepData.stack.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(241, 91, 181, 0.1)',
                      border: '1px solid var(--color-secondary, #F15BB5)',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          )}

          {/* HASH MAP VISUALIZER */}
          {activeTopic === 'hash' && activeStepData.buckets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '480px' }}>
              {activeStepData.buckets.map((bItems, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #2A323D',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-accent, #00F5D4)', minWidth: '70px' }}>
                    Bucket [{bIdx}]:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {bItems.length === 0 ? (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>null</span>
                    ) : (
                      bItems.map((val, vIdx) => (
                        <span key={vIdx} style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                          {val}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEARCH COMPARISON VISUALIZER */}
          {activeTopic === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Target Contender ID: <strong style={{ color: 'var(--color-primary, #B8F34B)' }}>#104</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {activeStepData.array.map((val, idx) => {
                  const isBinaryMid = idx === activeStepData.binaryMid;
                  const isLinear = idx === activeStepData.linearIdx;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        border: isBinaryMid ? '2px solid #FFD700' : isLinear ? '2px solid #00F5D4' : '1px solid #2A323D',
                        background: val === 104 && activeStepData.found ? 'rgba(184, 243, 75, 0.2)' : 'rgba(0,0,0,0.3)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>idx {idx}</div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>#{val}</div>
                      <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: isBinaryMid ? '#FFD700' : isLinear ? '#00F5D4' : 'transparent' }}>
                        {isBinaryMid ? 'BINARY' : isLinear ? 'LINEAR' : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUICKSORT LOMUTO VISUALIZER */}
          {activeTopic === 'quicksort' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {activeStepData.arr.map((val, idx) => {
                  const isPivot = val === activeStepData.pivot;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '8px',
                        border: isPivot ? '2px solid #FFD700' : '1px solid #2A323D',
                        background: isPivot ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0,0,0,0.3)',
                        textAlign: 'center',
                        minWidth: '70px',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>idx {idx}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isPivot ? '#FFD700' : 'var(--color-primary, #B8F34B)' }}>
                        {val}
                      </div>
                      {isPivot && (
                        <div style={{ fontSize: '0.65rem', color: '#FFD700', fontWeight: 800, marginTop: '0.25rem' }}>
                          PIVOT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
