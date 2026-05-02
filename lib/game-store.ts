// Game state management for WLYO - Who Let You Online?

export type GameScreen = 
  | "landing" 
  | "maze"
  | "seed-flash" 
  | "gate"
  | "era-room" 
  | "vibe-report";

export type Era = "boomer" | "millennial" | "older-gen-z" | "gen-z-core" | "gen-alpha";

export type GateType = "image" | "audio";

export interface MemeOption {
  id: string;
  text: string;
  era: Era;
  isCorrect?: boolean; // The "right" answer for that meme
}

export interface MemeGate {
  id: number;
  type: GateType;
  // For image gates - the meme shown during seed flash
  seedImage?: string;
  seedDuration?: number; // How long to show (default 700ms)
  // For audio gates
  audioUrl?: string;
  audioFallbackText?: string;
  // The question asked after flash/audio
  prompt: string;
  // Answer options
  options: MemeOption[];
}

export interface GameState {
  currentScreen: GameScreen;
  currentGateIndex: number;
  completedGates: number[];
  selectedAnswers: { gateId: number; optionId: string; era: Era; isCorrect: boolean }[];
  scores: {
    rizz: number;
    aura: number;
    sigma: number;
    era: number;
  };
  finalEra: Era | null;
  estimatedAge: number | null;
  audioEnabled: boolean;
  replayUsed: boolean;
  reducedMotion: boolean;
}

export const initialGameState: GameState = {
  currentScreen: "landing",
  currentGateIndex: 0,
  completedGates: [],
  selectedAnswers: [],
  scores: {
    rizz: 0,
    aura: 0,
    sigma: 0,
    era: 0,
  },
  finalEra: null,
  estimatedAge: null,
  audioEnabled: true,
  replayUsed: false,
  reducedMotion: false,
};

// 7 Gates - mix of image and audio recognition
export const memeGates: MemeGate[] = [
  // Gate 1: Image Gate - "This is Fine" dog
  {
    id: 1,
    type: "image",
    seedImage: "https://i.imgflip.com/30b1gx.jpg",
    seedDuration: 700,
    prompt: "What does the dog say?",
    options: [
      { id: "1a", text: "This is fine.", era: "older-gen-z", isCorrect: true },
      { id: "1b", text: "Not stonks", era: "gen-z-core" },
      { id: "1c", text: "Le epic fail", era: "millennial" },
      { id: "1d", text: "I forgor", era: "gen-alpha" },
    ],
  },
  // Gate 2: Audio Gate - Vine boom
  {
    id: 2,
    type: "audio",
    audioUrl: "/audio/vine-boom.mp3",
    audioFallbackText: "BOOM! *dramatic bass*",
    prompt: "What sound effect is this?",
    options: [
      { id: "2a", text: "Vine Boom", era: "gen-z-core", isCorrect: true },
      { id: "2b", text: "Windows XP Error", era: "millennial" },
      { id: "2c", text: "MLG Airhorn", era: "older-gen-z" },
      { id: "2d", text: "Fanum Tax Sound", era: "gen-alpha" },
    ],
  },
  // Gate 3: Image Gate - Harambe
  {
    id: 3,
    type: "image",
    seedImage: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Harambe_Memorial_at_Cincinnati_Zoo.jpg/220px-Harambe_Memorial_at_Cincinnati_Zoo.jpg",
    seedDuration: 700,
    prompt: "Who did you just see?",
    options: [
      { id: "3a", text: "Harambe", era: "older-gen-z", isCorrect: true },
      { id: "3b", text: "King Kong", era: "boomer" },
      { id: "3c", text: "Monke", era: "gen-z-core" },
      { id: "3d", text: "Diddy", era: "gen-alpha" },
    ],
  },
  // Gate 4: Audio Gate - Rickroll
  {
    id: 4,
    type: "audio",
    audioUrl: "/audio/rickroll.mp3",
    audioFallbackText: "Never gonna give you up, never gonna let you down...",
    prompt: "Complete the lyrics: Never gonna give you...",
    options: [
      { id: "4a", text: "Up!", era: "millennial", isCorrect: true },
      { id: "4b", text: "Rizz!", era: "gen-alpha" },
      { id: "4c", text: "The aux!", era: "gen-z-core" },
      { id: "4d", text: "My number!", era: "boomer" },
    ],
  },
  // Gate 5: Image Gate - Among Us
  {
    id: 5,
    type: "image",
    seedImage: "https://i.imgflip.com/4acd7j.png",
    seedDuration: 600,
    prompt: "When someone is acting weird, they are...",
    options: [
      { id: "5a", text: "SUS", era: "gen-z-core", isCorrect: true },
      { id: "5b", text: "Sketch", era: "millennial" },
      { id: "5c", text: "Ohio", era: "gen-alpha" },
      { id: "5d", text: "Trolling", era: "older-gen-z" },
    ],
  },
  // Gate 6: Audio Gate - Oh No TikTok
  {
    id: 6,
    type: "audio",
    audioUrl: "/audio/oh-no.mp3",
    audioFallbackText: "Oh no... Oh no... Oh no no no no no!",
    prompt: "This sound is from...",
    options: [
      { id: "6a", text: "TikTok Oh No", era: "gen-z-core", isCorrect: true },
      { id: "6b", text: "A scary movie", era: "boomer" },
      { id: "6c", text: "Vine", era: "older-gen-z" },
      { id: "6d", text: "Skibidi Toilet", era: "gen-alpha" },
    ],
  },
  // Gate 7: Image Gate - Sigma/Gigachad
  {
    id: 7,
    type: "image",
    seedImage: "https://i.kym-cdn.com/entries/icons/original/000/026/152/gigachad.jpg",
    seedDuration: 500,
    prompt: "This man is known as...",
    options: [
      { id: "7a", text: "Gigachad", era: "gen-z-core", isCorrect: true },
      { id: "7b", text: "The Rock", era: "millennial" },
      { id: "7c", text: "Sigma Male", era: "gen-alpha" },
      { id: "7d", text: "Some guy", era: "boomer" },
    ],
  },
];

