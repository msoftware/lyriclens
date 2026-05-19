const config = {
  api: {
    generateUrl: "/api/generate.php",
    historyUrl: "/api/history.php",
  },
  model: {
    name: "google/gemma-4-26b-a4b-it",
  },
} as const;

export default config;