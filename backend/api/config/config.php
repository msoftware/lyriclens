<?php

$baseUrl = "https://lyriclens.jentsch.io/";

// MySQL config
$host = 'localhost';
$dbname = 'lyriclens';
$user = 'user';             // Change this to your MySQL username
$pass = 'password';         // Change this to your MySQL password
$charset = 'utf8mb4';

// Openrouter config
$apiKey = "sk-XXXXX";       // Change this to your Openrouter key
$apiUrl = "https://openrouter.ai/api/v1/chat/completions";

// Cache TTL in seconds (0 = keep forever)
$cacheTTL = 0;
?>