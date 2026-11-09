export const ANIMALS = ["cat", "rabbit", "frog", "fox"] as const;
export const COLORS = ["pink", "blue", "gold"] as const;
export const NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export type Animal = (typeof ANIMALS)[number];
export type CardColor = (typeof COLORS)[number];

export interface CharacterCard {
  id: string;
  animal: Animal;
  color: CardColor;
  number: (typeof NUMBERS)[number];
  artKey: string;
}

export interface RuleCard {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  conditionType: string;
  conditionValue: Record<string, unknown>;
}

export const CHARACTER_CARDS: CharacterCard[] = ANIMALS.flatMap((animal) =>
  COLORS.flatMap((color) =>
    NUMBERS.map((number) => ({
      id: `${animal.toUpperCase()}_${color.toUpperCase()}_${String(number).padStart(2, "0")}`,
      animal,
      color,
      number,
      artKey: `${animal}_${color}`,
    })),
  ),
);

export const RULE_CARDS: RuleCard[] = [
  {
    id: "R001",
    title: "สีชมพู",
    description: "การ์ดต้องเป็นสีชมพู",
    difficulty: 1,
    conditionType: "card_color_is",
    conditionValue: { color: "pink" },
  },
  {
    id: "R002",
    title: "สีฟ้าหรือสีทอง",
    description: "การ์ดต้องเป็นสีฟ้าหรือสีทอง",
    difficulty: 1,
    conditionType: "card_color_in",
    conditionValue: { colors: ["blue", "gold"] },
  },
  {
    id: "R003",
    title: "เลขคี่",
    description: "การ์ดต้องมีหมายเลขเป็นเลขคี่",
    difficulty: 1,
    conditionType: "card_number_is_odd",
    conditionValue: {},
  },
  {
    id: "R004",
    title: "ห้ามเลขซ้ำ",
    description: "หมายเลขต้องไม่ซ้ำกับการ์ดก่อนหน้า",
    difficulty: 2,
    conditionType: "number_differs_from_previous",
    conditionValue: {},
  },
  {
    id: "R005",
    title: "แมวหรือกระต่าย",
    description: "การ์ดต้องเป็นแมวหรือกระต่าย",
    difficulty: 1,
    conditionType: "card_animal_in",
    conditionValue: { animals: ["cat", "rabbit"] },
  },
];

if (CHARACTER_CARDS.length !== 72 || RULE_CARDS.length !== 5) {
  throw new Error("Game catalog has an unexpected number of cards.");
}
