package com.rankforge.repository;

import com.rankforge.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findAllByOrderByPlayedAtDesc();
    
    List<Match> findByStatusOrderByPlayedAtDesc(String status);

    // Find the topmost eligible match for LIFO undo
    @Query("SELECT m FROM Match m WHERE m.status = 'COMPLETED' ORDER BY m.playedAt DESC, m.id DESC")
    List<Match> findCompletedMatchesForUndo();

    long countByStatus(String status);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Match m SET m.status = 'UNDONE', m.undoneAt = :undoneAt WHERE m.id = :id AND m.status = 'COMPLETED'")
    int markMatchUndone(@Param("id") Long id, @Param("undoneAt") Instant undoneAt);
}
