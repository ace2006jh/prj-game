package com.backend.player;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerMapper mapper;

    public List<Player> list() {
        return mapper.scoreboard();
    }

    public void add(Player player) {
        mapper.insert(player);
    }

}
