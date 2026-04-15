import type { InventoryItem } from '../store/gameStore';

export const ITEM_POOL: { [key: string]: Omit<InventoryItem, 'id'> } = {
  'dustglass-shard': {
    name: 'Dustglass Shard',
    rarity: 'uncommon',
    description: 'A fragment of fused glass, warm and pulsing with faint light. Reflects the Red Waste like a mirror.',
  },

  'whisper-thread': {
    name: 'Whisper Thread',
    rarity: 'uncommon',
    description:
      'A strand of something between silk and shadow. When held to your ear, you hear ancient voices speaking in tongues you almost understand.',
  },

  'gate-coin': {
    name: 'Old Gate Coin',
    rarity: 'common',
    description: 'A token of brass and obsidian, marked with a symbol that resembles the Threshold Gate itself.',
  },

  'ashwater-flask': {
    name: 'Ashwater Flask',
    rarity: 'uncommon',
    description:
      'A ceramic vessel filled with water touched by red dust and starlight. Drinking it grants visions, briefly.',
  },

  'brass-locator': {
    name: 'Brass Locator',
    rarity: 'rare',
    description:
      'An ancient navigation tool, still warm and faintly humming. Points not to magnetic north, but to the nearest gate.',
  },

  'veil-salt': {
    name: 'Veil Salt',
    rarity: 'rare',
    description:
      'A crystalline substance that shimmers between visible and invisible. Sprinkle it to reveal hidden paths or conceal yourself from the Veil\'s attention.',
  },

  'obelisk-fragment': {
    name: 'Obelisk Fragment',
    rarity: 'rare',
    description:
      'A piece of the Broken Obelisk, still inscribed with Names of power. Heat radiates from it in waves.',
  },

  'name-scroll': {
    name: 'Scroll of Names',
    rarity: 'mythic',
    description:
      'An ancient text inscribed with the true names of places, powers, and perhaps gods. Reading even one name changes you forever.',
  },

  'crystal-message': {
    name: 'Crystal Message',
    rarity: 'mythic',
    description:
      'A glowing crystalline capsule containing a message from travelers who came through the Veil long ago. Its meaning is still unclear.',
  },

  'ancient-garb': {
    name: 'Ancient Garb',
    rarity: 'rare',
    description:
      'Clothing from before the Veil collapsed, woven with fibers that no longer grow in your world. Still holds the scent of other skies.',
  },

  'veil-claw': {
    name: 'Veil Claw',
    rarity: 'rare',
    description:
      'A crystalline talon, not quite biological. It whispers when the Veil grows thin. Perhaps a weapon, or a warning.',
  },
};

export function createItem(key: string): InventoryItem {
  const template = ITEM_POOL[key];
  if (!template) {
    throw new Error(`Item template not found: ${key}`);
  }
  return {
    ...template,
    id: `${key}-${Date.now()}`,
  };
}
