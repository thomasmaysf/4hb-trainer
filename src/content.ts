import type { MealSlot, ObjectiveId, ProgramId } from './types'

export type VideoRef = {
  id: string
  title: string
  by: string
  url: string
  embedId?: string
}

export type Exercise = {
  id: string
  name: string
  short: string
  pattern: string
  cues: string[]
  tips: string[]
  videos: VideoRef[]
}

export type WorkoutTemplate = {
  id: string
  name: string
  kicker: string
  summary: string
  minutes: string
  exercises: {
    exerciseId: string
    role: string
    prescription: string
    optional?: boolean
    bodyweight?: boolean
    countLabel?: 'Reps' | 'Seconds'
  }[]
}

export type Program = {
  id: ProgramId
  name: string
  kind: 'diet' | 'training'
  for: string
  summary: string
  when: string
}

export const programs: Program[] = [
  {
    id: 'slow-carb',
    name: 'Slow-carb plate',
    kind: 'diet',
    for: 'Lose fat',
    summary: 'Six days of protein, legumes, and vegetables. One planned day off. White starches, fruit, and caloric drinks wait for that day.',
    when: 'Six days, plus the off day you pick in Settings',
  },
  {
    id: 'swings',
    name: 'Swing dose',
    kind: 'training',
    for: 'Lose fat',
    summary: 'Two-hand kettlebell swings. The starting target is 75 reps, broken into sets. Stop when the hinge stops looking the same.',
    when: 'Twice a week on fat-loss weeks',
  },
  {
    id: 'occam',
    name: "Occam's Protocol",
    kind: 'training',
    for: 'Build muscle',
    summary: 'The minimum muscle session: a pull, a press, and a squat. Warm up, then one work set. Five seconds up and five seconds down. Add a little weight when 8 reps stay clean.',
    when: 'Twice a week on muscle weeks',
  },
  {
    id: 'prehab',
    name: 'Prehab',
    kind: 'training',
    for: 'Stay durable',
    summary: 'Hips, trunk, and shoulders, about ten to fifteen minutes. It sits between the harder sessions so the minimum dose is not the thing that stops you.',
    when: 'Once a week beside other training, or three times alone',
  },
  {
    id: 'strength-b',
    name: 'Second strength day',
    kind: 'training',
    for: 'Build more muscle',
    summary: 'A pulldown, a bench, and a hinge, with the same slow work-set rule as Occam. This is the extra day for the longer muscle plan. The book’s higher-effort muscle chapter also discusses a supplement experiment; that list is not logged here.',
    when: 'Once a week, on the longer muscle plan',
  },
]

export const objectives: { id: Exclude<ObjectiveId, 'custom'>; label: string; detail: string; programs: ProgramId[] }[] = [
  {
    id: 'fat-loss',
    label: 'Lose fat',
    detail: 'Slow-carb plate, swings on Monday and Friday, prehab on Wednesday.',
    programs: ['slow-carb', 'swings', 'prehab'],
  },
  {
    id: 'muscle',
    label: 'Build muscle',
    detail: "Occam's Protocol on Tuesday and Saturday, prehab on Thursday. The plate stays off unless you add it.",
    programs: ['occam', 'prehab'],
  },
  {
    id: 'muscle-plus',
    label: 'Build more muscle',
    detail: "Occam on Tuesday, the second strength day on Friday, prehab on Monday. More than the minimum.",
    programs: ['occam', 'strength-b', 'prehab'],
  },
  {
    id: 'recomp',
    label: 'Recomposition',
    detail: 'Slow-carb plate, swings on Monday, prehab on Wednesday, Occam on Friday.',
    programs: ['slow-carb', 'swings', 'occam', 'prehab'],
  },
  {
    id: 'durable',
    label: 'Stay durable',
    detail: 'Prehab on Monday, Wednesday, and Friday. Add a training program when you want more.',
    programs: ['prehab'],
  },
]

export function programsFor(objective: ObjectiveId): ProgramId[] {
  return objectives.find((item) => item.id === objective)?.programs ?? ['slow-carb', 'swings', 'prehab']
}

export function matchObjective(active: ProgramId[]): ObjectiveId {
  const key = [...active].sort().join('|')
  const found = objectives.find((item) => [...item.programs].sort().join('|') === key)
  return found?.id ?? 'custom'
}

