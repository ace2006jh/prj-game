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
    let specialEnemies;
    let specialEnemies2;
    let enemyBullets;
    let bossBullets;
    let lastFired = 0;
    let boss;
    let lives;
    let livesGroup;
    let playerImmune;
    let playerExploding;
    let score = 0;
    let scoreText;

    const initialLives = 3;
    const respawnDelay = 2000;
    const fireRate = 100;
    const enemySpeed = 100;
    const specialEnemySpeed = 100;
    const specialEnemyHealth = 6;
    const BossHealth = 18;
    const bossBulletSpeed = 200;
    const bossFireRate = 500; // 보스 총알 발사 주기 (ms)
    let background;

    function preload() {
      this.load.image("background", "/background.png"); // 배경 이미지 경로
      this.load.image("player", "/player.png"); // 플레이어 이미지 경로
      this.load.image("bullet", "/bullet.png"); // 총알 이미지 경로
      this.load.image("enemyy", "/enemy.png"); // 적 이미지 경로
      this.load.image("specialEnemy", "/specialEnemy.png"); // 새로운 적 이미지 경로
      this.load.image("specialEnemy2", "/specialEnemy2.png"); // 새로운 적 이미지 경로
      this.load.image("enemyBullet", "/enemyBullet.png"); // 적의 탄환 이미지 경로
      this.load.image("Boss", "/boss.png"); // 보스 이미지 경로
      this.load.image("bossBullet", "/bossBullet.png"); // 보스의 탄환 이미지 경로
      this.load.spritesheet("boom", "/boom.png", {
        frameWidth: 32,
        frameHeight: 32,
      });
      this.load.spritesheet("bossExplosion", "/bossExplosion.png", {
        frameWidth: 128,
        frameHeight: 128,
      }); // 보스 파괴 애니메이션 스프라이트 시트
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

      livesGroup = this.add.group({
        key: "player",
        repeat: initialLives - 1,
        setXY: { x: 550, y: 50, stepX: -30 },
      });

      scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "32px",
        fill: "#fff",
      });

      lives = initialLives;
      playerImmune = false;
      playerExploding = false;

      enemies = this.physics.add.group({
        defaultKey: "enemyy",
        maxSize: 30,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      specialEnemies = this.physics.add.group({
        defaultKey: "specialEnemy",
        maxSize: 8,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      specialEnemies2 = this.physics.add.group({
        defaultKey: "specialEnemy2",
        maxSize: 4,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      enemyBullets = this.physics.add.group({
        defaultKey: "enemyBullet",
        maxSize: 40,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      enemyBullets.createMultiple({
        key: "enemyBullet",
        quantity: 20,
        active: false,
        visible: false,
        classType: Phaser.Physics.Arcade.Image,
      });

      bossBullets = this.physics.add.group({
        defaultKey: "bossBullet",
        maxSize: 10,
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true,
      });

      bossBullets.createMultiple({
        key: "enemyBullet",
        quantity: 10,
        active: false,
        visible: false,
        classType: Phaser.Physics.Arcade.Image,
      });

      this.physics.world.on("worldbounds", (body) => {
        if (body.gameObject) {
          body.gameObject.disableBody(true, true);
        }
      });

      // 적을 1000ms마다 생성하는 이벤트 추가
      this.time.addEvent({
        delay: 1500,
        callback: createEnemy,
        callbackScope: this,
        loop: true,
      });

      // 보스 생성
      this.time.addEvent({
        delay: 22000,
        callback: createBoss,
        callbackScope: this,
      });

      // 새로운 적을 3000ms마다 생성하는 이벤트 추가
      this.time.addEvent({
        delay: 6000,
        callback: createSpecialEnemy,
        callbackScope: this,
        loop: true,
      });

      this.time.addEvent({
        delay: 13000,
        callback: createSpecialEnemy2,
        callbackScope: this,
        loop: true,
      });

      this.physics.add.collider(bullets, enemies, destroyEnemy, null, this);
      this.physics.add.collider(
        bullets,
        specialEnemies,
        damageSpecialEnemy,
        null,
        this,
      );
      this.physics.add.collider(
        bullets,
        specialEnemies2,
        damageSpecialEnemy,
        null,
        this,
      );
      this.physics.add.collider(player, enemyBullets, playerHit, null, this);
      this.physics.add.collider(player, bossBullets, playerHit, null, this);
      this.physics.add.collider(bullets, boss, damageBoss, null, this);

      this.anims.create({
        key: "bossExplosion",
        frames: this.anims.generateFrameNumbers("bossExplosion", {
          start: 0,
          end: 9,
        }),
        frameRate: 16,
        repeat: 0,
        hideOnComplete: true,
      });

      this.anims.create({
        key: "boom",
        frames: this.anims.generateFrameNumbers("boom", {
          start: 0,
          end: 9,
        }),
        frameRate: 16,
        repeat: 0,
        hideOnComplete: true,
      });
    }

    function update(time, delta) {
      background.tilePositionY -= 1;
      if (!playerExploding) {
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

      // 적을 아래로 이동시키기 위해 update에서 처리
      enemies.children.iterate((enemy) => {
        if (enemy && enemy.active) {
          enemy.setVelocityY(enemySpeed);
        }
      });

      // 특수 적의 이동과 공격 처리
      specialEnemies.children.iterate((specialEnemy) => {
        if (specialEnemy && specialEnemy.active) {
          if (specialEnemy.y >= 260) {
            specialEnemy.setVelocityY(0);
            if (time > specialEnemy.lastFired + 1000) {
              fireEnemyBullet(specialEnemy);
              specialEnemy.lastFired = time;
            }
          } else {
            specialEnemy.setVelocityY(specialEnemySpeed);
          }
        }
      });

      specialEnemies2.children.iterate((specialEnemy2) => {
        if (specialEnemy2 && specialEnemy2.active) {
          if (specialEnemy2.y >= 260) {
            specialEnemy2.setVelocityY(0);
            if (time > specialEnemy2.lastFired + 1000) {
              fireBossBullet(specialEnemy2);
              specialEnemy2.lastFired = time;
            }
          } else {
            specialEnemy2.setVelocityY(specialEnemySpeed);
          }
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
      const enemy = enemies.create(x, 50, "enemyy");

      if (enemy) {
        enemy.setVelocityY(enemySpeed);
        enemy.setCollideWorldBounds(true);
        enemy.body.onWorldBounds = true;
      }
    }

    function createBoss() {
      boss = this.physics.add.sprite(300, 100, "Boss");
      specialEnemies.add(boss); // 보스를 specialEnemies 그룹에 추가

      if (boss) {
        boss.health = BossHealth;
        boss.lastFired = 0;
        boss.setVelocityY(specialEnemySpeed);
        boss.setCollideWorldBounds(true);
        boss.body.onWorldBounds = true;

        // 보스가 주기적으로 총알을 발사하도록 설정
        boss.fireTimer = this.time.addEvent({
          delay: bossFireRate, // 총알 발사 주기를 짧게 설정
          callback: () => fireBossBullet(boss),
          callbackScope: this,
          loop: true,
        });
      }
    }

    function createSpecialEnemy() {
      const x = Phaser.Math.Between(50, 550);
      const specialEnemy = specialEnemies.create(x, 50, "specialEnemy");

      if (specialEnemy) {
        specialEnemy.health = specialEnemyHealth;
        specialEnemy.lastFired = 0;
        specialEnemy.setVelocityY(specialEnemySpeed);
        specialEnemy.setCollideWorldBounds(true);
        specialEnemy.body.onWorldBounds = true;
      }
    }

    function createSpecialEnemy2() {
      const specialEnemy = specialEnemies2.create(150, 50, "specialEnemy2");
      const specialEnemy2 = specialEnemies2.create(450, 50, "specialEnemy2");

      if (specialEnemy) {
        specialEnemy.health = specialEnemyHealth;
        specialEnemy.lastFired = 0;
        specialEnemy.setVelocityY(specialEnemySpeed);
        specialEnemy.setCollideWorldBounds(true);
        specialEnemy.body.onWorldBounds = true;
      }
      if (specialEnemy2) {
        specialEnemy2.health = specialEnemyHealth;
        specialEnemy2.lastFired = 0;
        specialEnemy2.setVelocityY(specialEnemySpeed);
        specialEnemy2.setCollideWorldBounds(true);
        specialEnemy2.body.onWorldBounds = true;
      }
    }

    function fireEnemyBullet(enemy) {
      const bullet = enemyBullets.getFirstDead(false);
      if (bullet) {
        bullet.enableBody(true, enemy.x, enemy.y + 20, true, true);
        bullet.setVelocityY(300);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
      }
    }

    function fireBossBullet(boss) {
      if (!boss.active) return; // 보스가 활성 상태가 아니면 발사 중지

      const bullet = bossBullets.getFirstDead(false);
      if (bullet) {
        bullet.enableBody(true, boss.x, boss.y + 20, true, true);

        // 플레이어와 보스의 위치를 기반으로 각도 계산
        const angle = Phaser.Math.Angle.Between(
          boss.x,
          boss.y,
          player.x,
          player.y,
        );

        // 각도를 기반으로 속도 설정
        bullet.setVelocity(
          Math.cos(angle) * bossBulletSpeed,
          Math.sin(angle) * bossBulletSpeed,
        );

        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
      }
    }

    function damageSpecialEnemy(bullet, specialEnemy) {
      bullet.disableBody(true, true);
      specialEnemy.health -= 1;
      if (specialEnemy.health <= 0) {
        const explosion = this.add
          .sprite(specialEnemy.x, specialEnemy.y, "bossExplosion")
          .play("bossExplosion");

        specialEnemy.disableBody(true, true);
        updateScore(500);
      }
    }

    function damageBoss(bullet, boss) {
      bullet.disableBody(true, true);
      boss.health -= 1;
      if (boss.health <= 0) {
        boss.disableBody(true, true);
        updateScore(2500);
        boss.fireTimer.remove(); // 보스가 파괴되면 총알 발사 타이머 제거

        // 보스 파괴 애니메이션 실행
        const explosion = this.add
          .sprite(boss.x, boss.y, "bossExplosion")
          .play("bossExplosion");
      }
    }

    function destroyEnemy(bullet, enemy) {
      bullet.disableBody(true, true);
      const boomm = this.add.sprite(enemy.x, enemy.y, "boom").play("boom");
      enemy.disableBody(true, true);
      updateScore(100);
    }

    function playerHit(player, bullet) {
      if (playerImmune || playerExploding) return;

      bullet.disableBody(true, true);
      lives--;

      if (livesGroup.getChildren().length > 0) {
        livesGroup.getChildren()[lives].destroy();
      }

      playerExploding = true;

      // 플레이어 파괴 애니메이션 실행
      const explosion = this.add.sprite(player.x, player.y, "boom");
      explosion.play("boom");

      // 애니메이션이 완료된 후 플레이어 비활성화 및 재생성
      explosion.on("animationcomplete", () => {
        explosion.destroy();
        player.disableBody(true, true);
        playerExploding = false;
        if (lives > 0) {
          respawnPlayer.call(this);
        } else {
          // 게임 오버 처리 로직 추가 가능
        }
      });
    }

    function respawnPlayer() {
      playerImmune = true;
      player.enableBody(true, 300, 700, true, true);
      player.alpha = 0.5; // 투명도를 조절하여 무적 상태 표시

      this.time.addEvent({
        delay: respawnDelay,
        callback: () => {
          playerImmune = false;
          player.alpha = 1;
        },
        callbackScope: this,
      });
    }

    function updateScore(points) {
      score += points;
      scoreText.setText("Score: " + score);
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game-container" ref={gameRef}></div>;
};

export default Game;
