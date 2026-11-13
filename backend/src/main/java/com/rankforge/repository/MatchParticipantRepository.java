package com.rankforge.repository;

import com.rankforge.model.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {
    List<MatchParticipant> findByMatchId(Long matchId);

    @Query("SELECT COUNT(mp) > 0 FROM MatchParticipant mp WHERE mp.player.id = :playerId AND mp.match.status = 'COMPLETED' AND mp.isWinner = true")
    boolean existsWinningParticipantInCompletedMatch(@Param("playerId") int playerId);

    @Query("SELECT COUNT(mp) > 0 FROM MatchParticipant mp WHERE mp.player.id = :playerId")
    boolean existsByPlayerId(@Param("playerId") int playerId);
}
