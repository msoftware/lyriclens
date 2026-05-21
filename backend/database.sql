CREATE TABLE IF NOT EXISTS history (
    id VARCHAR(255) PRIMARY KEY,
    lyrics TEXT,
    analysis TEXT,
	metrics TEXT,
    language VARCHAR(50),
    timestamp BIGINT
);

CREATE TABLE metrics (
    history_id VARCHAR(255) PRIMARY KEY,
    emotion INT,
    complexity INT,
    storytelling INT,
    imagery INT,
    repetition INT,
    intensity INT,
    originality INT,
    depth INT,
    primary_theme varchar(100) DEFAULT NULL,
    dominant_emotion varchar(100) DEFAULT NULL,
    complexity_level varchar(100) DEFAULT NULL,
    narrative_style varchar(100) DEFAULT NULL,
    FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS completions_cache (
    cache_key   CHAR(64)      NOT NULL PRIMARY KEY,
    http_code   SMALLINT      NOT NULL,
    response    MEDIUMTEXT    NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;