export function planSummary(objective: ObjectiveId, active: ProgramId[]) {
  const known = objectives.find((item) => item.id === objective)
  if (known) return known.detail
  const names = active.map((id) => programs.find((item) => item.id === id)?.name).filter(Boolean)
  return names.length ? `Custom plan: ${names.join(', ')}.` : 'No programs selected yet.'
}

export const rules: { title: string; body: string }[] = [
  {
    title: 'Skip the white starches',
    body: 'Bread, rice, potatoes, pasta, cereal, and breaded food stay off the plate on protocol days.',
  },
  {
    title: 'Repeat a short menu',
    body: 'A few meals you can cook half-asleep beat a new recipe every night.',
  },
  {
    title: 'Drink without calories',
    body: 'Water, sparkling water, black coffee, and plain tea. Caloric drinks wait for the off day.',
  },
  {
    title: 'Leave fruit for the off day',
    body: 'Vegetables cover the plate on protocol days.',
  },
  {
    title: 'One planned off day',
    body: 'Pick a weekday and eat freely. The other six days stay on the plate.',
  },
]

export const plate = {
  proteins: ['Eggs', 'Chicken thigh', 'Beef', 'Pork', 'Turkey', 'White fish', 'Salmon'],
  legumes: ['Black beans', 'Pinto beans', 'Lentils', 'Chickpeas', 'Kidney beans', 'White beans'],
  vegetables: ['Spinach', 'Broccoli', 'Cauliflower', 'Asparagus', 'Green beans', 'Zucchini', 'Peppers', 'Kale', 'Tomatoes', 'Avocado'],
}

export const mealSlots: { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'extra', label: 'Extra' },
]

export type MealPreset = {
  id: string
  name: string
  protein: string
  legume: string
  veg: string
  note: string
}

export const mealPresets: MealPreset[] = [
  {
    id: 'skillet-eggs',
    name: 'Skillet eggs',
    protein: 'Eggs',
    legume: 'Black beans',
    veg: 'Spinach',
    note: 'Scramble the eggs, then fold in warmed beans and a heap of spinach.',
  },
  {
    id: 'thigh-lentils',
    name: 'Thigh and lentils',
    protein: 'Chicken thigh',
    legume: 'Lentils',
    veg: 'Broccoli',
    note: 'Roast or pan-cook the thigh. Lentils and broccoli can be made ahead.',
  },
  {
    id: 'beef-pinto',
    name: 'Beef and pinto',
    protein: 'Beef',
    legume: 'Pinto beans',
    veg: 'Peppers and zucchini',
    note: 'Brown the beef, stir in beans, and cook the vegetables in the same pan.',
  },
  {
    id: 'salmon-beans',
    name: 'Salmon and beans',
    protein: 'Salmon',
    legume: 'White beans',
    veg: 'Asparagus',
    note: 'Canned salmon is fine. Warm the beans and roast the asparagus.',
  },
  {
    id: 'turkey-skillet',
    name: 'Turkey skillet',
    protein: 'Turkey',
    legume: 'Chickpeas',
    veg: 'Cauliflower and kale',
    note: 'A good fourth meal when lunch was early. Season it like the others so it stays automatic.',
  },
]

