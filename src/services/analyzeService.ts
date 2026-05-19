import config from "../config";

export interface AnalysisMetrics {
  Emotion: number;
  Complexity: number;
  Storytelling: number;
  Imagery: number;
  Repetition: number;
  Intensity: number;
  Originality: number;
  Depth: number;
  PrimaryTheme?: string;
  DominantEmotion?: string;
  ComplexityLevel?: string;
  NarrativeStyle?: string;
}

export interface AnalysisResult {
  analysis: string;
  metrics: AnalysisMetrics | null;
}

export const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'de', label: 'Deutsch' },
  { key: 'es', label: 'Español' },
  { key: 'fr', label: 'Français' },
  { key: 'it', label: 'Italiano' },
  { key: 'ja', label: '日本語' },
];

const THEME_EXAMPLES: Record<string, string[]> = {
  en: ['Heartbreak','Love','Loneliness','Self-Discovery','Rebellion','Mental Health','Nostalgia','Hope','Addiction','Society','Faith','Violence','Fame','Freedom','Identity','Loss','Revenge','Empowerment'],
  de: ['Herzschmerz','Liebe','Einsamkeit','Selbstfindung','Rebellion','Psychische Gesundheit','Nostalgie','Hoffnung','Sucht','Gesellschaft','Glaube','Gewalt','Ruhm','Freiheit','Identität','Verlust','Rache','Ermächtigung'],
  es: ['Desamor','Amor','Soledad','Autodescubrimiento','Rebeldía','Salud Mental','Nostalgia','Esperanza','Adicción','Sociedad','Fe','Violencia','Fama','Libertad','Identidad','Pérdida','Venganza','Empoderamiento'],
  fr: ['Peine de cœur','Amour','Solitude','Découverte de soi','Rébellion','Santé mentale','Nostalgie','Espoir','Dépendance','Société','Foi','Violence','Gloire','Liberté','Identité','Perte','Vengeance','Empuissancement'],
  it: ['Dolore','Amore','Solitudine','Scoperta di sé','Ribellione','Salute mentale','Nostalgia','Speranza','Dipendenza','Società','Fede','Violenza','Fama','Libertà','Identità','Perdita','Vendetta','Emancipazione'],
  ja: ['失恋','愛','孤独','自己発見','反抗','メンタルヘルス','ノスタルジア','希望','依存','社会','信仰','暴力','名声','自由','アイデンティティ','喪失','復讐','エンパワーメント'],
};

const EMOTION_EXAMPLES: Record<string, string[]> = {
  en: ['Melancholy','Anger','Euphoria','Bittersweet','Anxiety','Passion','Hopefulness','Despair','Longing','Nostalgia','Confidence','Isolation','Vulnerability'],
  de: ['Melancholie','Wut','Euphorie','Bittersüß','Angst','Leidenschaft','Hoffnung','Verzweiflung','Sehnsucht','Nostalgie','Selbstvertrauen','Isolation','Verletzlichkeit'],
  es: ['Melancolía','Ira','Euforia','Agridulce','Ansiedad','Pasión','Esperanza','Desesperación','Anhelo','Nostalgia','Confianza','Aislamiento','Vulnerabilidad'],
  fr: ['Mélancolie','Colère','Euphorie','Doux-amer','Anxiété','Passion','Espoir','Désespoir','Nostalgie','Aspiration','Confiance','Isolement','Vulnérabilité'],
  it: ['Malinconia','Rabbia','Euforia','Agrodolce','Ansia','Passione','Speranza','Disperazione','Nostalgia','Desiderio','Fiducia','Isolamento','Vulnerabilità'],
  ja: ['憂鬱','怒り','多幸感','甘くて切ない','不安','情熱','希望','絶望','憧れ','ノスタルジア','自信','孤立','脆弱性'],
};

const COMPLEXITY_EXAMPLES: Record<string, string[]> = {
  en: ['Simple','Moderate','Advanced','Poetic','Highly Symbolic'],
  de: ['Einfach','Mäßig','Fortgeschritten','Poetisch','Hochsymbolisch'],
  es: ['Simple','Moderado','Avanzado','Poético','Altamente Simbólico'],
  fr: ['Simple','Modéré','Avancé','Poétique','Très Symbolique'],
  it: ['Semplice','Moderato','Avanzato','Poetico','Altamente Simbolico'],
  ja: ['シンプル','中程度','高度','詩的','高度に象徴的'],
};

const NARRATIVE_EXAMPLES: Record<string, string[]> = {
  en: ['Personal','Confessional','Conversational','Cinematic','Abstract','Stream-of-Consciousness','Story-Driven','Reflective','Fragmented','Aggressive','Poetic','Observational'],
  de: ['Persönlich','Bekenntnishaft','Gesprächig','Filmisch','Abstrakt','Bewusstseinsstrom','Erzählerisch','Reflektierend','Fragmentiert','Aggressiv','Poetisch','Beobachtend'],
  es: ['Personal','Confesional','Conversacional','Cinematográfico','Abstracto','Flujo de Conciencia','Narrativo','Reflexivo','Fragmentado','Agresivo','Poético','Observacional'],
  fr: ['Personnel','Confessionnel','Conversationnel','Cinématographique','Abstrait','Flux de Conscience','Narratif','Réflexif','Fragmenté','Agressif','Poétique','Observationnel'],
  it: ['Personale','Confessionale','Conversazionale','Cinematografico','Astratto','Flusso di Coscienza','Narrativo','Riflessivo','Frammentato','Aggressivo','Poetico','Osservazionale'],
  ja: ['個人的','告白的','会話的','映画的','抽象的','意識の流れ','物語主導','内省的','断片的','攻撃的','詩的','観察的'],
};

