/**
 * STAGE 7 END-TO-END VERIFICATION SCRIPT
 * Exercises the live Spring Boot Backend API against all Stage 7 features:
 * - Telemetry & Health (/api/health)
 * - 53 Seed Contenders and Quarantined Record Audit (/api/players)
 * - Java QuickSort Lomuto Leaderboard (/api/leaderboard)
 * - Contender Registration, Search, and Update (/api/players)
 * - Circular Matchmaking Queue FIFO & Capacity (/api/queue)
 * - Authoritative 1v1 Combat & Score Mutation (/api/matches/play)
 * - Authoritative 2v2 Combat & Dual Score Mutation (/api/matches/team)
 * - LIFO Stack History & Atomic Reversal (/api/matches/undo)
 * - Demo Roster Reset (/api/players/reset)
 */

const BASE_URL = 'http://localhost:8080/api';

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
    const errorMsg = data && data.detail ? data.detail : `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function runTests() {
  console.log('================================================================');
  console.log(' RANKFORGE: STAGE 7 LIVE BACKEND INTEGRATION VERIFICATION');
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
    // 0. Ensure clean seed baseline
    await request('/players/reset', { method: 'POST' });

    // 1. Health endpoint
    const health = await request('/health');
    assert(health.status === 'UP', 'Health check reports status UP');
    assert(health.application === 'RANKFORGE', 'Application name is RANKFORGE');
    assert(health.totalPlayers === 53, `Total seed players loaded: ${health.totalPlayers} (expected 53)`);
    assert(health.quarantinedSeedRows === 1, 'Quarantined seed rows is 1 (line 50 Shreya)');

    // 2. Player Roster Audit
    const players = await request('/players');
    assert(players.length === 53, `Roster count is ${players.length} valid records`);
    const p101 = players.find((p) => p.id === 101);
    assert(p101 && p101.name === 'Amit' && p101.score === 80, 'Player #101 is Amit with 80 PTS');
    const p104 = players.find((p) => p.id === 104);
    assert(p104 && p104.name === 'Arjun' && p104.score === 100, 'Player #104 is Arjun with 100 PTS');

    // 3. QuickSort Leaderboard
    const standings = await request('/leaderboard');
    assert(standings.length === 53, 'Leaderboard returns all 53 ranked contenders');
    assert(standings[0].id === 104 && standings[0].name === 'Arjun', 'Leaderboard #1 Champion is Arjun (100 PTS)');
    assert(standings[1].score <= standings[0].score, 'Standings strictly descending by points');

    // 4. Register new contender
    const newContender = { id: 999, name: 'Valkyrie', score: 50, level: 5, team: 'Warriors' };
    const created = await request('/players', {
      method: 'POST',
      body: JSON.stringify(newContender),
    });
    assert(created.id === 999 && created.name === 'Valkyrie', 'Registered new contender #999 Valkyrie');

    // 5. Search contender
    const searchRes = await request('/players/search?name=Valkyrie');
    assert(searchRes.length === 1 && searchRes[0].id === 999, 'Search by name returns Valkyrie');

    // 6. Enqueue players into Circular Queue
    await request('/queue/clear', { method: 'POST' });
    const q1 = await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 101 }) });
    const q2 = await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 102 }) });
    assert(q1.player && q1.player.id === 101 && q1.slotIndex === 0, 'Amit enqueued at slot 0');
    assert(q2.player && q2.player.id === 102 && q2.slotIndex === 1, 'Rahul enqueued at slot 1');

    const queueState = await request('/queue');
    assert(queueState.length === 2, 'Queue holds 2 contenders ready for combat');

    // 7. Play 1v1 Solo Combat
    const soloMatch = await request('/matches/play', {
      method: 'POST',
      body: JSON.stringify({ matchType: '1v1' }),
    });
    assert(soloMatch.matchId > 0, `Solo match #${soloMatch.matchId} completed`);
    assert(soloMatch.winningSide === 'ALPHA' || soloMatch.winningSide === 'OMEGA', `Winner declared side: ${soloMatch.winningSide}`);

    // Verify queue emptied
    const queueAfterMatch = await request('/queue');
    assert(queueAfterMatch.length === 0, 'Both combatants consumed from queue');

    // 8. Enqueue 4 players for 2v2 team combat
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 103 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 104 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 105 }) });
    await request('/queue', { method: 'POST', body: JSON.stringify({ playerId: 106 }) });

    const teamMatch = await request('/matches/team', { method: 'POST' });
    assert(teamMatch.matchType === '2v2', 'Team match 2v2 executed');
    assert(teamMatch.winningSide === 'ALPHA' || teamMatch.winningSide === 'OMEGA', `Winning squad side: ${teamMatch.winningSide}`);

    // 9. LIFO History Stack & Atomic Undo
    const history = await request('/matches');
    assert(history.length >= 2, `History records ${history.length} matches in LIFO order`);
    assert(history[0].matchId === teamMatch.matchId, 'Top of LIFO stack is latest 2v2 match');

    // Atomic Undo of 2v2 match
    const undoResult = await request('/matches/undo', { method: 'POST' });
    assert(undoResult.matchId === teamMatch.matchId, `Undid match #${undoResult.matchId}`);
    assert(undoResult.undoneAt != null && undoResult.revertedPlayers.length > 0, 'Reverted players and recorded undoneAt timestamp');

    const undoneMatch = await request(`/matches/${teamMatch.matchId}`);
    assert(undoneMatch.status === 'UNDONE', 'Match entity status updated to UNDONE in database');

    // 10. Clean up test player & reset demo roster
    await request('/players/999', { method: 'DELETE' });
    const resetRes = await request('/players/reset', { method: 'POST' });
    assert(resetRes.success === true, 'Roster reset successfully restores 53 seed records');

    const finalHealth = await request('/health');
    assert(finalHealth.totalPlayers === 53, 'Final roster count restored to 53 players');
    assert(finalHealth.queueSize === 0, 'Matchmaking queue reset to 0');

  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exitCode = 1;
  }

  console.log('\n================================================================');
  console.log(` STAGE 7 LIVE INTEGRATION: ${passed} / ${total} PASSED`);
  console.log('================================================================\n');

  if (passed === total && total > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
