// Game state management for BRAINROT MAZE

export type GameScreen = 
  | "landing" 
  | "seed-flash" 
  | "maze-hub" 
  | "fork-gate" 
  | "audio-door" 
  | "era-room" 
  | "vibe-report";

export type Era = "boomer" | "millennial" | "older-gen-z" | "gen-z-core" | "gen-alpha";

export interface MemeGate {
  id: number;
  type: "fork" | "audio";
  prompt: string;
  options: {
    id: string;
    text?: string;
    imageUrl?: string;
    isCorrect: boolean;
    era: Era;
  }[];
  audioUrl?: string;
  seedImage?: string;
}

export interface GameState {
  currentScreen: GameScreen;
  currentGateIndex: number;
  completedGates: number[];
  selectedAnswers: { gateId: number; optionId: string; era: Era }[];
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
  audioEnabled: false,
  replayUsed: false,
};

// Sample meme gates data
export const memeGates: MemeGate[] = [
  {
    id: 1,
    type: "fork",
    prompt: "What does this legendary creature say?",
    seedImage: "https://i.imgflip.com/30b1gx.jpg",
    options: [
      { id: "1a", text: "This is fine", isCorrect: true, era: "older-gen-z" },
      { id: "1b", text: "Not stonks", isCorrect: false, era: "gen-z-core" },
      { id: "1c", text: "Le epic fail", isCorrect: false, era: "millennial" },
      { id: "1d", text: "Skibidi fire", isCorrect: false, era: "gen-alpha" },
    ],
  },
  {
    id: 2,
    type: "fork",
    prompt: "Complete the phrase: Never gonna give you...",
    seedImage: "https://i.imgflip.com/2wifvo.jpg",
    options: [
      { id: "2a", text: "Up", isCorrect: true, era: "millennial" },
      { id: "2b", text: "Rizz", isCorrect: false, era: "gen-alpha" },
      { id: "2c", text: "The aux", isCorrect: false, era: "gen-z-core" },
      { id: "2d", text: "A moment of peace", isCorrect: false, era: "boomer" },
    ],
  },
  {
    id: 3,
    type: "fork",
    prompt: "What did Harambe deserve?",
    seedImage: "https://i.imgflip.com/1jgrgn.jpg",
    options: [
      { id: "3a", text: "Justice", isCorrect: true, era: "older-gen-z" },
      { id: "3b", text: "A fanum tax", isCorrect: false, era: "gen-alpha" },
      { id: "3c", text: "To be yeeted", isCorrect: false, era: "gen-z-core" },
      { id: "3d", text: "A banana", isCorrect: false, era: "millennial" },
    ],
  },
  {
    id: 4,
    type: "fork",
    prompt: "When something is extremely suspicious, it is...",
    seedImage: "https://i.imgflip.com/4acd7j.png",
    options: [
      { id: "4a", text: "Sus", isCorrect: true, era: "gen-z-core" },
      { id: "4b", text: "Sketch", isCorrect: false, era: "millennial" },
      { id: "4c", text: "Ohio behavior", isCorrect: false, era: "gen-alpha" },
      { id: "4d", text: "Not cool, man", isCorrect: false, era: "boomer" },
    ],
  },
  {
    id: 5,
    type: "fork",
    prompt: "This cat is asking for...",
    seedImage: "https://i.imgflip.com/2p3dw0.jpg",
    options: [
      { id: "5a", text: "Cheezburger", isCorrect: true, era: "millennial" },
      { id: "5b", text: "Gyatt", isCorrect: false, era: "gen-alpha" },
      { id: "5c", text: "Clout", isCorrect: false, era: "gen-z-core" },
      { id: "5d", text: "Attention", isCorrect: false, era: "older-gen-z" },
    ],
  },
  {
    id: 6,
    type: "fork",
    prompt: "What is the ultimate sigma male activity?",
    seedImage: "https://i.imgflip.com/5c7lwq.png",
    options: [
      { id: "6a", text: "Grinding in silence", isCorrect: false, era: "gen-z-core" },
      { id: "6b", text: "Mewing", isCorrect: true, era: "gen-alpha" },
      { id: "6c", text: "Planking", isCorrect: false, era: "millennial" },
      { id: "6d", text: "Reading the newspaper", isCorrect: false, era: "boomer" },
    ],
  },
  {
    id: 7,
    type: "fork",
    prompt: "What is the proper response to a W?",
    seedImage: "https://i.imgflip.com/1ihzfe.jpg",
    options: [
      { id: "7a", text: "Let him cook", isCorrect: true, era: "gen-z-core" },
      { id: "7b", text: "Epic win!", isCorrect: false, era: "millennial" },
      { id: "7c", text: "Skibidi toilet", isCorrect: false, era: "gen-alpha" },
      { id: "7d", text: "That's nice, dear", isCorrect: false, era: "boomer" },
    ],
  },
];

