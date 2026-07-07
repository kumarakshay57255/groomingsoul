/**
 * Psychometric test definitions.
 * Question banks are verbatim from the client's specification doc.
 *
 * Per the spec:
 * - Do NOT show trait headers, bracketed category names, or section dividers
 *   to the user on the frontend.
 * - Raw selections (numeric for Likert, letter for MCQ, text for free response)
 *   must be saved to the backend for internal scoring.
 */

export type LikertScale = {
  kind: "likert";
  min: number;
  max: number;
  labels: { value: number; short: string; long?: string }[];
};

export type MCQOption = { value: "A" | "B" | "C" | "D"; text: string };

export type Question =
  | { id: string; text: string }
  | { id: string; text: string; options: MCQOption[] };

export type TestKind = "likert" | "mcq" | "text";

export type Test = {
  slug: string;
  name: string;
  shortName: string;
  blurb: string;
  intro: string;
  kind: TestKind;
  scale?: LikertScale;
  textPlaceholder?: string;
  /** Estimated time in minutes */
  estMinutes: number;
  questions: Question[];
  /** Tone preset used in the UI */
  tone: "clinical" | "sage" | "coral" | "sun";
};

/* ------------------------------------------------------------------ */
/* TEST 1 — OCEAN / Big Five Inventory (BFI-44)                        */
/* ------------------------------------------------------------------ */

const bfi44Scale: LikertScale = {
  kind: "likert",
  min: 1,
  max: 5,
  labels: [
    { value: 1, short: "Disagree Strongly" },
    { value: 2, short: "Disagree a Little" },
    { value: 3, short: "Neutral" },
    { value: 4, short: "Agree a Little" },
    { value: 5, short: "Agree Strongly" },
  ],
};

const bfi44Items = [
  "I am someone who is talkative, outgoing, and socially expressive.",
  "I tend to find fault with others easily or notice flaws in them.",
  "I do a thorough job, staying careful and precise in my work.",
  "I am depressed, blue, or feel down frequently.",
  "I am original, deep, and always come up with new, creative ideas.",
  "I am naturally reserved, quiet, and keep to myself.",
  "I am helpful, unselfish, and always considerate toward others.",
  "I can be somewhat careless, disorganized, or casual with rules.",
  "I am relaxed, handle stress well, and rarely get tense.",
  "I am curious about many different things and love exploring.",
  "I am full of energy, dynamism, and stamina.",
  "I start quarrels, arguments, or confront others easily.",
  "I am a reliable, dutiful, and trustworthy worker.",
  "I can be tense, moody, or easily agitated under pressure.",
  "I am ingenious, analytical, and a deep thinker.",
  "I generate a lot of enthusiasm and positive vibes around me.",
  "I have a forgiving nature and don't hold grudges.",
  "I tend to be disorganized, messy, or leave things scattered.",
  "I worry a lot about small things or circumstances beyond my control.",
  "I have a vivid, highly active imagination.",
  "I tend to be quiet, soft-spoken, and rarely take charge in public.",
  "I am generally trusting of people and assume good intentions.",
  "I tend to be lazy or lose motivation quickly mid-task.",
  "I am emotionally stable, balanced, and not easily upset.",
  "I am inventive, resourceful, and enjoy problem-solving.",
  "I have an assertive personality and can lead groups easily.",
  "I can be cold, distant, or aloof toward unfamiliar people.",
  "I persevere, stay determined, and push until the task is finished.",
  "I can be moody, temperamental, or change feelings quickly.",
  "I value artistic, creative, and literary experiences deeply.",
  "I am sometimes shy, introverted, or socially inhibited.",
  "I am considerate, kind, and polite to almost everyone.",
  "I do things efficiently, quickly, and with good planning.",
  "I remain calm and steady even in high-stress situations.",
  "I prefer work that is routine, predictable, and familiar.",
  "I am outgoing, sociable, and make friends effortlessly.",
  "I am sometimes rude, blunt, or brutally honest with others.",
  "I make solid plans, follow through, and stick to my schedules.",
  "I get nervous, anxious, or easily overwhelmed.",
  "I like to reflect, overthink, and play with abstract ideas.",
  "I have few artistic or creative interests and prefer practical facts.",
  "I like to cooperate, collaborate, and maintain peace in a team.",
  "I am easily distracted, lose focus, or daydream often.",
  "I am sophisticated, cultured, and appreciate fine art or music.",
];