export async function analyzeLyrics(lyrics: string, language: string): Promise<AnalysisResult> {

  const themes   = (THEME_EXAMPLES[language] ?? THEME_EXAMPLES.en).join(', ');
  const emotions = (EMOTION_EXAMPLES[language] ?? EMOTION_EXAMPLES.en).join(', ');
  const complexities = (COMPLEXITY_EXAMPLES[language] ?? COMPLEXITY_EXAMPLES.en).join(', ');
  const narratives   = (NARRATIVE_EXAMPLES[language] ?? NARRATIVE_EXAMPLES.en).join(', ');

  const selectedLanguage = LANGUAGES.find(
    (lang) => lang.key === language
  );

  const prompt = `
# Response language
Write your **entire response** in: ${selectedLanguage?.label}

## Your Analysis Must Cover These Sections:

### 1. Thematic Core
- What is the central theme or message of the lyrics?
- Are there underlying subtexts or secondary themes?

### 2. Language & Style
- Describe the tone, voice, and register (e.g., confessional, defiant, melancholic)
- Identify notable stylistic devices:
  - metaphors
  - similes
  - alliteration
  - irony
  - paradox
  - symbolism
  - wordplay
- Evaluate the vocabulary:
  - simple vs. complex
  - colloquial vs. poetic
  - direct vs. abstract

### 3. Imagery & Visual Language
- Which images, scenes, or sensory impressions are evoked?
- How effectively does the language create visualization or atmosphere?

### 4. Storytelling & Structure
- Is there a narrative arc?
- Who is the speaker and who is addressed?
- How do verses, chorus, and bridge contribute to progression?
- Does the structure feel cinematic, fragmented, cyclical, introspective, or conversational?

### 5. Repetition & Hooks
- Which phrases or motifs are repeated?
- What emotional or structural effect does repetition create?
- Does repetition strengthen memorability or reduce impact?

### 6. Emotional Impact
- Which emotions dominate the lyrics?
- How emotionally authentic and convincing are they?
- Does the emotional intensity evolve throughout the song?

### 7. Originality & Depth
- What makes the lyrics unique or conventional?
- Do they rely on clichés or provide fresh perspectives?
- Is there philosophical, political, psychological, or personal depth?

### 8. Overall Intensity
- How powerful, immersive, or emotionally gripping is the song overall?

---

# Classification Requirements

You MUST infer and classify the following additional metadata from the lyrics.

These fields are REQUIRED and MUST ALWAYS be included in the JSON output.

## PrimaryTheme
Choose the single dominant thematic category.
Examples: ${themes}

## DominantEmotion
Choose the strongest emotional atmosphere conveyed by the lyrics.
Examples: ${emotions}

## ComplexityLevel
Classify the lyrical sophistication.
Allowed values: ${complexities}

## NarrativeStyle
Classify the dominant storytelling perspective or delivery style.
Examples: ${narratives}

---

# Scoring

After your analysis, you **MUST** output a JSON block. This is **mandatory and non-negotiable** — do not skip or omit it under any circumstances, even if the lyrics are short, ambiguous, or unusual.

Rate each category on a scale from **1 (very low) to 10 (exceptional)** based strictly on your analysis above.


# REQUIRED JSON FORMAT

You MUST output EXACTLY this structure.

Do not omit fields.
Do not rename fields.
Do not add comments.
Do not add trailing commas.

\`\`\`json
{
  "Emotion": <1-10>,
  "Complexity": <1-10>,
  "Storytelling": <1-10>,
  "Imagery": <1-10>,
  "Repetition": <1-10>,
  "Intensity": <1-10>,
  "Originality": <1-10>,
  "Depth": <1-10>,
  "PrimaryTheme": "<string>",
  "DominantEmotion": "<string>",
  "ComplexityLevel": "<string>",
  "NarrativeStyle": "<string>"
}
\`\`\`

> ⚠️ The JSON block must always appear as the **very last element** of your response, enclosed exactly in \`\`\`json ... \`\`\` — no text after it.

---

## Lyrics to Analyze:

"""
${lyrics}
"""
`;

  try {
    const response = await fetch(config.api.generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model.name,
        messages: [
          {
            "role": "system",
            "content": "You are an expert music critic and literary analyst specializing in lyrical analysis. Your task is to analyze the following song lyrics with depth, precision, and cultural awareness."
          },
          {
            "role": "user",
            "content": prompt
          }

        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text =  data.choices[0].message.content || "No analysis generated.";
        
    let metrics: AnalysisMetrics | null = null;
    let analysisStr = text;

    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        metrics = JSON.parse(jsonMatch[1]);
        analysisStr = text.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse metrics JSON:", e);
      }
    }

    return { analysis: analysisStr, metrics };


  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
}
