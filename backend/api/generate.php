<?php

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = file_get_contents("php://input");
if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Empty request body"]);
    exit;
}

$cacheKey = hash("sha256", $input);

$cached = null;

try {
    $sql = $cacheTTL > 0
        ? "SELECT http_code, response FROM completions_cache
            WHERE cache_key = :key
              AND created_at >= DATE_SUB(NOW(), INTERVAL :ttl SECOND)
            LIMIT 1"
        : "SELECT http_code, response FROM completions_cache
            WHERE cache_key = :key
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(":key", $cacheKey);
    if ($cacheTTL > 0) {
        $stmt->bindValue(":ttl", $cacheTTL, PDO::PARAM_INT);
    }
    $stmt->execute();
    $cached = $stmt->fetch();
} catch (Exception  $e) {
    error_log("Cache read error: " . $e->getMessage());
}

if ($cached) {
    // -- Cache HIT ------------------------------------------------------------
    header("Content-Type: application/json");
    header("X-Cache: HIT");
    http_response_code((int)$cached["http_code"]);
    echo $cached["response"];
    exit;
}

$ch = curl_init($apiUrl);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $input,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer " . $apiKey,
        "HTTP-Referer: " . $baseUrl, 
        "X-Title: Completions Proxy"
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

if ($httpCode == 200) {
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO completions_cache (cache_key, http_code, response)
                  VALUES (:key, :code, :response)"
        );
        $stmt->execute([
            ":key"      => $cacheKey,
            ":code"     => $httpCode,
            ":response" => $response,
        ]);
    } catch (Exception $e) {
        error_log("Cache write error: " . $e->getMessage());
    }
}

http_response_code($httpCode);
header("Content-Type: application/json");
echo $response;
