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