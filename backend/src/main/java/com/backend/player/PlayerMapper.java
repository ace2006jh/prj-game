package com.backend.player;

import com.backend.player.Player;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PlayerMapper {

    @Select("""
SELECT name, score
FROM player
ORDER BY score DESC LIMIT 20
""")
    List<Player> scoreboard();


    @Insert("""
INSERT INTO player (name, score)
VALUES (#{name}, #{score})
""")
    void insert(Player player);
}
