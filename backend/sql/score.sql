

CREATE DATABASE game_scores;
USE game_scores;

CREATE TABLE scores (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        score INT NOT NULL
);