// Era configuration
export const eraConfig: Record<Era, { 
  name: string; 
  ageRange: string; 
  description: string;
  color: string;
}> = {
  boomer: {
    name: "Digital Dinosaur",
    ageRange: "50+",
    description: "You remember when the internet made dial-up noises",
    color: "#ff9f1c",
  },
  millennial: {
    name: "Rage Comic Veteran",
    ageRange: "30-45",
    description: "You survived the trollface era and came out with PTSD",
    color: "#00f0ff",
  },
  "older-gen-z": {
    name: "Vine Archaeologist",
    ageRange: "22-29",
    description: "RIP Vine, RIP Harambe, RIP your attention span",
    color: "#39ff14",
  },
  "gen-z-core": {
    name: "Certified Zoomer",
    ageRange: "16-22",
    description: "Your brainrot is perfectly marinated",
    color: "#ff2bd6",
  },
  "gen-alpha": {
    name: "Skibidi Overlord",
    ageRange: "10-15",
    description: "Ohio rizz gyatt fanum tax mewing bop",
    color: "#b9aee8",
  },
};

// Calculate final results
export function calculateResults(answers: { gateId: number; optionId: string; era: Era }[]): {
  scores: { rizz: number; aura: number; sigma: number; era: number };
  finalEra: Era;
  estimatedAge: number;
  title: string;
  roast: string;
} {
  const eraCounts: Record<Era, number> = {
    boomer: 0,
    millennial: 0,
    "older-gen-z": 0,
    "gen-z-core": 0,
    "gen-alpha": 0,
  };

  answers.forEach((answer) => {
    eraCounts[answer.era]++;
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

  // Calculate scores (0-100)
  const totalGates = answers.length;
  const correctAnswers = answers.filter((a) => {
    const gate = memeGates.find((g) => g.id === a.gateId);
    const option = gate?.options.find((o) => o.id === a.optionId);
    return option?.isCorrect;
  }).length;

  const rizz = Math.min(100, Math.round((eraCounts["gen-alpha"] / totalGates) * 100 + Math.random() * 30));
  const aura = Math.min(100, Math.round((correctAnswers / totalGates) * 100 + Math.random() * 20));
  const sigma = Math.min(100, Math.round((eraCounts["gen-z-core"] / totalGates) * 100 + Math.random() * 25));
  const era = Math.min(100, Math.round((maxCount / totalGates) * 100 + Math.random() * 15));

  // Calculate estimated age based on era
  const ageRanges: Record<Era, [number, number]> = {
    boomer: [50, 65],
    millennial: [30, 45],
    "older-gen-z": [22, 29],
    "gen-z-core": [16, 22],
    "gen-alpha": [10, 15],
  };
  const [minAge, maxAge] = ageRanges[finalEra];
  const estimatedAge = Math.round(minAge + Math.random() * (maxAge - minAge));

  // Generate title and roast
  const titles: Record<Era, string[]> = {
    boomer: ["Certified Fossil", "Internet Explorer User", "Facebook Archaeologist"],
    millennial: ["Rage Comic Survivor", "Dial-Up Warrior", "Nyan Cat Whisperer"],
    "older-gen-z": ["Vine Compilation Curator", "Harambe Mourner", "Doge Prophet"],
    "gen-z-core": ["Brainrot Connoisseur", "Shitpost Scholar", "Sus Detective"],
    "gen-alpha": ["Skibidi Toilet PhD", "Rizz Overlord", "Ohio Final Boss"],
  };

  const roasts: Record<Era, string[]> = {
    boomer: [
      "Your memes are still loading on Internet Explorer",
      "You probably still use a landline to send memes",
    ],
    millennial: [
      "Your humor peaked at rage comics and it shows",
      "You unironically miss Harambe AND know who he is",
    ],
    "older-gen-z": [
      "You cry watching Vine compilations at 3am",
      "Peak internet was 2016 and you know it",
    ],
    "gen-z-core": [
      "Your attention span is sponsored by TikTok",
      "You speak fluent ironic brainrot",
    ],
    "gen-alpha": [
      "Your brain is 90% Skibidi toilet lore",
      "You mew in your sleep",
    ],
  };

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
