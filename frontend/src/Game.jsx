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
          debug: false, // 디버그 모드 비활성화
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
      this.load.image("background", "/background.png"); // 배경 이미지 경로
      this.load.image("player", "/player.png"); // 플레이어 이미지 경로
      this.load.image("bullet", "/bullet.png"); // 총알 이미지 경로
      this.load.image("enemyy", "/enemy.png"); // 적 이미지 경로
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

      // 적을 1000ms마다 생성하는 이벤트 추가
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

      // 적을 아래로 이동시키기 위해 update에서 처리
      enemies.children.iterate((enemy) => {
        if (enemy && enemy.active) {
          enemy.setVelocityY(enemySpeed);
        }
      });
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
      const enemy = enemies.create(x, 0, "enemyy");

      if (enemy) {
        enemy.setVelocityY(enemySpeed);
        enemy.setCollideWorldBounds(true);
        enemy.body.onWorldBounds = true;
      }
    }

    function destroyEnemy(bullet, enemy) {
      bullet.disableBody(true, true);
      enemy.disableBody(true, true);
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game-container" ref={gameRef}></div>;
};

export default Game;