export const exercises: Exercise[] = [
  {
    id: 'swing',
    name: 'Two-hand kettlebell swing',
    short: 'Swing',
    pattern: 'Hip hinge',
    cues: [
      'Hinge, don’t squat. Keep the shins close to vertical.',
      'Hike the bell back between the thighs, then snap the hips through.',
      'Arms stay long. The hips move the bell.',
      'Stand tall at the top so the bell floats to about chest height.',
      'Stop the set if the low back rounds.',
    ],
    tips: [
      'Start with a bell you can swing cleanly for about 20 reps.',
      'Break the session into sets of 10–25. Rest about a minute, then continue.',
      'The starting target is 75 total swings. Change it in Settings once that feels easy.',
      'Chalk and a repeatable stance matter more than going heavier every week.',
    ],
    videos: [
      {
        id: 'sf-swing',
        title: 'Kettlebell Swing Basics',
        by: 'StrongFirst',
        url: 'https://www.youtube.com/watch?v=yHxcTn1UeAc',
        embedId: 'yHxcTn1UeAc',
      },
      {
        id: 'swing-demo',
        title: 'Kettlebell Swing Tim Ferriss',
        by: 'YouTube',
        url: 'https://www.youtube.com/watch?v=pbNCC-BMNKg',
        embedId: 'pbNCC-BMNKg',
      },
      {
        id: 'swing-article',
        title: 'Kettlebell swing article',
        by: 'tim.blog',
        url: 'https://tim.blog/2011/01/08/kettlebell-swing/',
      },
    ],
  },
  {
    id: 'getup',
    name: 'Turkish get-up',
    short: 'Get-up',
    pattern: 'Shoulder stability',
    cues: [
      'Keep your eyes on the bell.',
      'Wrist stacked, elbow locked, shoulder packed.',
      'Move in quiet steps: elbow, hand, sweep the leg, then lunge to stand.',
      'Come down along the same path.',
    ],
    tips: [
      'This is optional after swings. Skip it when the hinge session was already enough.',
      'Use a light bell until every step is smooth.',
      'Log each side as its own set.',
    ],
    videos: [
      {
        id: 'sf-getup',
        title: 'Turkish Get-Up Basics',
        by: 'StrongFirst',
        url: 'https://www.youtube.com/watch?v=0bWRPC49-KI',
        embedId: '0bWRPC49-KI',
      },
    ],
  },
  {
    id: 'row',
    name: 'Chest-supported row',
    short: 'Row',
    pattern: 'Horizontal pull',
    cues: [
      'Chest on a bench so the low back stays out of the lift.',
      'Pull the elbows toward the hips and squeeze the shoulder blades.',
      'Lower for a full five seconds.',
      'Don’t shrug the top of the rep.',
    ],
    tips: [
      'A one-arm dumbbell row is a fair stand-in if you don’t have an incline bench.',
      'Two easy sets of 5, then one hard set.',
      'When you hit the top of the rep range with clean form, add a little weight next time.',
    ],
    videos: [
      {
        id: 'mh-row',
        title: 'Chest-Supported Row',
        by: "Men's Health",
        url: 'https://www.youtube.com/watch?v=H75im9fAUMc',
        embedId: 'H75im9fAUMc',
      },
    ],
  },
  {
    id: 'press',
    name: 'Overhead press',
    short: 'Press',
    pattern: 'Vertical push',
    cues: [
      'Ribs down and glutes tight. Don’t lean back to finish the rep.',
      'Press in front of the ears, not behind the neck.',
      'Elbows stay under the hands, not flared straight out.',
      'Lower for five seconds under control.',
    ],
    tips: [
      'A seated dumbbell press counts. Log the weight in one hand and note “each” in the session note if you need to.',
      'Stop a rep before your back takes over.',
      'Warm up with two easy sets, then one work set.',
    ],
    videos: [
      {
        id: 'ohp-guide',
        title: 'Overhead press guide',
        by: 'StrongLifts',
        url: 'https://stronglifts.com/overhead-press/',
      },
      {
        id: 'ohp-search',
        title: 'Search overhead press demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=strict+overhead+press+form',
      },
    ],
  },
  {
    id: 'squat',
    name: 'Squat',
    short: 'Squat',
    pattern: 'Knee and hip bend',
    cues: [
      'Feet planted, knees tracking over the toes.',
      'Sit between the hips and keep the trunk braced.',
      'Use a depth you can own with a neutral back.',
      'A goblet squat counts. The slow lowering is the work.',
    ],
    tips: [
      'If a bar squat bothers your back, hold a kettlebell or dumbbell at your chest.',
      'Film one work set every couple of weeks and compare the depth.',
      'Add weight only when the top of the rep range is clean.',
    ],
    videos: [
      {
        id: 'thrall-squat',
        title: 'How To Squat',
        by: 'Alan Thrall',
        url: 'https://www.youtube.com/watch?v=bs_Ej32IYgo',
        embedId: 'bs_Ej32IYgo',
      },
    ],
  },
  {
    id: 'pulldown',
    name: 'Lat pulldown',
    short: 'Pulldown',
    pattern: 'Vertical pull',
    cues: [
      'Start with the shoulders down, not shrugged toward the ears.',
      'Pull the bar toward the upper chest and drive the elbows down.',
      'Return for five seconds until the arms are straight.',
      'An assisted pull-up is the same pattern if you have a bar.',
    ],
    tips: [
      'Use a weight you can pause at the bottom without swinging.',
      'If the grip fails first, use straps for the work set and note it.',
    ],
    videos: [
      {
        id: 'pulldown-search',
        title: 'Search lat pulldown demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=lat+pulldown+proper+form',
      },
    ],
  },
  {
    id: 'bench',
    name: 'Bench press',
    short: 'Bench',
    pattern: 'Horizontal push',
    cues: [
      'Elbows about 45 degrees from the ribs, not flared straight out.',
      'Pause on the chest without bouncing.',
      'Feet stay planted and the shoulders stay on the bench.',
      'A strict push-up counts. Log 0 if you are using bodyweight.',
    ],
    tips: [
      'Dumbbells are a good stand-in and are easier to set down if a rep fails.',
      'The work set is the one that counts. Keep the warm-ups easy.',
    ],
    videos: [
      {
        id: 'thrall-bench',
        title: 'How to Bench Press',
        by: 'Alan Thrall',
        url: 'https://www.youtube.com/watch?v=BYKScL2sgCs',
        embedId: 'BYKScL2sgCs',
      },
    ],
  },
  {
    id: 'rdl',
    name: 'Romanian deadlift',
    short: 'Hinge',
    pattern: 'Hip hinge',
    cues: [
      'Soft knees, push the hips back, and keep the weight against the legs.',
      'Stop when the hips can’t travel back further without the back rounding.',
      'Stand by driving the hips forward.',
      'A kettlebell deadlift is the same hinge if you don’t have a bar.',
    ],
    tips: [
      'This is a slow hinge, not a bounce off the floor.',
      'The linked demo is a conventional deadlift setup. Use the brace and the hip-back pattern, then stop at your hamstring limit.',
    ],
    videos: [
      {
        id: 'thrall-dl',
        title: 'How To Deadlift',
        by: 'Alan Thrall',
        url: 'https://www.youtube.com/watch?v=MBbyAqvTNkU',
        embedId: 'MBbyAqvTNkU',
      },
    ],
  },
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    short: 'Bridge',
    pattern: 'Hips',
    cues: [
      'Lie on your back, feet flat, knees bent.',
      'Drive through the heels and squeeze the glutes at the top.',
      'Ribs stay down. Don’t arch the low back to get higher.',
      'Pause for a second, then lower.',
    ],
    tips: [
      'Two sets of 8–12 is enough.',
      'If the hamstrings cramp, bring the heels a little closer to you.',
    ],
    videos: [
      {
        id: 'bridge-search',
        title: 'Search glute bridge demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=glute+bridge+form',
      },
    ],
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    short: 'Dead bug',
    pattern: 'Trunk',
    cues: [
      'Low back stays gently pressed into the floor.',
      'Reach the opposite arm and leg away without the ribs popping up.',
      'Move slowly enough that the back doesn’t peel off.',
      'Exhale as the limbs go out.',
    ],
    tips: ['Log one side, then the other.', 'Shorten the reach if the back lifts.'],
    videos: [
      {
        id: 'deadbug-search',
        title: 'Search dead bug demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=dead+bug+exercise+form',
      },
    ],
  },
  {
    id: 'pull-apart',
    name: 'Band pull-apart',
    short: 'Pull-apart',
    pattern: 'Shoulders',
    cues: [
      'Hold a light band with straight arms in front of the chest.',
      'Pull the band apart until the hands are in line with the shoulders.',
      'Don’t shrug. Let the shoulder blades move.',
      'Return slowly.',
    ],
    tips: ['No band: lie face down and lift the arms into a Y for the same idea.', 'Keep the band light enough for 12–15 clean reps.'],
    videos: [
      {
        id: 'pullapart-search',
        title: 'Search band pull-apart demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=band+pull+apart+form',
      },
    ],
  },
  {
    id: 'hip-flexor',
    name: 'Half-kneeling hip flexor stretch',
    short: 'Hip flexor',
    pattern: 'Hips',
    cues: [
      'One knee on the floor, the other foot forward.',
      'Tuck the pelvis under instead of leaning the ribs forward.',
      'You should feel the front of the hip on the down knee.',
      'Hold and breathe. Switch sides.',
    ],
    tips: ['Log seconds per side.', 'A cushion under the knee is fine.'],
    videos: [
      {
        id: 'hipflexor-search',
        title: 'Search half-kneeling hip flexor demos',
        by: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=half+kneeling+hip+flexor+stretch',
      },
    ],
  },
]

