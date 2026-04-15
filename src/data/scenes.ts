export interface SceneAction {
  label: string;
  text: string;
  nextScene?: string;
  vitality?: number;
  focus?: number;
  xp?: number;
  items?: string[];
  lantern?: number;
  danger?: boolean;
  dangerThreshold?: number;
  isEndScene?: boolean;
  focusRequired?: number; // minimum focus needed, or action becomes risky
}

export interface Scene {
  id: string;
  title: string;
  location: string;
  description: string;
  atmosphere: string;
  actions: SceneAction[];
  isEndScene?: boolean;
  lanternCostPerAction?: number; // fixed lantern drain per action in this scene
  lootPool?: { common: string[]; uncommon: string[]; rare: string[]; mythic: string[] };
}

const SCENES: { [key: string]: Scene } = {
  'ashfall-archive': {
    id: 'ashfall-archive',
    title: 'The Ashfall Archive',
    location: 'Bunker Level Zero, Dubbo',
    description:
      'A vast underground chamber carved into rust-red stone. Ancient brass fixtures line the obsidian-glass walls, still faintly glowing with a light no one has replenished in centuries. Dust hangs in the air like ash — hence the name. Old maps hang from chains. A central terminal hums with a faint cyan pulse.',
    atmosphere:
      'This is your home. A sanctuary. A place of waiting. The gate pulses softly in the floor beneath the maps, and you feel its pull.',
    lanternCostPerAction: 0,
    actions: [
      {
        label: 'Study the Maps',
        text: 'You trace ancient routes with your fingers. The Threshold Gate glows brighter. You feel its beckoning.',
        xp: 5,
      },
      {
        label: 'Rest at the Hearth',
        text: 'You settle near the warm glow of the archive\'s central light. Strength returns to your limbs.',
        vitality: 15,
        xp: 3,
      },
      {
        label: 'Ready for Expedition',
        text: 'You gather your Locator and Lantern. The archive dims behind you as you approach the Threshold Gate. Your heart quickens.',
        xp: 10,
        nextScene: 'threshold-gate',
      },
      {
        label: 'Check Inventory',
        text: 'You review the relics you have found in past expeditions. Each holds a story.',
        xp: 0,
      },
    ],
  },

  'threshold-gate': {
    id: 'threshold-gate',
    title: 'The Threshold Gate',
    location: 'Vault Chamber, Archive Sublevel',
    description:
      'A towering oval structure of obsidian and brass, ancient beyond measure. Its surface is covered in glyphs that pulse with amber light. The air smells of iron and red dust. A low hum vibrates through your bones. This is the gateway between worlds.',
    atmosphere:
      'You have stood here many times, but the dread never fades. The gate is opening. Something is calling from the other side. You can feel the Veil thinning.',
    lanternCostPerAction: 2,
    actions: [
      {
        label: 'Listen at the Gate',
        text: 'You press your ear to the obsidian. Whispers. Ancient voices. Names in tongues you do not know. One whisper is clearer: "Return what was taken."',
        xp: 15,
      },
      {
        label: 'Study the Glyphs',
        text: 'Your fingers trace the symbols. They are warm, alive. You recognize a few: Gate, Veil, Name, Return, Danger. Your focus sharpens.',
        xp: 20,
        items: ['gate-coin'],
      },
      {
        label: 'Cross the Threshold',
        text: 'The gate flares. The world blurs. Red earth, red sky. You stumble into the Red Waste, and the Threshold seals behind you. There is no turning back now.',
        xp: 25,
        nextScene: 'red-waste-approach',
        lantern: -10,
      },
      {
        label: 'Turn Back',
        text: 'You step away from the gate. Its glow dims. You return to the Archive.',
        xp: 5,
        nextScene: 'ashfall-archive',
      },
    ],
  },

  'red-waste-approach': {
    id: 'red-waste-approach',
    title: 'Red Waste Approach',
    location: 'The Veil Between',
    description:
      'An endless plain of rust-colored sand and broken stone. The sky is wrong—half-crimson, half-starlit. In the distance, dunes roll like waves frozen in time. The air tastes of copper and ash. Your lantern is your only comfort.',
    atmosphere:
      'This is no natural place. The ground remembers a civilization that fell into silence. You are alone, but not unwatched. The Veil feels thin here.',
    lanternCostPerAction: 5,
    lootPool: {
      common: ['gate-coin'],
      uncommon: ['dustglass-shard', 'whisper-thread', 'ashwater-flask'],
      rare: ['brass-locator'],
      mythic: [],
    },
    actions: [
      {
        label: 'Travel Deeper',
        text: 'You walk across the cracked stone toward the distant dunes. Each step echoes strangely. Your lantern flickers. Time feels slow.',
        xp: 20,
        vitality: -5,
        lantern: -15,
        nextScene: 'glass-dune',
      },
      {
        label: 'Search the Ground',
        text: 'You kneel and sift through the red sand. Something glints. A fragment of worked stone, ancient beyond measure.',
        xp: 25,
        vitality: -3,
        lantern: -10,
        items: ['dustglass-shard'],
      },
      {
        label: 'Listen to the Whispers',
        text: 'You close your eyes. The wind carries voices. Names, mostly. Some in languages you almost recognize. One name repeats: "Ashfaller." Is it yours?',
        xp: 15,
        items: ['whisper-thread'],
      },
      {
        label: 'Rest and Wait',
        text: 'You sit on a stone outcropping. The red sky pulses. Your breathing slows. You feel watched, but it is not hostile. Strange comfort here in the waste.',
        vitality: 10,
        xp: 5,
      },
    ],
  },

  'glass-dune': {
    id: 'glass-dune',
    title: 'Glass Dune',
    location: 'The Red Waste',
    description:
      'A dune of fused sand—glassy, smooth, reflecting the strange sky. At its peak stands the remnant of a pillar, still inscribed with legible script. The ground shimmers. Your lantern casts strange shadows.',
    atmosphere:
      'This was a temple. A waystation. A boundary marker. The Veil is very thin here. You can almost see two worlds at once—the red waste and something else, something cold and ancient.',
    lanternCostPerAction: 8,
    lootPool: {
      common: ['gate-coin'],
      uncommon: ['dustglass-shard', 'whisper-thread'],
      rare: ['brass-locator', 'veil-salt'],
      mythic: [],
    },
    actions: [
      {
        label: 'Climb to the Pillar',
        text: 'You scramble up the glass dune. The surface is smooth but somehow not slippery. The pillar is warm. You touch the script and feel a surge—visions flash: gates opening, names being spoken, the world splitting.',
        xp: 30,
        vitality: -8,
        lantern: -15,
        items: ['obelisk-fragment'],
        nextScene: 'broken-obelisk',
      },
      {
        label: 'Study the Glass',
        text: 'You examine the fused sand. It is not natural glass—it is something else, something wrought by intent. You find a small vial frozen in the matrix.',
        xp: 25,
        items: ['veil-salt'],
      },
      {
        label: 'Search for Shelter',
        text: 'You find a hollow beneath the dune, a cavity in the stone. Inside, strange symbols are etched into the walls, and a relic box sits untouched.',
        xp: 20,
        vitality: -5,
        items: ['brass-locator'],
      },
      {
        label: 'Return to the Approach',
        text: 'The dune\'s surface feels unstable. You descend carefully and retrace your steps.',
        xp: 10,
        nextScene: 'red-waste-approach',
      },
    ],
  },

  'broken-obelisk': {
    id: 'broken-obelisk',
    title: 'Broken Obelisk',
    location: 'The Red Waste, Inner Region',
    description:
      'A colossal stone structure, half-buried in sand. It is shattered, pieces scattered like the remains of a felled giant. The stone is inscribed with Names and Codes—some partially legible. The sky here is darker, deeper, full of stars that do not exist in your world. The Veil is almost transparent.',
    atmosphere:
      'This is sacred ground. The obelisk once anchored the Veil itself. Now it is broken, and the barrier between worlds has grown thin. You sense something vast beyond—not hostile, but ancient and aware.',
    lanternCostPerAction: 12,
    lootPool: {
      common: [],
      uncommon: ['ashwater-flask'],
      rare: ['obelisk-fragment', 'veil-salt'],
      mythic: ['name-scroll'],
    },
    actions: [
      {
        label: 'Study the Names',
        text: 'You run your fingers over the inscriptions. Each Name makes your breath catch. These are the true names of places, powers, perhaps even gods. You memorize one: "Valar-Ash." Knowledge burns in your mind.',
        xp: 40,
        items: ['name-scroll'],
      },
      {
        label: 'Look Beyond the Veil',
        text: 'You focus your intent. The barrier thins further. You glimpse another world—vast, dark, covered in ruins. Then the vision shatters. Pain lances through your head.',
        xp: 35,
        vitality: -15,
        lantern: -20,
        danger: true,
        dangerThreshold: 15,
      },
      {
        label: 'Gather Broken Pieces',
        text: 'You collect fragments of the obelisk. They are warm, and they hum with ancient purpose. These will be valued at the Archive.',
        xp: 25,
        vitality: -5,
        items: ['ashwater-flask'],
      },
      {
        label: 'Seek the Hollow Caravan',
        text: 'You spot tracks in the sand—worn, old, but not ancient. Something passed through here. You follow the trail deeper into the waste.',
        xp: 20,
        lantern: -10,
        nextScene: 'hollow-caravan',
      },
    ],
  },

  'hollow-caravan': {
    id: 'hollow-caravan',
    title: 'Hollow Caravan',
    location: 'The Red Waste, Deepest Reach',
    description:
      'Massive metal vessels, once vehicles of some kind, now rusted and half-buried. They are arranged in a circle, as if the travelers meant to defend against something. Inside the circle, the sand is disturbed—signs of a terrible struggle. Bones, faded cloth, and scattered artifacts lie among the dunes.',
    atmosphere:
      'This is a grave. A tomb. These travelers came through the Veil and never returned. Their fate is a warning. Yet among the ruin, you sense value—relics of great power, perhaps answers.',
    lanternCostPerAction: 15,
    lootPool: {
      common: [],
      uncommon: [],
      rare: ['ancient-garb', 'veil-claw'],
      mythic: ['crystal-message'],
    },
    actions: [
      {
        label: 'Search the Vessels',
        text: 'You carefully enter one of the metal shells. Inside, preserved by the dry air, you find a sealed capsule containing a crystal that glows with inner light. It pulses with intent—a message, perhaps, or a map.',
        xp: 50,
        vitality: -10,
        items: ['crystal-message', 'ancient-garb'],
      },
      {
        label: 'Pay Respects',
        text: 'You gather the scattered bones with reverence and arrange them properly. You speak a blessing in the old words you have learned. The Veil shivers in response, as if acknowledging your respect.',
        xp: 30,
        vitality: -3,
      },
      {
        label: 'Study the Struggle',
        text: 'The signs are clear: these travelers fought something. Claw marks scar the metal. Whatever attacked them was powerful and hungry. You find claw remnants—strange, crystalline, not biological.',
        xp: 35,
        items: ['veil-claw'],
      },
      {
        label: 'Prepare for Extraction',
        text: 'You have enough relics now. The Veil is growing unstable—the sky pulses, the ground trembles. Time to return to the Archive before the gate closes permanently.',
        xp: 40,
        nextScene: 'extraction-point',
      },
    ],
  },

  'extraction-point': {
    id: 'extraction-point',
    title: 'Extraction Point',
    location: 'The Threshold, Return Path',
    description:
      'The red sky cracks like glass. Through the fissures, you see amber light—the Archive. The Threshold Gate is open, but it is shrieking. The Veil is collapsing. You can feel reality splintering. The path back is clear, but it will close soon.',
    atmosphere:
      'This is the final moment. The gate will not stay open forever. You have seconds to decide: leap back to safety or push deeper into the unknown and risk being sealed in the Veil forever.',
    lanternCostPerAction: 0,
    actions: [
      {
        label: 'Extract Now',
        text: 'You run. The ground dissolves beneath your feet. The gate flares. You tumble through obsidian and brass and fire. Then—cold stone. Archive air. You are home. The gate seals behind you with a sound like thunder.',
        xp: 50,
        nextScene: 'return-to-archive',
        isEndScene: true,
      },
      {
        label: 'Push Deeper',
        text: 'Greed, or hunger for truth, makes you turn away from the gate. You run deeper into the Red Waste. The Veil closes behind you. The gate vanishes. You are alone in an alien world, with no way back. The Veil has claimed you.',
        xp: 100,
        nextScene: 'veil-lost',
        isEndScene: true,
        danger: true,
      },
    ],
  },

  'return-to-archive': {
    id: 'return-to-archive',
    title: 'Return to the Archive',
    location: 'Bunker Level Zero, Dubbo',
    description:
      'You collapse on the archive floor, gasping. Your clothes are torn, your skin is burned by ash and starlight. But you are alive. Around you, the relics you have gathered begin to glow softly, resonating with the Archive\'s ancient power. You have returned.',
    atmosphere:
      'Victory. Safety. But also: questions. What did you see in that broken obelisk? What did those names mean? The Archive feels older now, and you understand less of its secrets—but you have taken your first real step into the mysteries of the Veil.',
    actions: [
      {
        label: 'Secure Your Relics',
        text: 'You carefully place each item in the Archive\'s catalogue. The librarian—or the archive itself—hums with satisfaction. You are learning. You will return.',
        xp: 30,
        nextScene: 'ashfall-archive',
        isEndScene: true,
      },
    ],
  },

  'veil-lost': {
    id: 'veil-lost',
    title: 'Lost in the Veil',
    location: 'Between Worlds',
    description:
      'You stand alone in infinite darkness. The Red Waste has vanished. There is only silence and cold. And then, slowly, you begin to understand: you are not in the Waste anymore. You are in the Veil itself—the space between worlds. And something in this darkness has noticed you.',
    atmosphere:
      'This is not a failure. It is transformation. You will not return to the Archive. But you may discover secrets that no Ashfaller has ever known. The Veil is opening its eyes to you.',
    actions: [
      {
        label: 'Embrace the Veil',
        text: 'You stop running. You accept what has happened. The darkness wraps around you like cloth. You begin to hear voices—the true names of all things. Understanding floods in. You have become something new.',
        xp: 150,
        nextScene: 'ashfall-archive',
        isEndScene: true,
      },
    ],
  },
};

export default SCENES;
