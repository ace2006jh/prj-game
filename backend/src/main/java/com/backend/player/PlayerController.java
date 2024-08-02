package com.backend.player;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService service;


    @GetMapping("/scores")
    public List<Player> list() {
        return service.list();
    }

    @PostMapping("score")
    public void createPlayer(@RequestBody Player player) {
        service.add(player);
    }
}