export const templates: WorkoutTemplate[] = [
  {
    id: 'swings',
    name: 'Kettlebell swings',
    kicker: 'Conditioning',
    summary: 'A short hinge session. Hit the rep target, rest as you need, and stop when the reps stop looking the same.',
    minutes: '15–25 min',
    exercises: [
      {
        exerciseId: 'swing',
        role: 'Main dose',
        prescription: '75 total swings to start. Sets of 10–25, about a minute between sets, until the total is met.',
      },
      {
        exerciseId: 'getup',
        role: 'Optional',
        optional: true,
        prescription: '1–3 slow reps each side. Log each side as its own set. Skip this if the swings already did the job.',
      },
    ],
  },
  {
    id: 'occam',
    name: "Occam's Protocol",
    kicker: 'Muscle',
    summary: 'Pull, press, and squat. Easy warm-ups, then one work set at five seconds up and five seconds down.',
    minutes: '20–35 min',
    exercises: [
      {
        exerciseId: 'row',
        role: 'Pull',
        prescription: 'Chest-supported row, or a supinated bent-over row. Two easy sets of 5, then one work set of 6–8. Five seconds up, five seconds down.',
      },
      {
        exerciseId: 'press',
        role: 'Press',
        prescription: 'Two easy sets of 5, then one work set of 6–8. Five seconds up, five seconds down. Stop before the back takes over.',
      },
      {
        exerciseId: 'squat',
        role: 'Squat',
        prescription: 'Squat or goblet squat. Two easy sets of 5, then one work set of 6–8. Five seconds up, five seconds down.',
      },
    ],
  },
  {
    id: 'prehab',
    name: 'Prehab',
    kicker: 'Durability',
    summary: 'A short pass for hips, trunk, and shoulders. Log each side on its own when a move has two sides.',
    minutes: '10–15 min',
    exercises: [
      {
        exerciseId: 'glute-bridge',
        role: 'Hips',
        bodyweight: true,
        prescription: 'Two sets of 8–12. Pause at the top.',
      },
      {
        exerciseId: 'dead-bug',
        role: 'Trunk',
        bodyweight: true,
        prescription: '6 slow reaches each side. Log each side as its own set.',
      },
      {
        exerciseId: 'pull-apart',
        role: 'Shoulders',
        bodyweight: true,
        prescription: 'Two sets of 12–15. Light resistance.',
      },
      {
        exerciseId: 'hip-flexor',
        role: 'Hips',
        bodyweight: true,
        countLabel: 'Seconds',
        prescription: '45–60 seconds each side. Log each side as its own set.',
      },
    ],
  },
  {
    id: 'strength-b',
    name: 'Second strength day',
    kicker: 'More muscle',
    summary: 'The extra pull, push, and hinge. Same rule as Occam: warm up, then one slow work set.',
    minutes: '20–35 min',
    exercises: [
      {
        exerciseId: 'pulldown',
        role: 'Pull',
        prescription: 'Two easy sets of 5, then one work set of 6–8 reps. Five seconds up, five seconds down.',
      },
      {
        exerciseId: 'bench',
        role: 'Push',
        prescription: 'Two easy sets of 5, then one work set of 6–8 reps. Five seconds up, five seconds down.',
      },
      {
        exerciseId: 'rdl',
        role: 'Hinge',
        prescription: 'Two easy sets of 5, then one work set of 6–8 reps. Five seconds up, five seconds down.',
      },
    ],
  },
]

export function canonicalTemplateId(id: string) {
  return id === 'strength-a' ? 'occam' : id
}

export function getExercise(id: string) {
  return exercises.find((exercise) => exercise.id === id)
}

export function getTemplate(id: string) {
  const canonical = canonicalTemplateId(id)
  return templates.find((template) => template.id === canonical)
}

export function presetLabel(preset: MealPreset) {
  return `${preset.name} · ${preset.protein}, ${preset.legume}, ${preset.veg}`
}
