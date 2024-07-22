import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const Game = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 600,
      height: 800,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    let player;
    let cursors;
    let bullets;
    let enemies;
    let lastFired = 0;
    const fireRate = 100;
    const enemySpeed = 100;
    let background;

    function preload() {
      this.load.image("background", "public/background.png"); // 배경 이미지 경로
      this.load.image("player", "public/player.png"); // 플레이어 이미지 경로
      this.load.image("bullet", "public/bullet.png"); // 총알 이미지 경로
      this.load.image("enemy", "public/enemy.png"); // 적 이미지 경로
    }

    function create() {
      background = this.add
        .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
        .setOrigin(0, 0);

      player = this.physics.add.sprite(300, 700, "player"); // 플레이어 초기 위치 설정
      player.setCollideWorldBounds(true);

      cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on("keydown-SPACE", fireBullet, this);

      bullets = this.physics.add.group({
        defaultKey: "bullet",
        maxSize: 10,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      bullets.createMultiple({
        key: "bullet",
        quantity: 10,
        active: false,
        visible: false,
        classType: Phaser.Physics.Arcade.Image,
      });

      enemies = this.physics.add.group({
        defaultKey: "enemy",
        maxSize: 20,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      this.physics.world.on("worldbounds", (body) => {
        if (body.gameObject && body.gameObject.texture.key === "bullet") {
          body.gameObject.disableBody(true, true);
        }
        if (body.gameObject && body.gameObject.texture.key === "enemy") {
          body.gameObject.disableBody(true, true);
        }
      });

      this.time.addEvent({
        delay: 1000,
        callback: createEnemy,
        callbackScope: this,
        loop: true,
      });

      this.physics.add.collider(bullets, enemies, destroyEnemy, null, this);
    }

    function update(time, delta) {
      background.tilePositionY -= 1;

      if (cursors.left.isDown) {
        player.setVelocityX(-200);
      } else if (cursors.right.isDown) {
        player.setVelocityX(200);
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-200);
      } else if (cursors.down.isDown) {
        player.setVelocityY(200);
      } else {
        player.setVelocityY(0);
      }
    }

    function fireBullet() {
      if (this.time.now < lastFired + fireRate) {
        return;
      }

      const bullet = bullets.getFirstDead(false);

      if (bullet) {
        bullet.enableBody(true, player.x, player.y - 20, true, true);
        bullet.setVelocityY(-300);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;

        lastFired = this.time.now;
      }
    }

    function createEnemy() {
      const x = Phaser.Math.Between(50, 550);
      const enemy = enemies.create(x, 0, "enemy");

      if (enemy) {
        enemy.setVelocityY(enemySpeed);
        enemy.setCollideWorldBounds(true);
        enemy.body.onWorldBounds = true;
        console.log("Enemy created at x:", x);
      }
    }

    function destroyEnemy(bullet, enemy) {
      bullet.disableBody(true, true);
      enemy.disableBody(true, true);
      console.log("Enemy destroyed");
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game-container" ref={gameRef}></div>;
};

export default Game;