/* ------------------------------------------------------------------ */
/* TEST 2 — Cognitive Aptitude & Analytical Logic (20-item)            */
/* ------------------------------------------------------------------ */

const cognitive20Questions: { text: string; options: MCQOption[] }[] = [
  {
    text: "Which number should come next in the following series?\n2, 3, 5, 8, 13, 21, …",
    options: [
      { value: "A", text: "29" },
      { value: "B", text: "34" },
      { value: "C", text: "32" },
      { value: "D", text: "44" },
    ],
  },
  {
    text: "Book is to Reading as Fork is to:",
    options: [
      { value: "A", text: "Drawing" },
      { value: "B", text: "Writing" },
      { value: "C", text: "Eating" },
      { value: "D", text: "Stirring" },
    ],
  },
  {
    text: "Which word does NOT belong with the others in this group?",
    options: [
      { value: "A", text: "Leopard" },
      { value: "B", text: "Cougar" },
      { value: "C", text: "Cheetah" },
      { value: "D", text: "Wolf" },
    ],
  },
  {
    text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: [
      { value: "A", text: "$0.10" },
      { value: "B", text: "$0.05" },
      { value: "C", text: "$0.15" },
      { value: "D", text: "$0.01" },
    ],
  },
  {
    text: "If the word 'REASON' is coded numerically as 5, and 'BELIEVED' is coded as 7, what is the correct code for 'GOVERNMENT'?",
    options: [
      { value: "A", text: "6" },
      { value: "B", text: "8" },
      { value: "C", text: "9" },
      { value: "D", text: "10" },
    ],
  },
  {
    text: "Look at this series: 7, 10, 8, 11, 9, 12, … What number should come next?",
    options: [
      { value: "A", text: "7" },
      { value: "B", text: "10" },
      { value: "C", text: "12" },
      { value: "D", text: "13" },
    ],
  },
  {
    text: "If all Bloops are Razzies and all Razzies are Jazzies, then which of the following statements is definitely true?",
    options: [
      { value: "A", text: "All Jazzies are Bloops" },
      { value: "B", text: "All Bloops are Jazzies" },
      { value: "C", text: "Some Razzies are not Bloops" },
      { value: "D", text: "None of the Bloops are Jazzies" },
    ],
  },
  {
    text: "Statements: All focus is dedication. No dedication is lazy.\nConclusion: Which of the following must be true?",
    options: [
      { value: "A", text: "Some focus is lazy" },
      { value: "B", text: "No focus is lazy" },
      { value: "C", text: "All lazy people lack focus" },
      { value: "D", text: "Dedicated people are never tired" },
    ],
  },
  {
    text: "A clock shows the time as 3:15. If the minute hand points exactly East, in which direction does the hour hand point?",
    options: [
      { value: "A", text: "North" },
      { value: "B", text: "South-West" },
      { value: "C", text: "North-East" },
      { value: "D", text: "South" },
    ],
  },
  {
    text: "Find the missing letters to complete the sequence: AZ, CX, EV, GT, …",
    options: [
      { value: "A", text: "IR" },
      { value: "B", text: "HS" },
      { value: "C", text: "KP" },
      { value: "D", text: "LO" },
    ],
  },
  {
    text: "Choose the word that is most opposite in meaning to the word 'MANDATORY':",
    options: [
      { value: "A", text: "Compulsory" },
      { value: "B", text: "Optional" },
      { value: "C", text: "Essential" },
      { value: "D", text: "Urgent" },
    ],
  },
  {
    text: "An analyst needs to choose a committee of 3 from 5 available professionals (A, B, C, D, E). If professional 'A' must always be included, how many unique team combinations can be formed?",
    options: [
      { value: "A", text: "4" },
      { value: "B", text: "6" },
      { value: "C", text: "10" },
      { value: "D", text: "12" },
    ],
  },
  {
    text: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: [
      { value: "A", text: "100 minutes" },
      { value: "B", text: "50 minutes" },
      { value: "C", text: "5 minutes" },
      { value: "D", text: "20 minutes" },
    ],
  },
  {
    text: "Mary, who is sixteen years old, is four times as old as her brother. How old will Mary be when she is twice as old as her brother?",
    options: [
      { value: "A", text: "20 years old" },
      { value: "B", text: "24 years old" },
      { value: "C", text: "28 years old" },
      { value: "D", text: "32 years old" },
    ],
  },
  {
    text: "A piece of paper is folded in half exactly twice, and then a single hole is punched through the absolute center of the folded paper. How many holes will be visible when the paper is fully opened?",
    options: [
      { value: "A", text: "1" },
      { value: "B", text: "2" },
      { value: "C", text: "4" },
      { value: "D", text: "8" },
    ],
  },
  {
    text: "Five people (P, Q, R, S, T) are sitting in a straight row facing North. S is sitting exactly in the middle. P is to the immediate left of S. If T is at one of the extreme ends, who is sitting to the immediate right of S?",
    options: [
      { value: "A", text: "Q" },
      { value: "B", text: "R" },
      { value: "C", text: "Either Q or R" },
      { value: "D", text: "Cannot be determined" },
    ],
  },
  {
    text: "Which word does NOT belong with the others in this group?",
    options: [
      { value: "A", text: "Geometry" },
      { value: "B", text: "Algebra" },
      { value: "C", text: "Calculus" },
      { value: "D", text: "Thermodynamics" },
    ],
  },
  {
    text: "If it rains, the ground gets wet. The ground is wet. Therefore, it rained.",
    options: [
      { value: "A", text: "This argument is logically valid." },
      { value: "B", text: "This argument is a logical fallacy (invalid)." },
      { value: "C", text: "Insufficient information to determine validity." },
      { value: "D", text: "—" },
    ],
  },
  {
    text: "Three years ago, the total sum of age of a mother and her daughter was 40 years. If the mother is currently three times as old as the daughter, what is the daughter's current age?",
    options: [
      { value: "A", text: "10 years old" },
      { value: "B", text: "11.5 years old" },
      { value: "C", text: "12 years old" },
      { value: "D", text: "13 years old" },
    ],
  },
  {
    text: "Architect is to Building as Sculptor is to:",
    options: [
      { value: "A", text: "Chisel" },
      { value: "B", text: "Stone" },
      { value: "C", text: "Statue" },
      { value: "D", text: "Museum" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* TEST 3 — Sentence Completion (40-item, open-ended)                  */
/* ------------------------------------------------------------------ */

const sentence40Items = [
  "I feel most vulnerable when…",
  "My greatest fear about the future is…",
  "When people criticize me, I usually…",
  "The thing that blocks my peace of mind is…",
  "Whenever I look closely at myself in a mirror…",
  "I often feel guilty or regretful about…",
  "When luck turns against me, I…",
  "My most counterproductive or negative habit is…",
  "Deep down inside, I constantly struggle with…",
  "I am most proud of my ability to…",
  "I wish my parents would have…",
  "Back when I was a child, I used to…",
  "The expectations my family holds for me make me feel…",
  "My mother and I always…",
  "If I could rewrite one chapter of my childhood history…",
  "My father's approach toward me was…",
  "In my family environment, I am viewed as…",
  "Most of my childhood conflicts stemmed from…",
  "The way my family handles emotional distress is…",
  "To me, the concept of home feels like…",
  "To me, a perfect relationship means…",
  "I find it extremely difficult to trust people who…",
  "I tend to lose my temper or control when someone…",
  "I often feel that my friends or peers…",
  "When someone rejects me or leaves me out, I…",
  "Most people don't know that I secretly…",
  "When I find myself completely alone in a quiet room…",
  "Society expects individuals like me to…",
  "I find myself pulling away from people when…",
  "The quickest way someone can disappoint me is…",
  "The most critical goal I want to achieve this year is…",
  "Making a major, life-altering decision always makes me…",
  "When I face an authoritative figure or supervisor…",
  "I feel completely driven and motivated when…",
  "The major block standing between me and my career success is…",
  "Deep down inside, I know that I am highly capable of…",
  "When my hard work goes unrecognized or unrewarded…",
  "I view failure not just as a setback, but as…",
  "If I look at where my career path is going right now…",
  "My definition of a truly fulfilled and successful life is…",
];

/* ------------------------------------------------------------------ */
/* TEST 4 — Perceived Stress Scale (PSS-14)                             */
/* ------------------------------------------------------------------ */

const pss14Scale: LikertScale = {
  kind: "likert",
  min: 0,
  max: 4,
  labels: [
    { value: 0, short: "Never" },
    { value: 1, short: "Almost Never" },
    { value: 2, short: "Sometimes" },
    { value: 3, short: "Fairly Often" },
    { value: 4, short: "Very Often" },
  ],
};

const pss14Items = [
  "In the past month, how often have you been upset because of something that happened unexpectedly?",
  "In the past month, how often have you felt that you were unable to control the important things in your life?",
  "In the past month, how often have you felt nervous, anxious, or highly stressed?",
  "In the past month, how often have you dealt successfully with irritating day-to-day hassles?",
  "In the past month, how often have you felt that you were effectively coping with important changes occurring in your life?",
  "In the past month, how often have you felt confident about your ability to handle your personal problems?",
  "In the past month, how often have you felt that things were going exactly your way?",
  "In the past month, how often have you found that you could not cope with all the professional or academic things you had to do?",
  "In the past month, how often have you been able to control irritations or sudden disruptions in your life?",
  "In the past month, how often have you felt that you were completely on top of things?",
  "In the past month, how often have you been angered or intensely frustrated because of things that happened that were outside of your control?",
  "In the past month, how often have you caught yourself thinking about things or tasks that you still have to accomplish?",
  "In the past month, how often have you been able to successfully manage the way you distribute and spend your time?",
  "In the past month, how often have you felt difficulties were piling up so high that you could not possibly overcome them?",
];

/* ------------------------------------------------------------------ */
/* TEST 5 — Emotional Intelligence (WLEIS, 16-item)                     */
/* ------------------------------------------------------------------ */

const wleisScale: LikertScale = {
  kind: "likert",
  min: 1,
  max: 5,
  labels: [
    { value: 1, short: "Strongly Disagree" },
    { value: 2, short: "Disagree" },
    { value: 3, short: "Neutral" },
    { value: 4, short: "Agree" },
    { value: 5, short: "Strongly Agree" },
  ],
};

const wleis16Items = [
  "I have a good, clear understanding of my own emotions and why I feel the way I do.",
  "I always know exactly whether I am feeling happy, anxious, or dropped in spirits without any inner confusion.",
  "I can easily determine and analyze the hidden emotional motives behind my actions and decisions.",
  "I am fully aware of how my emotional expressions impact the people I work or talk with.",
  "I am highly sensitive to the feelings, moods, and subtle emotional changes of the people around me.",
  "I am a fine observer of others and can easily read their inner feelings even if they try to hide them.",
  "I find it easy to put myself in other people's shoes and share or predict their emotional concerns.",
  "My friends and peers always seek me out when they need emotional comfort or interpersonal advice.",
  "I always set high standards for myself and consistently encourage myself to do my absolute best.",
  "I am highly self-motivated and don't require external pressure or praise to pursue my goals.",
  "Even when things look dark or full of failures, I can push myself to maintain a constructive, positive attitude.",
  "I always tell myself that I am a capable person and look for active solutions rather than complaining.",
  "I am capable of controlling my deep anger, panic, or frustration completely and resolving issues rationally.",
  "I rarely let sudden negative emotions or external arguments get the better of my everyday behavior.",
  "When I am faced with intense psychological pressure, I can calm down my mind and handle it within minutes.",
  "I can effectively suppress immediate, impulsive urges to safeguard my long-term career stability and plans.",
];

/* ------------------------------------------------------------------ */
/* Test registry                                                        */
/* ------------------------------------------------------------------ */

const indexed = <T extends { text?: string; options?: MCQOption[] }>(
  arr: T[] | string[]
): Question[] =>
  (arr as (T | string)[]).map((it, i) => {
    if (typeof it === "string") return { id: `q${i + 1}`, text: it };
    const item = it as T;
    return { id: `q${i + 1}`, text: item.text!, options: item.options! };
  });

export const tests: Test[] = [
  {
    slug: "ocean-big-five",
    name: "The OCEAN Personality Inventory",
    shortName: "Big Five (BFI-44)",
    blurb:
      "Discover how you score across five core dimensions of personality through 44 reflective statements.",
    intro:
      "Rate each statement based on how accurately it describes you in general — there are no right or wrong answers.",
    kind: "likert",
    scale: bfi44Scale,
    estMinutes: 10,
    questions: indexed(bfi44Items),
    tone: "clinical",
  },
  {
    slug: "cognitive-aptitude",
    name: "Cognitive Aptitude & Analytical Logic",
    shortName: "Aptitude (20-item)",
    blurb:
      "A 20-question scientific screening of reasoning, pattern recognition, and verbal logic.",
    intro:
      "Only one option is correct per question. Take your time — there is no penalty for thinking slowly.",
    kind: "mcq",
    estMinutes: 18,
    questions: indexed(cognitive20Questions),
    tone: "sage",
  },
  {
    slug: "sentence-completion",
    name: "Sentence Completion Inventory",
    shortName: "Sentence Completion (40-item)",
    blurb:
      "Forty open-ended stems exploring self-concept, family, relationships, and ambitions.",
    intro:
      "Type the very first thought that enters your mind for each stem. Honest, unfiltered responses are most useful.",
    kind: "text",
    textPlaceholder: "Type the very first thought that enters your mind…",
    estMinutes: 25,
    questions: indexed(sentence40Items),
    tone: "coral",
  },
  {
    slug: "perceived-stress",
    name: "Perceived Stress & Burnout Index",
    shortName: "PSS-14",
    blurb:
      "A 14-item scale assessing how unpredictable, uncontrollable, and overloaded your life has felt in the past month.",
    intro:
      "These questions ask about your feelings and thoughts during the last month. Mark how often you felt or thought a certain way.",
    kind: "likert",
    scale: pss14Scale,
    estMinutes: 6,
    questions: indexed(pss14Items),
    tone: "sun",
  },
  {
    slug: "emotional-intelligence",
    name: "Emotional Intelligence Scale",
    shortName: "WLEIS-16",
    blurb:
      "16 statements measuring how you understand, regulate, and apply emotion across daily life.",
    intro:
      "Rate the following statements based on how accurately they reflect your personal abilities, everyday habits, and how you manage your interactions and inner feelings.",
    kind: "likert",
    scale: wleisScale,
    estMinutes: 7,
    questions: indexed(wleis16Items),
    tone: "clinical",
  },
];

export function getTest(slug: string): Test | undefined {
  return tests.find((t) => t.slug === slug);
}
