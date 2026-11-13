package com.rankforge.repository;

import com.rankforge.model.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    Optional<QueueEntry> findByPlayerId(int playerId);
    boolean existsByPlayerId(int playerId);
    List<QueueEntry> findAllByOrderByEnqueuedAtAsc();
    void deleteByPlayerId(int playerId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM QueueEntry q WHERE q.player.id = :playerId")
    int deleteByPlayerIdReturningCount(@Param("playerId") int playerId);
}
