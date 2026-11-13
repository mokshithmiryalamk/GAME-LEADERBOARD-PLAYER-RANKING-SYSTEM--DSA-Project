package com.rankforge.repository;

import com.rankforge.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Integer> {
    List<Player> findByNameContainingIgnoreCaseOrTeamContainingIgnoreCase(String name, String team);
}
