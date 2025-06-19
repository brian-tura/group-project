-- DROP delle tabelle se esistono già
DROP TABLE IF EXISTS videogame_order;
DROP TABLE IF EXISTS videogame_platform;
DROP TABLE IF EXISTS videogame_genre;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS videogames;
DROP TABLE IF EXISTS platforms;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS publishers;

-- CREAZIONE DELLE TABELLE

CREATE TABLE publishers (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE genres (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE platforms (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE videogames (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  release_date DATE,
  price DECIMAL(5,2),
  multiplayer BOOLEAN,
  publisher_id INTEGER NOT NULL,
  image VARCHAR(255),
  offer DECIMAL(3,2) NULL,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id)
);

CREATE TABLE discounts (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  discount_code VARCHAR(255) NOT NULL,
  amount DECIMAL(3,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
  date DATE NOT NULL,
  status BOOLEAN NOT NULL,
  total_amount DECIMAL(6,2) NOT NULL,
  discount_id INTEGER,
  FOREIGN KEY (discount_id) REFERENCES discounts(id)
);

CREATE TABLE videogame_genre (
  videogame_id INTEGER,
  genre_id INTEGER,
  PRIMARY KEY (videogame_id, genre_id),
  FOREIGN KEY (videogame_id) REFERENCES videogames(id),
  FOREIGN KEY (genre_id) REFERENCES genres(id)
);

CREATE TABLE videogame_platform (
  videogame_id INTEGER,
  platform_id INTEGER,
  PRIMARY KEY (videogame_id, platform_id),
  FOREIGN KEY (videogame_id) REFERENCES videogames(id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE videogame_order (
  videogame_id INTEGER,
  order_id INTEGER,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY (videogame_id, order_id),
  FOREIGN KEY (videogame_id) REFERENCES videogames(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- POPOLAMENTO DATI INIZIALI

-- Publishers iniziali
INSERT INTO publishers (name) VALUES 
('Electronic Arts'),
('Ubisoft'),
('Nintendo'),
('Sony Interactive Entertainment'),
('Bethesda Softworks'),
('Square Enix'),
('Capcom');

-- Generi iniziali
INSERT INTO genres (name) VALUES 
('Action'),
('Adventure'),
('RPG'),
('Shooter'),
('Simulation'),
('Sports'),
('Racing'),
('Strategy'),
('Fighting');

-- Piattaforme
INSERT INTO platforms (name) VALUES 
('PC'),
('PlayStation 5'),
('Xbox Series X'),
('Nintendo Switch'),
('Mobile');

-- Videogames iniziali (20 videogiochi)
INSERT INTO videogames (name, slug, release_date, price, multiplayer, publisher_id, image) VALUES
('FIFA 24', 'fifa-24', '2024-09-29', 69.99, TRUE, 1, 'fifa24.jpg'),
('Assassin''s Creed Mirage', 'assassins-creed-mirage', '2023-10-05', 59.99, FALSE, 2, 'acmirage.jpg'),
('Zelda: Tears of the Kingdom', 'zelda-tears-of-the-kingdom', '2023-05-12', 69.99, FALSE, 3, 'zelda_tok.jpg'),
('Horizon Forbidden West', 'horizon-forbidden-west', '2022-02-18', 59.99, TRUE, 4, 'horizon_fw.jpg'),
('Starfield', 'starfield', '2023-09-06', 69.99, TRUE, 5, 'starfield.jpg'),
('The Sims 5', 'the-sims-5', '2025-03-15', 49.99, TRUE, 1, 'sims5.jpg'),
('Far Cry 6', 'far-cry-6', '2021-10-07', 39.99, TRUE, 2, 'farcry6.jpg'),
('Super Mario Wonder', 'super-mario-wonder', '2023-10-20', 59.99, TRUE, 3, 'mario_wonder.jpg'),
('God of War Ragnarök', 'god-of-war-ragnarok', '2022-11-09', 69.99, FALSE, 4, 'gow_ragnarok.jpg'),
('Doom Eternal', 'doom-eternal', '2020-03-20', 29.99, TRUE, 5, 'doom_eternal.jpg'),
('Battlefield 2042', 'battlefield-2042', '2021-11-19', 59.99, TRUE, 1, 'bf2042.jpg'),
('Just Dance 2024', 'just-dance-2024', '2023-10-24', 49.99, TRUE, 2, 'justdance24.jpg'),
('Animal Crossing: New Horizons', 'animal-crossing-new-horizons', '2020-03-20', 59.99, TRUE, 3, 'acnh.jpg'),
('The Last of Us Part II', 'the-last-of-us-part-ii', '2020-06-19', 49.99, FALSE, 4, 'tlou2.jpg'),
('Skyrim', 'skyrim', '2011-11-11', 19.99, TRUE, 5, 'skyrim.jpg'),
('Watch Dogs: Legion', 'watch-dogs-legion', '2020-10-29', 29.99, TRUE, 2, 'wd_legion.jpg'),
('Splatoon 3', 'splatoon-3', '2022-09-09', 59.99, TRUE, 3, 'splatoon3.jpg'),
('Gran Turismo 7', 'gran-turismo-7', '2022-03-04', 69.99, TRUE, 4, 'gt7.jpg'),
('Fallout 76', 'fallout-76', '2018-11-14', 19.99, TRUE, 5, 'fallout76.jpg'),
('TES IV Oblivion Remastered', 'tes-iv-oblivion-remastered', '2025-07-01', 59.99, FALSE, 5, 'tes_iv_oblivion.jpg'),
('FIFA 25', 'fifa-25', '2025-09-29', 69.99, TRUE, 1, 'fifa25.jpg'),                                     -- ID 21
('FIFA 23', 'fifa-23', '2023-09-29', 69.99, TRUE, 1, 'fifa23.jpg'),                                       -- ID 22
('Resident Evil Village', 'resident-evil-village', '2025-09-15', 59.99, TRUE, 7, 're_village.jpg'),         -- ID 23
('Final Fantasy XVI', 'final-fantasy-xvi', '2025-10-10', 69.99, TRUE, 6, 'ff16.jpg'),                         -- ID 24
('Rainbow Six Siege', 'rainbow-six-siege', '2025-07-20', 49.99, TRUE, 2, 'r6siege.jpg'),                     -- ID 25
('Uncharted 4: A Thief''s End', 'uncharted-4', '2025-11-25', 59.99, FALSE, 4, 'uncharted4.jpg'),             -- ID 26
('Dragon Quest XI S', 'dragon-quest-xi-s', '2025-12-05', 59.99, FALSE, 6, 'dqxi.jpg'),                        -- ID 27
('Super Smash Bros. Ultimate', 'smash-bros-ultimate', '2025-10-30', 59.99, TRUE, 3, 'smash_ultimate.jpg'),     -- ID 28
('Madden NFL 24', 'madden-nfl-24', '2025-09-05', 69.99, TRUE, 1, 'madden24.jpg'),                            -- ID 29
('Need for Speed Unbound', 'need-for-speed-unbound', '2025-10-20', 59.99, TRUE, 1, 'nfs_unbound.jpg'),         -- ID 30
('Street Fighter V', 'street-fighter-v', '2025-11-10', 49.99, TRUE, 7, 'sfv.jpg'),                             -- ID 31
('Ghost of Tsushima', 'ghost-of-tsushima', '2025-10-15', 59.99, FALSE, 4, 'ghost_tsushima.jpg'),             -- ID 32
('Mass Effect Legendary Edition', 'mass-effect-legendary-edition', '2025-12-15', 79.99, TRUE, 1, 'mass_effect.jpg'), -- ID 33
('Resident Evil 2 Remake', 'resident-evil-2-remake', '2025-09-25', 59.99, TRUE, 7, 're2_remake.jpg'),          -- ID 34
('Ghost Recon Breakpoint', 'ghost-recon-breakpoint', '2025-08-05', 49.99, TRUE, 2, 'ghost_recon.jpg'),         -- ID 35
('Final Fantasy VII Remake', 'final-fantasy-vii-remake', '2025-11-05', 69.99, TRUE, 6, 'ff7_remake.jpg'),       -- ID 36
('Marvel''s Spider-Man', 'marvels-spider-man', '2025-10-01', 59.99, TRUE, 4, 'spiderman.jpg'),                  -- ID 37
('Battlefield 1', 'battlefield-1', '2025-07-01', 49.99, TRUE, 1, 'battlefield1.jpg'),                          -- ID 38
('Devil May Cry 5', 'devil-may-cry-5', '2025-12-20', 59.99, TRUE, 7, 'dmc5.jpg'),                              -- ID 39
('The Division 2', 'the-division-2', '2025-08-15', 49.99, TRUE, 2, 'division2.jpg'),                           -- ID 40
('Dragon Age: Inquisition', 'dragon-age-inquisition', '2025-09-30', 59.99, TRUE, 1, 'dragon_age.jpg'),          -- ID 41
('Mega Man 11', 'mega-man-11', '2025-10-25', 39.99, TRUE, 7, 'megaman11.jpg'),                                -- ID 42
('Marvel''s Avengers', 'marvels-avengers', '2025-11-18', 49.99, TRUE, 6, 'avengers.jpg'),                       -- ID 43
('Ratchet & Clank: Rift Apart', 'ratchet-clank-rift-apart', '2025-12-10', 59.99, TRUE, 4, 'ratchet_clank.jpg'),-- ID 44
('F1 23', 'f1-23', '2025-10-05', 69.99, TRUE, 1, 'f1_23.jpg'),                                               -- ID 45
('Luigi''s Mansion 3', 'luigis-mansion-3', '2025-11-22', 59.99, TRUE, 3, 'luigis_mansion3.jpg'),               -- ID 46
('Shadow of the Tomb Raider', 'shadow-of-the-tomb-raider', '2025-12-01', 59.99, TRUE, 6, 'tombraider.jpg'),     -- ID 47
('Star Wars Jedi: Fallen Order', 'star-wars-jedi-fallen-order', '2025-10-12', 59.99, TRUE, 1, 'jedi_fallen_order.jpg'), -- ID 48
('Mario Kart 8 Deluxe', 'mario-kart-8-deluxe', '2025-11-28', 59.99, TRUE, 3, 'mario_kart8_deluxe.jpg'),         -- ID 49
('Expedition 33', 'expedition-33', '2025-08-25', 44.99, TRUE, 2, 'expedition33.jpg');                           -- ID 50

-- Associazioni (videogame - generi)
INSERT INTO videogame_genre (videogame_id, genre_id) VALUES
(1, 5),
(2, 1),
(3, 2),
(4, 1),
(5, 3),
(6, 5),
(7, 1),
(8, 2),
(9, 1),
(10, 4),
(11, 4),
(12, 5),
(13, 2),
(14, 2),
(15, 3),
(16, 1),
(17, 4),
(18, 5),
(19, 3),
(20, 3),
(21, 6),   -- FIFA 25: Sports
(22, 6),   -- FIFA 23: Sports
(23, 4),   -- Resident Evil Village: Shooter
(24, 3),   -- Final Fantasy XVI: RPG
(25, 4),   -- Rainbow Six Siege: Shooter
(26, 2),   -- Uncharted 4: A Thief’s End: Adventure
(27, 3),   -- Dragon Quest XI S: RPG
(28, 9),   -- Super Smash Bros. Ultimate: Fighting
(29, 6),   -- Madden NFL 24: Sports
(30, 7),   -- Need for Speed Unbound: Racing
(31, 9),   -- Street Fighter V: Fighting
(32, 2),   -- Ghost of Tsushima: Adventure
(33, 3),   -- Mass Effect Legendary Edition: RPG
(34, 4),   -- Resident Evil 2 Remake: Shooter
(35, 4),   -- Ghost Recon Breakpoint: Shooter
(36, 3),   -- Final Fantasy VII Remake: RPG
(37, 1),   -- Marvel’s Spider-Man: Action
(38, 4),   -- Battlefield 1: Shooter
(39, 1),   -- Devil May Cry 5: Action
(40, 4),   -- The Division 2: Shooter
(41, 3),   -- Dragon Age: Inquisition: RPG
(42, 1),   -- Mega Man 11: Action
(43, 1),   -- Marvel’s Avengers: Action
(44, 2),   -- Ratchet & Clank: Rift Apart: Adventure
(45, 7),   -- F1 23: Racing
(46, 2),   -- Luigi’s Mansion 3: Adventure
(47, 2),   -- Shadow of the Tomb Raider: Adventure
(48, 2),   -- Star Wars Jedi: Fallen Order: Adventure
(49, 7),   -- Mario Kart 8 Deluxe: Racing
(50, 3);   -- Expedition 33: RPG

-- Associazioni (videogame - piattaforme)
INSERT INTO videogame_platform (videogame_id, platform_id) VALUES
(1, 2), (1, 3),
(2, 2), (2, 3),
(3, 4),
(4, 2),
(5, 3), (5, 1),
(6, 1),
(7, 2), (7, 3),
(8, 4),
(9, 2),
(10, 1), (10, 3),
(11, 3), (11, 1),
(12, 4),
(13, 4),
(14, 2),
(15, 1),
(16, 2),
(17, 4),
(18, 2),
(19, 1), (19, 3),
(20, 1),
-- ID 21: FIFA 25
(21, 1), (21, 2), (21, 3),
-- ID 22: FIFA 23
(22, 1), (22, 2), (22, 3),
-- ID 23: Resident Evil Village
(23, 1), (23, 2),
-- ID 24: Final Fantasy XVI
(24, 1), (24, 2),
-- ID 25: Rainbow Six Siege
(25, 1), (25, 2), (25, 3),
-- ID 26: Uncharted 4: A Thief’s End
(26, 2),
-- ID 27: Dragon Quest XI S
(27, 1), (27, 2),
-- ID 28: Super Smash Bros. Ultimate
(28, 4),
-- ID 29: Madden NFL 24
(29, 1), (29, 2), (29, 3),
-- ID 30: Need for Speed Unbound
(30, 1), (30, 2), (30, 3),
-- ID 31: Street Fighter V
(31, 1), (31, 2),
-- ID 32: Ghost of Tsushima
(32, 2),
-- ID 33: Mass Effect Legendary Edition
(33, 1), (33, 2), (33, 3),
-- ID 34: Resident Evil 2 Remake
(34, 1), (34, 2),
-- ID 35: Ghost Recon Breakpoint
(35, 1), (35, 2), (35, 3),
-- ID 36: Final Fantasy VII Remake
(36, 1), (36, 2),
-- ID 37: Marvel’s Spider-Man
(37, 2), (37, 1),
-- ID 38: Battlefield 1
(38, 1), (38, 2), (38, 3),
-- ID 39: Devil May Cry 5
(39, 1), (39, 2),
-- ID 40: The Division 2
(40, 1), (40, 2), (40, 3),
-- ID 41: Dragon Age: Inquisition
(41, 1), (41, 2), (41, 3),
-- ID 42: Mega Man 11
(42, 1), (42, 2),
-- ID 43: Marvel’s Avengers
(43, 1), (43, 2), (43, 3),
-- ID 44: Ratchet & Clank: Rift Apart
(44, 2),
-- ID 45: F1 23
(45, 1), (45, 2), (45, 3),
-- ID 46: Luigi’s Mansion 3
(46, 4),
-- ID 47: Shadow of the Tomb Raider
(47, 1), (47, 2),
-- ID 48: Star Wars Jedi: Fallen Order
(48, 1), (48, 2), (48, 3),
-- ID 49: Mario Kart 8 Deluxe (sostituzione)
(49, 4),
-- ID 50: Expedition 33
(50, 1), (50, 4);

-- Discounts
INSERT INTO discounts (discount_code, amount, start_date, end_date) VALUES
('SUMMER25', 0.25, '2025-06-01', '2025-06-30'),
('NEWYEAR20', 0.20, '2025-12-20', '2026-01-05'),
('WEEKEND10', 0.10, '2025-06-14', '2025-06-16');

-- Orders
INSERT INTO orders (date, status, total_amount, discount_id) VALUES
('2025-06-10', TRUE, 104.98, 1),
('2025-06-11', TRUE, 49.99, NULL),
('2025-06-12', FALSE, 69.99, 3),
('2025-06-13', TRUE, 89.98, 2);

-- Inserimento degli ordini di videogame (per i videogiochi iniziali)
INSERT INTO videogame_order (videogame_id, order_id) VALUES
(1, 1), (2, 1),
(6, 2),
(5, 3);