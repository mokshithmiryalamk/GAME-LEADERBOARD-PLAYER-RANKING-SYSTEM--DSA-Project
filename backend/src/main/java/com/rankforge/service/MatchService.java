package com.rankforge.service;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.dto.ParticipantResultDto;
import com.rankforge.dto.TieRerollDto;
import com.rankforge.exception.InsufficientQueuePlayersException;
import com.rankforge.model.Match;
import com.rankforge.model.MatchParticipant;
import com.rankforge.model.MatchTieReroll;
import com.rankforge.model.Player;
import com.rankforge.model.QueueEntry;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import com.rankforge.repository.QueueEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service managing transactional esports combat simulation for 1v1 and 2v2 matches.
 * Directly adapts original-source/PlayerArray.java startMatch() and Main.java rollNumber().
 */
@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private final QueueEntryRepository queueEntryRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final DiceRoller diceRoller;

    public MatchService(QueueEntryRepository queueEntryRepository,
                        PlayerRepository playerRepository,
                        MatchRepository matchRepository,
                        DiceRoller diceRoller) {
        this.queueEntryRepository = queueEntryRepository;
        this.playerRepository = playerRepository;
        this.matchRepository = matchRepository;
        this.diceRoller = diceRoller;
    }

    /**
     * Executes a Solo 1v1 match between the front 2 queued contenders.
     */
    @Transactional
    public synchronized MatchResultDto playSoloMatch() {
        List<QueueEntry> queue = queueEntryRepository.findAllByOrderByEnqueuedAtAsc();
        if (queue.size() < 2) {
            throw new InsufficientQueuePlayersException(
                    "Not enough challengers in the arena for a 1v1 match! Minimum 2 required, currently waiting: " + queue.size());
        }

        Player p1 = queue.get(0).getPlayer();
        Player p2 = queue.get(1).getPlayer();

        log.info("Starting Solo 1v1 Match: {} vs {}", p1.getName(), p2.getName());

        int roll1 = diceRoller.roll();
        int roll2 = diceRoller.roll();
        log.info("Initial rolls: {} rolled {}, {} rolled {}", p1.getName(), roll1, p2.getName(), roll2);

        List<MatchTieReroll> tieRerolls = new ArrayList<>();
        int round = 0;
        while (roll1 == roll2) {
            round++;
            log.info("Sudden death round {}: rolls were tied at {}", round, roll1);
            int sudden1 = diceRoller.roll();
            int sudden2 = diceRoller.roll();
            tieRerolls.add(new MatchTieReroll(round, sudden1, sudden2));
            roll1 = sudden1;
            roll2 = sudden2;
        }

        boolean p1Wins = roll1 > roll2;
        String winningSide = p1Wins ? "ALPHA" : "OMEGA";
        Player winner = p1Wins ? p1 : p2;
        Player loser = p1Wins ? p2 : p1;

        // Atomic score increment: exactly +10 points to winner
        winner.incrementScore(10);
        playerRepository.save(winner);

        // Build Match entity
        String summary = String.format("%s defeated %s in Solo 1v1 (%d vs %d)",
                winner.getName(), loser.getName(), Math.max(roll1, roll2), Math.min(roll1, roll2));
        Match match = new Match("1v1", winningSide, 10, summary);
        match.setPlayedAt(Instant.now());

        // Participants
        MatchParticipant part1 = new MatchParticipant(p1, "ALPHA", roll1, p1Wins, p1Wins ? 10 : 0);
        MatchParticipant part2 = new MatchParticipant(p2, "OMEGA", roll2, !p1Wins, !p1Wins ? 10 : 0);
        match.addParticipant(part1);
        match.addParticipant(part2);

        for (MatchTieReroll tr : tieRerolls) {
            match.addTieReroll(tr);
        }

        Match savedMatch = matchRepository.save(match);

        // Dequeue both contenders from lobby atomically with concurrency verification
        int del1 = queueEntryRepository.deleteByPlayerIdReturningCount(p1.getId());
        int del2 = queueEntryRepository.deleteByPlayerIdReturningCount(p2.getId());
        if (del1 == 0 || del2 == 0) {
            throw new InsufficientQueuePlayersException("Challengers were already consumed by a concurrent match transaction.");
        }

        log.info("Match #{} completed. Winner: {} (+10 score, new score: {})",
                savedMatch.getId(), winner.getName(), winner.getScore());

        return toMatchResultDto(savedMatch, p1, p2, null, null);
    }

    /**
     * Executes a Team 2v2 Squad Clash between the front 4 queued contenders.
     * Alpha Squad: Queue #1 & #2
     * Omega Squad: Queue #3 & #4
     */
    @Transactional
    public synchronized MatchResultDto playTeamMatch() {
        List<QueueEntry> queue = queueEntryRepository.findAllByOrderByEnqueuedAtAsc();
        if (queue.size() < 4) {
            throw new InsufficientQueuePlayersException(
                    "Not enough challengers in the arena for a 2v2 team match! Minimum 4 required, currently waiting: " + queue.size());
        }

        Player p1 = queue.get(0).getPlayer();
        Player p2 = queue.get(1).getPlayer();
        Player p3 = queue.get(2).getPlayer();
        Player p4 = queue.get(3).getPlayer();

        log.info("Starting Team 2v2 Match: Squad Alpha ({} & {}) vs Squad Omega ({} & {})",
                p1.getName(), p2.getName(), p3.getName(), p4.getName());

        int r1 = diceRoller.roll();
        int r2 = diceRoller.roll();
        int r3 = diceRoller.roll();
        int r4 = diceRoller.roll();

        int sumAlpha = r1 + r2;
        int sumOmega = r3 + r4;

        List<MatchTieReroll> tieRerolls = new ArrayList<>();
        int round = 0;
        while (sumAlpha == sumOmega) {
            round++;
            log.info("Team sudden death round {}: squad sums tied at {}", round, sumAlpha);
            int suddenAlpha = diceRoller.roll() + diceRoller.roll();
            int suddenOmega = diceRoller.roll() + diceRoller.roll();
            tieRerolls.add(new MatchTieReroll(round, suddenAlpha, suddenOmega));
            sumAlpha = suddenAlpha;
            sumOmega = suddenOmega;
        }

        boolean alphaWins = sumAlpha > sumOmega;
        String winningSide = alphaWins ? "ALPHA" : "OMEGA";

        // Award +10 points to each winning teammate (+20 team score total)
        if (alphaWins) {
            p1.incrementScore(10);
            p2.incrementScore(10);
            playerRepository.save(p1);
            playerRepository.save(p2);
        } else {
            p3.incrementScore(10);
            p4.incrementScore(10);
            playerRepository.save(p3);
            playerRepository.save(p4);
        }

        String summary = String.format("Squad %s won Team 2v2 Clash (%d vs %d)",
                winningSide, Math.max(sumAlpha, sumOmega), Math.min(sumAlpha, sumOmega));
        Match match = new Match("2v2", winningSide, 10, summary);
        match.setPlayedAt(Instant.now());

        MatchParticipant part1 = new MatchParticipant(p1, "ALPHA", r1, alphaWins, alphaWins ? 10 : 0);
        MatchParticipant part2 = new MatchParticipant(p2, "ALPHA", r2, alphaWins, alphaWins ? 10 : 0);
        MatchParticipant part3 = new MatchParticipant(p3, "OMEGA", r3, !alphaWins, !alphaWins ? 10 : 0);
        MatchParticipant part4 = new MatchParticipant(p4, "OMEGA", r4, !alphaWins, !alphaWins ? 10 : 0);

        match.addParticipant(part1);
        match.addParticipant(part2);
        match.addParticipant(part3);
        match.addParticipant(part4);

        for (MatchTieReroll tr : tieRerolls) {
            match.addTieReroll(tr);
        }

        Match savedMatch = matchRepository.save(match);

        // Dequeue all 4 contenders atomically with concurrency verification
        int del1 = queueEntryRepository.deleteByPlayerIdReturningCount(p1.getId());
        int del2 = queueEntryRepository.deleteByPlayerIdReturningCount(p2.getId());
        int del3 = queueEntryRepository.deleteByPlayerIdReturningCount(p3.getId());
        int del4 = queueEntryRepository.deleteByPlayerIdReturningCount(p4.getId());
        if (del1 == 0 || del2 == 0 || del3 == 0 || del4 == 0) {
            throw new InsufficientQueuePlayersException("Squad challengers were already consumed by a concurrent match transaction.");
        }

        log.info("Team Match #{} completed. Winning Side: Squad {}", savedMatch.getId(), winningSide);

        return toMatchResultDto(savedMatch, p1, p2, p3, p4);
    }

    private MatchResultDto toMatchResultDto(Match match, Player p1, Player p2, Player p3, Player p4) {
        List<ParticipantResultDto> participantDtos = new ArrayList<>();
        for (MatchParticipant mp : match.getParticipants()) {
            int currentScore = mp.getPlayer().getScore();
            participantDtos.add(new ParticipantResultDto(
                    mp.getPlayer().getId(),
                    mp.getPlayerName(),
                    mp.getPlayerTeam(),
                    mp.getPlayerLevel(),
                    mp.getSide(),
                    mp.getDiceRoll(),
                    mp.isWinner(),
                    mp.getScoreDelta(),
                    currentScore
            ));
        }

        List<TieRerollDto> tieDtos = new ArrayList<>();
        if (match.getTieRerolls() != null) {
            for (MatchTieReroll tr : match.getTieRerolls()) {
                tieDtos.add(new TieRerollDto(tr.getRoundNumber(), tr.getSideAlphaRoll(), tr.getSideOmegaRoll()));
            }
        }

        return new MatchResultDto(
                match.getId(),
                match.getMatchType(),
                match.getStatus(),
                match.getWinningSide(),
                match.getScoreAward(),
                match.getSummary(),
                match.getPlayedAt(),
                match.getUndoneAt(),
                participantDtos,
                tieDtos
        );
    }
}
