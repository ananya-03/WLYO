// Game state management for WLYO - Who Let You Online?

export type GameScreen = 
  | "landing" 
  | "seed-flash" 
  | "maze-hub" 
  | "fork-gate" 
  | "audio-door" 
  | "era-room" 
  | "vibe-report";

export type Era = "boomer" | "millennial" | "older-gen-z" | "gen-z-core" | "gen-alpha";

export type GateType = "fork" | "audio";

export interface MemeOption {
  id: string;
  text?: string;
  imageUrl?: string;
  era: Era;
  points: number; // How many points this choice gives
}

export interface MemeGate {
  id: number;
  type: GateType;
  prompt: string;
  options: MemeOption[];
  // For fork gates - seed image to flash
  seedImage?: string;
  // For audio doors - audio clip URL
  audioUrl?: string;
  audioFallbackPrompt?: string; // If audio can't play
}

export interface GameState {
  currentScreen: GameScreen;
  currentGateIndex: number;
  completedGates: number[];
  selectedAnswers: { gateId: number; optionId: string; era: Era; points: number }[];
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

// Mixed gates with both Fork Gates and Audio Doors
export const memeGates: MemeGate[] = [
  // Gate 1: Fork Gate - Classic meme recognition
  {
    id: 1,
    type: "fork",
    prompt: "This dog is surrounded by flames. What does he say?",
    seedImage: "https://i.imgflip.com/30b1gx.jpg",
    options: [
      { id: "1a", text: "This is fine.", era: "older-gen-z", points: 10 },
      { id: "1b", text: "Not stonks", era: "gen-z-core", points: 5 },
      { id: "1c", text: "Le epic fail", era: "millennial", points: 3 },
      { id: "1d", text: "Skibidi fire", era: "gen-alpha", points: 2 },
    ],
  },
  // Gate 2: Audio Door - Sound recognition
  {
    id: 2,
    type: "audio",
    prompt: "What sound is this from?",
    audioUrl: "/audio/vine-boom.mp3",
    audioFallbackPrompt: "BOOM! What dramatic sound effect is this?",
    options: [
      { id: "2a", text: "Vine Boom", era: "gen-z-core", points: 10 },
      { id: "2b", text: "Windows XP", era: "millennial", points: 3 },
      { id: "2c", text: "MLG Airhorn", era: "older-gen-z", points: 5 },
      { id: "2d", text: "Skibidi Toilet", era: "gen-alpha", points: 2 },
    ],
  },
  // Gate 3: Fork Gate
  {
    id: 3,
    type: "fork",
    prompt: "What happened to Harambe?",
    seedImage: "https://i.imgflip.com/1jgrgn.jpg",
    options: [
      { id: "3a", text: "He got justice", era: "older-gen-z", points: 10 },
      { id: "3b", text: "Fanum taxed", era: "gen-alpha", points: 2 },
      { id: "3c", text: "Got yeeted", era: "gen-z-core", points: 5 },
      { id: "3d", text: "Became a legend", era: "millennial", points: 8 },
    ],
  },
  // Gate 4: Audio Door
  {
    id: 4,
    type: "audio",
    prompt: "Complete the lyrics...",
    audioUrl: "/audio/rick-roll.mp3",
    audioFallbackPrompt: "Never gonna give you...",
    options: [
      { id: "4a", text: "Up!", era: "millennial", points: 10 },
      { id: "4b", text: "Rizz!", era: "gen-alpha", points: 2 },
      { id: "4c", text: "The aux!", era: "gen-z-core", points: 3 },
      { id: "4d", text: "Peace!", era: "boomer", points: 5 },
    ],
  },
  // Gate 5: Fork Gate
  {
    id: 5,
    type: "fork",
    prompt: "When something is extremely suspicious...",
    seedImage: "https://i.imgflip.com/4acd7j.png",
    options: [
      { id: "5a", text: "SUS", era: "gen-z-core", points: 10 },
      { id: "5b", text: "Sketch", era: "millennial", points: 5 },
      { id: "5c", text: "Ohio behavior", era: "gen-alpha", points: 8 },
      { id: "5d", text: "Weird flex", era: "older-gen-z", points: 6 },
    ],
  },
  // Gate 6: Audio Door
  {
    id: 6,
    type: "audio",
    prompt: "What meme does this sound belong to?",
    audioUrl: "/audio/oh-no.mp3",
    audioFallbackPrompt: "Oh no... Oh no... Oh no no no no no!",
    options: [
      { id: "6a", text: "TikTok Oh No", era: "gen-z-core", points: 10 },
      { id: "6b", text: "Vine Compilation", era: "older-gen-z", points: 5 },
      { id: "6c", text: "Nyan Cat", era: "millennial", points: 3 },
      { id: "6d", text: "Skibidi Bop", era: "gen-alpha", points: 2 },
    ],
  },
  // Gate 7: Fork Gate - Final boss
  {
    id: 7,
    type: "fork",
    prompt: "What is peak sigma male behavior?",
    seedImage: "https://i.imgflip.com/5c7lwq.png",
    options: [
      { id: "7a", text: "Mewing", era: "gen-alpha", points: 10 },
      { id: "7b", text: "Grinding in silence", era: "gen-z-core", points: 8 },
      { id: "7c", text: "Trolling the libs", era: "boomer", points: 3 },
      { id: "7d", text: "Planking", era: "millennial", points: 2 },
    ],
  },
];

// Era configuration with theming
export const eraConfig: Record<Era, { 
  name: string; 
  ageRange: string; 
  description: string;
  color: string;
  bgGradient: string;
}> = {
  boomer: {
    name: "Digital Dinosaur",
    ageRange: "45+",
    description: "You remember when the internet made dial-up noises",
    color: "#ff9f1c",
    bgGradient: "from-warning/30 via-warning/10 to-transparent",
  },
  millennial: {
    name: "Rage Comic Veteran",
    ageRange: "28-44",
    description: "You survived the trollface era and came out with PTSD",
    color: "#00f0ff",
    bgGradient: "from-electric/30 via-electric/10 to-transparent",
  },
  "older-gen-z": {
    name: "Vine Archaeologist",
    ageRange: "22-27",
    description: "RIP Vine, RIP Harambe, RIP your attention span",
    color: "#39ff14",
    bgGradient: "from-acid/30 via-acid/10 to-transparent",
  },
  "gen-z-core": {
    name: "Certified Zoomer",
    ageRange: "16-21",
    description: "Your brainrot is perfectly marinated",
    color: "#ff2bd6",
    bgGradient: "from-magenta/30 via-magenta/10 to-transparent",
  },
  "gen-alpha": {
    name: "Skibidi Overlord",
    ageRange: "10-15",
    description: "Ohio rizz gyatt fanum tax mewing bop",
    color: "#b9aee8",
    bgGradient: "from-lavender/30 via-lavender/10 to-transparent",
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
    "You still quote 'Friday' by Rebecca Black",
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
  boomer: ["Certified Fossil", "Internet Explorer User", "Facebook Archaeologist", "AOL Survivor"],
  millennial: ["Rage Comic Survivor", "Dial-Up Warrior", "Nyan Cat Whisperer", "Rickroll Victim"],
  "older-gen-z": ["Vine Compilation Curator", "Harambe Mourner", "Doge Prophet", "RIP Vine Enjoyer"],
  "gen-z-core": ["Brainrot Connoisseur", "Shitpost Scholar", "Sus Detective", "No Cap Analyst"],
  "gen-alpha": ["Skibidi Toilet PhD", "Rizz Overlord", "Ohio Final Boss", "Fanum Tax Collector"],
};

// Calculate final results based on answers
export function calculateResults(answers: { gateId: number; optionId: string; era: Era; points: number }[]): {
  scores: { rizz: number; aura: number; sigma: number; era: number };
  finalEra: Era;
  estimatedAge: number;
  title: string;
  roast: string;
} {
  // Count era occurrences and total points
  const eraCounts: Record<Era, number> = {
    boomer: 0,
    millennial: 0,
    "older-gen-z": 0,
    "gen-z-core": 0,
    "gen-alpha": 0,
  };

  const eraPoints: Record<Era, number> = {
    boomer: 0,
    millennial: 0,
    "older-gen-z": 0,
    "gen-z-core": 0,
    "gen-alpha": 0,
  };

  let totalPoints = 0;

  answers.forEach((answer) => {
    eraCounts[answer.era]++;
    eraPoints[answer.era] += answer.points;
    totalPoints += answer.points;
  });

  // Find dominant era by points
  let maxPoints = 0;
  let finalEra: Era = "gen-z-core";
  (Object.keys(eraPoints) as Era[]).forEach((era) => {
    if (eraPoints[era] > maxPoints) {
      maxPoints = eraPoints[era];
      finalEra = era;
    }
  });

  // Calculate scores (0-100) based on performance and era alignment
  const maxPossiblePoints = answers.length * 10;
  const performanceRatio = totalPoints / maxPossiblePoints;

  const rizz = Math.min(100, Math.round(
    (eraPoints["gen-alpha"] / (answers.length * 10)) * 80 + 
    performanceRatio * 20 + 
    Math.random() * 15
  ));

  const aura = Math.min(100, Math.round(
    performanceRatio * 70 + 
    Math.random() * 30
  ));

  const sigma = Math.min(100, Math.round(
    ((eraPoints["gen-z-core"] + eraPoints["gen-alpha"]) / (answers.length * 10)) * 70 + 
    Math.random() * 30
  ));

  const era = Math.min(100, Math.round(
    (maxPoints / (answers.length * 10)) * 80 + 
    Math.random() * 20
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
