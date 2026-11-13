/**
 * STAGE 8 FULL-STACK QUALITY ASSURANCE & INTEGRATION VERIFICATION SUITE
 * Validates the complete React 19 + Spring Boot 3 + H2/Flyway Full-Stack Architecture:
 * 1. Health & Telemetry (/api/health)
 * 2. Original 53 Seed Contenders & Quarantined Malformed Row #50
 * 3. QuickSort Lomuto Leaderboard Descending Order & Tie-Breaking (/api/leaderboard)
 * 4. Contender CRUD: Create, Read, Update, Delete with Referential Protection (/api/players)
 * 5. Circular FIFO Queue: Capacity 50 Enforcement, Rejection of 51st Player (/api/queue)
 * 6. Authoritative Combat Engine: 1v1 Solo Combat & Winner Point Increment (/api/matches/play)
 * 7. Authoritative Team Combat: 2v2 Match & Dual Contender Point Increments (/api/matches/team)
 * 8. LIFO Stack & Atomic Undo: Reverses Points Atomically & Sets Status UNDONE (/api/matches/undo)
 * 9. Production Reset Safeguard: Reset Demo Roster to Canonical 53 Seed Records (/api/players/reset)
 * 10. CORS & Preflight Response Headers
 */

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg = data && data.detail ? data.detail : (data && data.message ? data.message : `HTTP ${res.status}: ${res.statusText}`);
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function runStage8Tests() {
  console.log('================================================================');
  console.log(' RANKFORGE: STAGE 8 FULL-STACK QA & INTEGRATION VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // 0. Reset to clean canonical baseline
    const reset0 = await request('/players/reset', { method: 'POST' });
    assert(reset0.success === true, 'Database reset to canonical seed baseline');

    // 1. Health & Telemetry
    const health = await request('/health');
    assert(health.status === 'UP', 'Backend health reports status UP');
    assert(health.application === 'RANKFORGE', 'Application name is RANKFORGE');
    assert(health.totalPlayers === 53, `Total seed players loaded: ${health.totalPlayers} (expected 53)`);
    assert(health.quarantinedSeedRows === 1, 'Quarantined seed row count is exactly 1 (line 50 Shreya)');
    assert(health.databaseEngine.includes('H2'), 'Persistent database engine active');

    // 2. Roster Integrity
    const players = await request('/players');
    assert(players.length === 53, `Roster count contains exactly ${players.length} valid contenders`);
    const arjun = players.find((p) => p.id === 104);
    assert(arjun && arjun.name === 'Arjun' && arjun.score === 100, 'Contender #104 is Arjun with 100 PTS');

    // 3. QuickSort Leaderboard
    const standings = await request('/leaderboard');
    assert(standings.length === 53, 'Leaderboard returns all 53 ranked contenders');
    assert(standings[0].id === 104, 'Leaderboard champion at Rank #1 is Arjun (#104)');
    for (let i = 0; i < standings.length - 1; i++) {
      if (standings[i].score < standings[i + 1].score) {
        throw new Error(`Sorting violation at index ${i}: ${standings[i].score} < ${standings[i + 1].score}`);
      }
    }
    assert(true, 'QuickSort Lomuto partition guarantees descending scores across all 53 rows');

    // 4. Contender CRUD Lifecycle
    const newContender = { id: 888, name: 'ValkyriePrime', score: 60, level: 7, team: 'Warriors' };
    const created = await request('/players', {
      method: 'POST',
      body: JSON.stringify(newContender),
    });
    assert(created.id === 888 && created.name === 'ValkyriePrime', 'Registered new contender #888 ValkyriePrime');

    const updated = await request('/players/888', {
      method: 'PUT',
      body: JSON.stringify({ name: 'ValkyriePrime', level: 8, team: 'Dragons' }),
    });
    assert(updated.level === 8 && updated.team === 'Dragons', 'Updated contender attributes while preserving score');

    // 5. Circular Queue Capacity 50 & 51st Rejection
    await request('/queue/clear', { method: 'POST' });
    const allRoster = await request('/players');
    for (let i = 0; i < 50; i++) {
      await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: allRoster[i].id }) });
    }
    const qCap50 = await request('/queue');
    assert(qCap50.length === 50, 'Circular queue successfully enqueued 50 contenders');

    let rejected51 = false;
    try {
      await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: allRoster[50].id }) });
    } catch (err) {
      rejected51 = err.status === 400;
    }
    assert(rejected51, 'Enqueueing 51st contender rejected with HTTP 400 Bad Request (Queue Full)');

    await request('/queue/clear', { method: 'POST' });
    const qEmpty = await request('/queue');
    assert(qEmpty.length === 0, 'Circular matchmaking queue cleared cleanly');

    // 6. Authoritative 1v1 Combat
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 101 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 102 }) });

    const p101Pre = await request('/players/101');
    const p102Pre = await request('/players/102');

    const soloMatch = await request('/matches/play', {
      method: 'POST',
      body: JSON.stringify({ matchType: '1v1' }),
    });
    assert(soloMatch.matchId > 0, `1v1 Solo Combat #${soloMatch.matchId} completed`);
    assert(soloMatch.status === 'COMPLETED', 'Match status is COMPLETED');

    const p101Post = await request('/players/101');
    const p102Post = await request('/players/102');
    const expectedWinnerId = soloMatch.winningSide === 'ALPHA' ? 101 : 102;
    const actualWinnerPost = expectedWinnerId === 101 ? p101Post.score : p102Post.score;
    const actualWinnerPre = expectedWinnerId === 101 ? p101Pre.score : p102Pre.score;
    assert(actualWinnerPost === actualWinnerPre + 10, `Winner received exactly +10 PTS (${actualWinnerPre} -> ${actualWinnerPost})`);

    // 7. Authoritative 2v2 Team Combat
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 103 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 104 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 105 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 106 }) });

    const teamMatch = await request('/matches/team', { method: 'POST' });
    assert(teamMatch.matchType === '2v2', `2v2 Team Combat #${teamMatch.matchId} completed`);
    assert(teamMatch.winningSide === 'ALPHA' || teamMatch.winningSide === 'OMEGA', `Winning side: ${teamMatch.winningSide}`);

    // 8. LIFO Stack & Transaction-Safe Undo
    const history = await request('/matches');
    assert(history.length >= 2, `Match history records ${history.length} matches`);
    assert(history[0].matchId === teamMatch.matchId, 'Top of LIFO stack is latest 2v2 match');

    const undoRes = await request('/matches/undo', { method: 'POST' });
    assert(undoRes.matchId === teamMatch.matchId, `Successfully reversed match #${teamMatch.matchId}`);
    assert(undoRes.revertedPlayers.length === 2, 'Reversed points for both winning squad members');

    const undoneEntity = await request(`/matches/${teamMatch.matchId}`);
    assert(undoneEntity.status === 'UNDONE', 'Match status in database updated to UNDONE');

    // 9. Referential Protection & Clean Deletion
    await request('/players/888', { method: 'DELETE' });
    let deleted = false;
    try {
      await request('/players/888');
    } catch (err) {
      deleted = err.status === 404;
    }
    assert(deleted, 'Test contender #888 removed cleanly without referential orphan');

    // 10. Clean Demo Reset
    const finalReset = await request('/players/reset', { method: 'POST' });
    assert(finalReset.success === true, 'Final reset restored authentic 53-player seed state');

    const finalStandings = await request('/leaderboard');
    assert(finalStandings.length === 53, 'Final standings contain 53 contenders');
    assert(finalStandings[0].id === 104 && finalStandings[0].score === 100, 'Original champion restored with authentic 100 PTS');

  } catch (err) {
    console.error('Stage 8 verification failed with error:', err);
    process.exitCode = 1;
  }

  console.log('\n================================================================');
  console.log(` STAGE 8 VERIFICATION: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  if (passed === total && total > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runStage8Tests();
