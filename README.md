# LyricLens 

LyricLens is an AI-powered song lyrics analysis tool. It help users uncover the hidden depths of their favorite songs by providing a comprehensive breakdown of themes, emotions, literary devices, and structure.

## Features

- **Deep Lyrics Analysis**: Uses advanced AI (gemma-4-26b-a4b-it) to deconstruct song meaning.
- **Visual Metrics (Radar Chart)**: Visualizes 8 key dimensions of a song:
  - Emotion, complexity, storytelling, imagery, repetition, intensity, originality, and depth.
- **Multilingual Support**: Generate analyses in English, German, Spanish, French, Italian, or Japanese.
- **File Upload**: Supports pasting lyrics directly or uploading `.txt` files.
- **Analysis History**: Keeps track of your recent analyses (stored on a PHP/MySQL backend).
- **Responsive & Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a smooth, immersive experience.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: PHP (for API), MySQL (for history storage).
- **AI Integration**: Openrouter or Ollama 

## Getting Started 

### Prerequisites
- A web server (Apache/Nginx) with PHP and MySQL support.
- Node.js & npm (for building the frontend).
- A running [Ollama](https://ollama.com/) instance (optional, for local AI).

### Backend Setup
1. Create a MySQL database named `lyriclens`.
2. Run the SQL schema found in `backend/database.sql` to create the history table.
3. Configure your database credentials in `backend/api/config/config.php`.
4. Upload the contents of the `backend/` folder to your web server (e.g., to `/api`).

### Frontend Setup
1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Update the config.ts file in the /src directory:

```typescript
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
```

4. Build the project:

```bash
npm run build
```

5. Deploy the contents of the `dist/` folder to your web server.

## Development 🧪

To run the development server locally:

```bash
npm run dev
```

## AI Studio "Vibe-Coding"

This project was built using "Vibe-Coding" methods in Google AI Studio. It showcases how a developer can iterate rapidly from a simple idea to a complex full-stack application by directing a coding agent through natural language.

---

**Developed by Michael Jentsch** | [jentsch.io](https://jentsch.io/)
Copyright © 2026
