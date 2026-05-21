<?php

header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query('
            SELECT h.*, 
                   m.emotion, m.complexity, m.storytelling, 
                   m.imagery, m.repetition, m.intensity, 
                   m.originality, m.depth, m.primary_theme,
                   m.dominant_emotion, m.complexity_level, 
                   m.narrative_style
            FROM history h
            LEFT JOIN metrics m ON h.id = m.history_id
            ORDER BY h.timestamp DESC 
            LIMIT 9
        ');
        
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $history = [];

        foreach ($rows as $row) {
            $history[] = [
                'id' => $row['id'],
                'lyrics' => isset($row['lyrics']) ? $row['lyrics'] : null,
                'lyrics' => $row['lyrics'],
                'analysis' => $row['analysis'],
                'language' => $row['language'],
                'timestamp' => (int)$row['timestamp'],
                'metrics' => [
                    'Emotion' => isset($row['emotion']) ? (int)$row['emotion'] : 0,
                    'Complexity' => isset($row['complexity']) ? (int)$row['complexity'] : 0,
                    'Storytelling' => isset($row['storytelling']) ? (int)$row['storytelling'] : 0,
                    'Imagery' => isset($row['imagery']) ? (int)$row['imagery'] : 0,
                    'Repetition' => isset($row['repetition']) ? (int)$row['repetition'] : 0,
                    'Intensity' => isset($row['intensity']) ? (int)$row['intensity'] : 0,
                    'Originality' => isset($row['originality']) ? (int)$row['originality'] : 0,
                    'Depth' => isset($row['depth']) ? (int)$row['depth'] : 0,
                    'PrimaryTheme' => isset($row['primary_theme']) ? $row['primary_theme'] : '',
                    'DominantEmotion' => isset($row['dominant_emotion']) ? $row['dominant_emotion'] : '',
                    'ComplexityLevel' => isset($row['complexity_level']) ? $row['complexity_level'] : '',
                    'NarrativeStyle' => isset($row['narrative_style']) ? $row['narrative_style'] : ''

                ]
            ];
        }

        echo json_encode($history);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch history']);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id) && !empty($data->lyrics) && !empty($data->analysis) && !empty($data->language) && !empty($data->timestamp)) {
        try {
            $stmtCheck = $pdo->prepare('SELECT id FROM history WHERE lyrics = ? AND language = ? LIMIT 1');
            $stmtCheck->execute([$data->lyrics, $data->language]);

            if ($stmtCheck->fetch()) {
                echo json_encode(['success' => true, 'duplicate' => true]);
                exit;
            }

            // Begin a transaction to safely insert into two tables
            $pdo->beginTransaction();

            // 1. Insert into history
            $stmt = $pdo->prepare('INSERT INTO history (id, lyrics, analysis, language, timestamp) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([
                $data->id,
                $data->lyrics,
                $data->analysis,
                $data->language,
                $data->timestamp
            ]);

            // 2. Insert into metrics (if they were provided in the JSON)
            if (!empty($data->metrics)) {
                $stmtMetrics = $pdo->prepare('INSERT INTO metrics (history_id, emotion, complexity, storytelling, imagery, repetition, intensity, originality, depth, primary_theme, dominant_emotion, complexity_level, narrative_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmtMetrics->execute([
                    $data->id,
                    isset($data->metrics->Emotion) ? $data->metrics->Emotion : 0,
                    isset($data->metrics->Complexity) ? $data->metrics->Complexity : 0,
                    isset($data->metrics->Storytelling) ? $data->metrics->Storytelling : 0,
                    isset($data->metrics->Imagery) ? $data->metrics->Imagery : 0,
                    isset($data->metrics->Repetition) ? $data->metrics->Repetition : 0,
                    isset($data->metrics->Intensity) ? $data->metrics->Intensity : 0,
                    isset($data->metrics->Originality) ? $data->metrics->Originality : 0,
                    isset($data->metrics->Depth) ? $data->metrics->Depth : 0,
                    isset($data->metrics->PrimaryTheme) ? $data->metrics->PrimaryTheme : '',
                    isset($data->metrics->DominantEmotion) ? $data->metrics->DominantEmotion : '',
                    isset($data->metrics->ComplexityLevel) ? $data->metrics->ComplexityLevel : '',
                    isset($data->metrics->NarrativeStyle) ? $data->metrics->NarrativeStyle : ''
                ]);
            }

            // Commit the transaction
            $pdo->commit();

            echo json_encode(['success' => true, 'duplicate' => false]);
        } catch (Exception $e) {
            // Rollback in case of a DB error to prevent orphaned data
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save history']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Incomplete data']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