// Era configuration with theming
export const eraConfig: Record<Era, { 
  name: string; 
  ageRange: string; 
  color: string;
  bgClass: string;
}> = {
  boomer: {
    name: "Digital Dinosaur",
    ageRange: "45+",
    color: "var(--warning)",
    bgClass: "from-warning/30 via-warning/10 to-transparent",
  },
  millennial: {
    name: "Rage Comic Veteran",
    ageRange: "28-44",
    color: "var(--electric)",
    bgClass: "from-electric/30 via-electric/10 to-transparent",
  },
  "older-gen-z": {
    name: "Vine Archaeologist",
    ageRange: "22-27",
    color: "var(--acid)",
    bgClass: "from-acid/30 via-acid/10 to-transparent",
  },
  "gen-z-core": {
    name: "Certified Zoomer",
    ageRange: "16-21",
    color: "var(--magenta)",
    bgClass: "from-magenta/30 via-magenta/10 to-transparent",
  },
  "gen-alpha": {
    name: "Skibidi Overlord",
    ageRange: "10-15",
    color: "var(--lavender)",
    bgClass: "from-lavender/30 via-lavender/10 to-transparent",
  },
};

// Roasts per era
const roasts: Record<Era, string[]> = {
  boomer: [
    "Your memes are still loading on Internet Explorer",
    "You probably still forward chain emails",
    "Facebook is your natural habitat",
  ],
  millennial: [
    "Your humor peaked at rage comics and it shows",
    "You still quote Friday by Rebecca Black",
    "Nyan Cat lives rent-free in your head",
  ],
  "older-gen-z": [
    "You cry watching Vine compilations at 3am",
    "Peak internet was 2016 and you know it",
    "Harambe's death was your 9/11",
  ],
  "gen-z-core": [
    "Your attention span is sponsored by TikTok",
    "You speak fluent ironic brainrot",
    "Everything is either bussin or mid to you",
  ],
  "gen-alpha": [
    "Your brain is 90% Skibidi toilet lore",
    "You mew in your sleep",
    "Ohio claimed you at birth",
  ],
};

// Titles per era
const titles: Record<Era, string[]> = {
  boomer: ["Certified Fossil", "Internet Explorer User", "Facebook Archaeologist"],
  millennial: ["Rage Comic Survivor", "Dial-Up Warrior", "Nyan Cat Whisperer"],
  "older-gen-z": ["Vine Compilation Curator", "Harambe Mourner", "RIP Vine Enjoyer"],
  "gen-z-core": ["Brainrot Connoisseur", "Shitpost Scholar", "Sus Detective"],
  "gen-alpha": ["Skibidi Toilet PhD", "Rizz Overlord", "Ohio Final Boss"],
};

// Calculate final results based on answers
export function calculateResults(answers: { gateId: number; optionId: string; era: Era; isCorrect: boolean }[]): {
  scores: { rizz: number; aura: number; sigma: number; era: number };
  finalEra: Era;
  estimatedAge: number;
  title: string;
  roast: string;
} {
  // Count era occurrences and correct answers
  const eraCounts: Record<Era, number> = {
    boomer: 0,
    millennial: 0,
    "older-gen-z": 0,
    "gen-z-core": 0,
    "gen-alpha": 0,
  };

  let correctCount = 0;

  answers.forEach((answer) => {
    eraCounts[answer.era]++;
    if (answer.isCorrect) correctCount++;
  });

  // Find dominant era
  let maxCount = 0;
  let finalEra: Era = "gen-z-core";
  (Object.keys(eraCounts) as Era[]).forEach((era) => {
    if (eraCounts[era] > maxCount) {
      maxCount = eraCounts[era];
      finalEra = era;
    }
  });

  // Calculate scores based on performance
  const accuracy = correctCount / answers.length;
  
  const rizz = Math.min(100, Math.round(
    accuracy * 60 + 
    (eraCounts["gen-alpha"] / answers.length) * 30 + 
    Math.random() * 20
  ));

  const aura = Math.min(100, Math.round(
    accuracy * 70 + 
    Math.random() * 30
  ));

  const sigma = Math.min(100, Math.round(
    ((eraCounts["gen-z-core"] + eraCounts["gen-alpha"]) / answers.length) * 60 + 
    accuracy * 20 +
    Math.random() * 20
  ));

  const era = Math.min(100, Math.round(
    (maxCount / answers.length) * 70 + 
    accuracy * 20 +
    Math.random() * 10
  ));

  // Calculate estimated age based on era
  const ageRanges: Record<Era, [number, number]> = {
    boomer: [45, 60],
    millennial: [28, 44],
    "older-gen-z": [22, 27],
    "gen-z-core": [16, 21],
    "gen-alpha": [10, 15],
  };
  const [minAge, maxAge] = ageRanges[finalEra];
  const estimatedAge = Math.round(minAge + Math.random() * (maxAge - minAge));

  // Get title and roast
  const title = titles[finalEra][Math.floor(Math.random() * titles[finalEra].length)];
  const roast = roasts[finalEra][Math.floor(Math.random() * roasts[finalEra].length)];

  return {
    scores: { rizz, aura, sigma, era },
    finalEra,
    estimatedAge,
    title,
    roast,
  };
}
