$port = 8089
$dbFile = "./data/demodb"
$jarPath = "D:/Moki/Portfolio/projects/Game_Leaderboard/backend/target/rankforge-backend-1.0.0.jar"
$workDir = "D:/Moki/Portfolio/projects/Game_Leaderboard/backend"

# Cleanup any previous demo db files
Get-ChildItem -Path "D:/Moki/Portfolio/projects/Game_Leaderboard/backend/data" -Filter "demodb*" -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "=== STEP 1: FIRST BOOT OF SPRING BOOT BACKEND (Port $port) ==="
$log1 = "D:/Moki/Portfolio/projects/Game_Leaderboard/scratch/server1.log"
$err1 = "D:/Moki/Portfolio/projects/Game_Leaderboard/scratch/server1_err.log"
$proc1 = Start-Process java -ArgumentList "-Dserver.port=$port", "-Dspring.datasource.url=jdbc:h2:file:$dbFile;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE;WRITE_DELAY=0", "-jar", $jarPath -WorkingDirectory $workDir -RedirectStandardOutput $log1 -RedirectStandardError $err1 -PassThru

try {
    # Wait for server ready
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $h = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -Method Get -TimeoutSec 2
            if ($h.status -eq "UP") { $ready = $true; break }
        } catch {}
    }
    if (-not $ready) { throw "Server 1 failed to start on port $port" }
    Write-Host "Server 1 is UP!"

    # Probe 1: Health
    $h = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -Method Get
    Write-Host "[PROBE 1 - HEALTH] Status: $($h.status), Total Players: $($h.totalPlayers), Quarantined: $($h.quarantinedSeedRows), DB: $($h.databaseEngine)"

    # Probe 2: Player 104 Lookup
    $p104 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/players/104" -Method Get
    Write-Host "[PROBE 2 - GET PLAYER 104] Name: $($p104.name), Score: $($p104.score), Team: $($p104.team)"

    # Probe 3: Queue Enqueue
    $q1 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/queue" -Method Post -ContentType "application/json" -Body '{"playerId": 101}'
    $q2 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/queue" -Method Post -ContentType "application/json" -Body '{"playerId": 102}'
    Write-Host "[PROBE 3 - ENQUEUE PLAYERS 101 and 102] P101 Pos: $($q1.position) (slot $($q1.slotIndex)), P102 Pos: $($q2.position) (slot $($q2.slotIndex))"

    # Probe 4: Solo Match
    $match = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/matches/solo" -Method Post
    Write-Host "[PROBE 4 - SOLO MATCH EXECUTED] Match ID: $($match.matchId), Type: $($match.matchType), Winner Side: $($match.winningSide), Summary: $($match.summary)"

    # Probe 5: Register New Contender 999
    $newP = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/players" -Method Post -ContentType "application/json" -Body '{"id": 999, "name": "Valkyrie", "level": 10, "team": "Warriors"}'
    Write-Host "[PROBE 5 - REGISTER NEW CONTENDER] Registered ID #$($newP.id): $($newP.name) (Score: $($newP.score), Level: $($newP.level), Team: $($newP.team))"

} finally {
    Write-Host "`nStopping Server 1 process..."
    Stop-Process -Id $proc1.Id -Force
    Start-Sleep -Seconds 3
}

Write-Host "`n=== STEP 2: SECOND BOOT (RESTART PERSISTENCE DEMONSTRATION) ==="
$log2 = "D:/Moki/Portfolio/projects/Game_Leaderboard/scratch/server2.log"
$err2 = "D:/Moki/Portfolio/projects/Game_Leaderboard/scratch/server2_err.log"
$proc2 = Start-Process java -ArgumentList "-Dserver.port=$port", "-Dspring.datasource.url=jdbc:h2:file:$dbFile;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE;WRITE_DELAY=0", "-jar", $jarPath -WorkingDirectory $workDir -RedirectStandardOutput $log2 -RedirectStandardError $err2 -PassThru

try {
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $h2 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -Method Get -TimeoutSec 2
            if ($h2.status -eq "UP") { $ready = $true; break }
        } catch {}
    }
    if (-not $ready) { throw "Server 2 failed to start on port $port" }
    Write-Host "Server 2 is UP!"

    # Probe 6: Health after restart
    $h2 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -Method Get
    Write-Host "[PROBE 6 - HEALTH AFTER RESTART] Total Players: $($h2.totalPlayers) (Expected 54), Total Matches: $($h2.totalMatches) (Expected 1)"

    # Probe 7: Custom Player 999 after restart
    $p999 = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/players/999" -Method Get
    Write-Host "[PROBE 7 - CONTENDER 999 SURVIVED RESTART] Found ID #$($p999.id): $($p999.name), Score: $($p999.score), Team: $($p999.team)"

    # Probe 8: Match History after restart
    $hist = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/matches" -Method Get
    Write-Host "[PROBE 8 - MATCH HISTORY SURVIVED RESTART] Found $($hist.Count) match in history. Top Match ID: $($hist[0].matchId) (Status: $($hist[0].status))"

    # Probe 9: LIFO Undo of the match played in Boot 1!
    $undo = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/matches/undo" -Method Post
    Write-Host "[PROBE 9 - LIFO UNDO AFTER RESTART] Undone Match ID: $($undo.matchId), Message: $($undo.message)"
    Write-Host "Reverted Player: $($undo.revertedPlayers[0].playerName), Points Deducted: $($undo.revertedPlayers[0].pointsDeducted), New Score: $($undo.revertedPlayers[0].newScore)"

} finally {
    Write-Host "`nStopping Server 2 process..."
    Stop-Process -Id $proc2.Id -Force
}

Write-Host "`n=== LIVE ENDPOINT PROBES AND PERSISTENCE DEMONSTRATION COMPLETE ==="
