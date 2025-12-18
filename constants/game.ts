export const FRUITS = [
  {
    name: "cherry",
    color: "#FF0000",
    radius: 10,
    score: 2,
    label: "🍒",
    weight: 40,
    spriteScale: 1.7,
    sprite: require("../assets/images/cherry.png"),
  },
  {
    name: "blueberry",
    color: "#4B0082",
    radius: 22,
    score: 4,
    label: "🫐",
    weight: 25,
    sprite: require("../assets/images/blueberry.png"),
  },
  {
    name: "strawberry",
    color: "#FF6347",
    radius: 26,
    score: 5,
    label: "🍓",
    weight: 20,
    spriteScale: 1.3,
    sprite: require("../assets/images/strawberry.png"),
  },
  {
    name: "lemon",
    color: "#FFFF00",
    radius: 30,
    score: 6,
    label: "🍋",
    weight: 15,
    sprite: require("../assets/images/lemon.png"),
  },
  {
    name: "mango",
    color: "#FFD700",
    radius: 38,
    score: 8,
    label: "🥭",
    weight: 8,
    spriteScale: 1.15,
    sprite: require("../assets/images/mango.png"),
  },
  {
    name: "orange",
    color: "#FFA500",
    radius: 46,
    score: 10,
    label: "🍊",
    weight: 6,
    sprite: require("../assets/images/orange.png"),
  },
  {
    name: "peach",
    color: "#FFC0CB",
    radius: 56,
    score: 12,
    label: "🍑",
    weight: 3,
    sprite: require("../assets/images/peach.png"),
  },
  {
    name: "pineapple",
    color: "#FFFFE0",
    radius: 92,
    score: 16,
    label: "🍍",
    weight: 1,
    sprite: require("../assets/images/pineapple.png"),
  },
  {
    name: "watermelon",
    color: "#008000",
    radius: 120,
    score: 20,
    label: "🍉",
    weight: 1,
    sprite: require("../assets/images/watermelon.png"),
  },
];

// Pick a random index between 0 and maxIndex (inclusive) using weights
export function pickWeightedIndex(maxIndex = FRUITS.length - 1) {
  const slice = FRUITS.slice(0, maxIndex + 1);
  const weights = slice.map((f) => f.weight ?? 1);
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

export const GAME_WIDTH = 350;
export const GAME_HEIGHT = 600;
export const FLOOR_HEIGHT = 200;
export const DEADLINE_Y = 150; // Game over line
