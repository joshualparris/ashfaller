import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createItem } from '../data/items';

let logIdCounter = 0;
const nextLogId = () => `log-${Date.now()}-${++logIdCounter}`;

export interface GameLog {
  id: string;
  text: string;
  type: 'narrative' | 'action' | 'reward' | 'danger' | 'system';
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: number;
}

export interface ExpeditionLogEntry {
  id: string;
  text: string;
  type: 'narrative' | 'action' | 'reward' | 'danger' | 'system';
  timestamp: number;
  sceneId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  description: string;
  effect: string;
  upgrade?: {
    cost: number;
    newName: string;
    newEffect: string;
  };
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-expedition',
    title: 'First Steps',
    description: 'Complete your first expedition through the Veil.',
    earned: false,
  },
  {
    id: 'rare-collector',
    title: 'Relic Hunter',
    description: 'Find all rare relics in a single expedition.',
    earned: false,
  },
  {
    id: 'lantern-master',
    title: 'Light Keeper',
    description: 'Complete an expedition without your lantern dropping below 50%.',
    earned: false,
  },
  {
    id: 'veil-survivor',
    title: 'Veil Survivor',
    description: 'Survive being pulled back by the Veil.',
    earned: false,
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Accumulate 100 lore points.',
    earned: false,
  },
];

interface GameStateData {
  vitality: number;
  maxVitality: number;
  focus: number;
  maxFocus: number;
  lanternCharge: number;
  maxLanternCharge: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  currentLocation: string;
  currentScene: string;
  isInExpedition: boolean;
  hasStarted: boolean;
  gameOver: boolean;
  gameWon: boolean;
  inventory: InventoryItem[];
  maxInventorySize: number;
  discoveredScenes: Set<string>;
  visitedLocations: Set<string>;
  gameLog: GameLog[];
  usedActions: Set<string>;
  // New features
  lorePoints: number;
  achievements: Achievement[];
  expeditionLog: ExpeditionLogEntry[];
  currentProfile: string;
  narrationSpeed: number;
  narrationEnabled: boolean;
  theme: 'default' | 'light' | 'high-contrast';
  language: 'en' | 'es' | 'fr';
  keyBindings: { [key: string]: number };
  difficulty: 'casual' | 'normal' | 'hardcore';
  activeChallenges: string[];
  runHistory: any[];
}

interface GameStateActions {
  addLog: (text: string, type: GameLog['type']) => void;
  takeDamage: (amount: number) => void;
  recoverVitality: (amount: number) => void;
  addXP: (amount: number) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  setLocation: (location: string) => void;
  setScene: (scene: string) => void;
  // New features
  addLorePoints: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  addExpeditionLogEntry: (entry: ExpeditionLogEntry) => void;
  setProfile: (profile: string) => void;
  setNarrationSpeed: (speed: number) => void;
  setNarrationEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'default' | 'light' | 'high-contrast') => void;
  setLanguage: (language: 'en' | 'es' | 'fr') => void;
  setKeyBinding: (key: string, actionIndex: number) => void;
  setDifficulty: (difficulty: 'casual' | 'normal' | 'hardcore') => void;
  resetExpedition: () => void;
  spendLantern: (amount: number) => void;
  recoverLantern: (amount: number) => void;
  discoverScene: (sceneId: string) => void;
  markActionUsed: (sceneId: string, actionIndex: number) => void;
  clearUsedActions: () => void;
  spendFocus: (amount: number) => void;
  recoverFocus: (amount: number) => void;
  upgradeItem: (itemId: string) => void;
  setActiveChallenges: (challenges: string[]) => void;
  addRunHistory: (run: any) => void;
}

const initialState: GameStateData = {
  vitality: 50,
  maxVitality: 50,
  focus: 30,
  maxFocus: 30,
  lanternCharge: 100,
  maxLanternCharge: 100,
  xp: 0,
  level: 1,
  xpToNextLevel: 100,
  currentLocation: 'archive',
  currentScene: 'ashfall-archive',
  isInExpedition: false,
  hasStarted: false,
  gameOver: false,
  gameWon: false,
  inventory: [],
  maxInventorySize: 6,
  discoveredScenes: new Set<string>(['ashfall-archive']),
  visitedLocations: new Set<string>(['archive']),
  gameLog: [] as GameLog[],
  usedActions: new Set<string>(),
  // New features
  lorePoints: 0,
  achievements: initialAchievements,
  expeditionLog: [],
  currentProfile: 'default',
  narrationSpeed: 1.0,
  narrationEnabled: false,
  theme: 'default',
  language: 'en',
  keyBindings: { '1': 0, '2': 1, '3': 2, '4': 3 },
  difficulty: 'normal',
  activeChallenges: [],
  runHistory: []
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      addLog: (text: string, type: GameLog['type']) => {
        set((state) => ({
          gameLog: [
            ...state.gameLog,
            {
              id: nextLogId(),
              text,
              type,
              timestamp: Date.now(),
            },
          ].slice(-50),
        }));
      },

      takeDamage: (amount: number) => {
        set((state) => {
          let multiplier = 1;
          if (state.activeChallenges.includes('fragile')) multiplier = 1.5;
          return {
            vitality: Math.max(0, state.vitality - Math.floor(amount * multiplier)),
          };
        });
      },

      recoverVitality: (amount: number) => {
        set((state) => ({
          vitality: Math.min(state.maxVitality, state.vitality + amount),
        }));
      },

      addXP: (amount: number) => {
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newXpToNext = state.xpToNextLevel;
          let newMaxVitality = state.maxVitality;
          let newVitality = state.vitality;

          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel++;
            newXpToNext = newLevel * 100;
            newMaxVitality += 5;
            newVitality = newMaxVitality;
          }

          return {
            xp: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNext,
            maxVitality: newMaxVitality,
            vitality: newVitality,
          };
        });
      },

      addItem: (item: InventoryItem) => {
        set((state) => {
          if (state.inventory.length >= state.maxInventorySize) {
            return {
              gameLog: [
                ...state.gameLog,
                {
                  id: nextLogId(),
                  text: `Could not take ${item.name} — inventory is full.`,
                  type: 'system' as const,
                  timestamp: Date.now(),
                },
              ].slice(-50),
            };
          }

          const newLog = [...state.gameLog];
          newLog.push({
            id: Date.now().toString(),
            text: `Found: ${item.name}`,
            type: 'reward' as const,
            timestamp: Date.now(),
          });

          if (item.rarity === 'rare' || item.rarity === 'mythic') {
            newLog.push({
              id: (Date.now() + 1).toString(),
              text: `[${item.rarity.toUpperCase()}] ${item.description}`,
              type: 'reward' as const,
              timestamp: Date.now(),
            });
          }

          return {
            inventory: [...state.inventory, item],
            gameLog: newLog.slice(-50),
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id),
        }));
      },

      setLocation: (location: string) => {
        set((state) => ({
          currentLocation: location,
          visitedLocations: new Set([...state.visitedLocations, location]),
        }));
      },

      setScene: (scene: string) => {
        set((state) => ({
          currentScene: scene,
          discoveredScenes: new Set([...state.discoveredScenes, scene]),
          // Clear used actions when moving scenes so actions refresh per-scene visit
          usedActions: new Set<string>(),
        }));
      },

      spendFocus: (amount: number) => {
        set((state) => ({ focus: Math.max(0, state.focus - amount) }));
      },
      recoverFocus: (amount: number) => {
        set((state) => ({ focus: Math.min(state.maxFocus, state.focus + amount) }));
      },

      upgradeItem: (itemId: string) => {
        set((state) => {
          const item = state.inventory.find(i => i.id === itemId);
          if (!item || !item.upgrade || state.lorePoints < item.upgrade.cost) {
            return state;
          }
          return {
            inventory: state.inventory.map(i =>
              i.id === itemId
                ? { ...i, name: item.upgrade!.newName, effect: item.upgrade!.newEffect, upgrade: undefined }
                : i
            ),
            lorePoints: state.lorePoints - item.upgrade.cost,
          };
        });
      },

      setActiveChallenges: (challenges: string[]) => {
        set({ activeChallenges: challenges });
      },

      addRunHistory: (run: any) => {
        set((state) => ({
          runHistory: [...state.runHistory, run].slice(-10), // Keep last 10
        }));
      },
      consumeItem: (keyPrefix: string) => {
        set((state) => ({
          inventory: state.inventory.filter((i) => !i.id.startsWith(keyPrefix)),
        }));
      },

      startExpedition: () => {
        set({
          isInExpedition: true,
          currentLocation: 'red-waste',
          currentScene: 'threshold-gate',
          usedActions: new Set<string>(),
        });
      },
      addLorePoints: (amount: number) => {
        set((state) => ({ lorePoints: state.lorePoints + amount }));
      },

      unlockAchievement: (achievementId: string) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId
              ? { ...achievement, earned: true, earnedAt: Date.now() }
              : achievement
          ),
        }));
      },

      addExpeditionLogEntry: (entry: ExpeditionLogEntry) => {
        set((state) => ({
          expeditionLog: [...state.expeditionLog, entry].slice(-100), // Keep last 100 entries
        }));
      },

      setProfile: (profile: string) => {
        set({ currentProfile: profile });
      },

      setNarrationSpeed: (speed: number) => {
        set({ narrationSpeed: speed });
      },

      setKeyBinding: (key: string, actionIndex: number) => {
        set((state) => ({
          keyBindings: { ...state.keyBindings, [key]: actionIndex },
        }));
      },

      setDifficulty: (difficulty: 'casual' | 'normal' | 'hardcore') => {
        set({ difficulty });
      },

      resetExpedition: () => {
        set((state) => ({
          isInExpedition: false,
          currentLocation: 'archive',
          currentScene: 'ashfall-archive',
          usedActions: new Set<string>(),
          gameOver: false,
          gameWon: false,
          // Reset stats based on difficulty
          vitality: state.difficulty === 'casual' ? 60 : state.difficulty === 'hardcore' ? 40 : 50,
          maxVitality: state.difficulty === 'casual' ? 60 : state.difficulty === 'hardcore' ? 40 : 50,
          focus: state.difficulty === 'casual' ? 35 : state.difficulty === 'hardcore' ? 25 : 30,
          maxFocus: state.difficulty === 'casual' ? 35 : state.difficulty === 'hardcore' ? 25 : 30,
          lanternCharge: state.difficulty === 'casual' ? 120 : state.difficulty === 'hardcore' ? 80 : 100,
          maxLanternCharge: state.difficulty === 'casual' ? 120 : state.difficulty === 'hardcore' ? 80 : 100,
        }));
      },

      endExpedition: (won: boolean) => {
        set({
          isInExpedition: false,
          gameWon: won,
          currentLocation: 'archive',
        });
      },

      resetGame: () => {
        set(initialState);
      },

      spendLantern: (amount: number) => {
        set((state) => {
          let multiplier = 1;
          if (state.activeChallenges.includes('double-lantern')) multiplier = 2;
          return {
            lanternCharge: Math.max(0, state.lanternCharge - amount * multiplier),
          };
        });
      },

      recoverLantern: (amount: number) => {
        set((state) => ({
          lanternCharge: Math.min(state.maxLanternCharge, state.lanternCharge + amount),
        }));
      },

      discoverScene: (sceneId: string) => {
        set((state) => ({
          discoveredScenes: new Set([...state.discoveredScenes, sceneId]),
        }));
      },

      // New features
      addLorePoints: (amount: number) => {
        set((state) => ({ lorePoints: state.lorePoints + amount }));
      },

      unlockAchievement: (achievementId: string) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId
              ? { ...achievement, earned: true, earnedAt: Date.now() }
              : achievement
          ),
        }));
      },

      addExpeditionLogEntry: (entry: ExpeditionLogEntry) => {
        set((state) => ({
          expeditionLog: [...state.expeditionLog, entry].slice(-100), // Keep last 100 entries
        }));
      },

      setProfile: (profile: string) => {
        set({ currentProfile: profile });
      },

      setNarrationSpeed: (speed: number) => {
        set({ narrationSpeed: speed });
      },

      setKeyBinding: (key: string, actionIndex: number) => {
        set((state) => ({
          keyBindings: { ...state.keyBindings, [key]: actionIndex },
        }));
      },

      setDifficulty: (difficulty: 'casual' | 'normal' | 'hardcore') => {
        set({ difficulty });
      },

      resetExpedition: () => {
        set((state) => ({
          isInExpedition: false,
          currentLocation: 'archive',
          currentScene: 'ashfall-archive',
          usedActions: new Set<string>(),
          gameOver: false,
          gameWon: false,
          // Reset stats based on difficulty
          vitality: state.difficulty === 'casual' ? 60 : state.difficulty === 'hardcore' ? 40 : 50,
          maxVitality: state.difficulty === 'casual' ? 60 : state.difficulty === 'hardcore' ? 40 : 50,
          focus: state.difficulty === 'casual' ? 35 : state.difficulty === 'hardcore' ? 25 : 30,
          maxFocus: state.difficulty === 'casual' ? 35 : state.difficulty === 'hardcore' ? 25 : 30,
          lanternCharge: state.difficulty === 'casual' ? 120 : state.difficulty === 'hardcore' ? 80 : 100,
          maxLanternCharge: state.difficulty === 'casual' ? 120 : state.difficulty === 'hardcore' ? 80 : 100,
        }));
      },
    }),
    {
      name: 'ashfaller-game',
      // Only persist long-term progression. Session state (log, hasStarted,
      // current scene, usedActions) resets each browser load for a fresh run.
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        xpToNextLevel: state.xpToNextLevel,
        maxVitality: state.maxVitality,
        inventory: state.inventory,
        discoveredScenes: Array.from(state.discoveredScenes),
        visitedLocations: Array.from(state.visitedLocations),
        // New persistent data
        lorePoints: state.lorePoints,
        achievements: state.achievements,
        expeditionLog: state.expeditionLog,
        narrationSpeed: state.narrationSpeed,
        narrationEnabled: state.narrationEnabled,
        keyBindings: state.keyBindings,
        difficulty: state.difficulty,
        activeChallenges: state.activeChallenges,
        runHistory: state.runHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.discoveredScenes = new Set(
            Array.isArray(state.discoveredScenes) ? state.discoveredScenes : ['ashfall-archive']
          );
          state.visitedLocations = new Set(
            Array.isArray(state.visitedLocations) ? state.visitedLocations : ['archive']
          );
          state.usedActions = new Set<string>();
          // Reset session state for fresh start on each page load
          state.hasStarted = false;
          state.gameLog = [];
          state.gameOver = false;
          state.gameWon = false;
          // Initialize new features if missing
          if (state.achievements === undefined) state.achievements = initialAchievements;
          if (state.expeditionLog === undefined) state.expeditionLog = [];
          if (state.lorePoints === undefined) state.lorePoints = 0;
          if (state.narrationSpeed === undefined) state.narrationSpeed = 1.0;
          if (state.narrationEnabled === undefined) state.narrationEnabled = false;
          if (state.keyBindings === undefined) state.keyBindings = { '1': 0, '2': 1, '3': 2, '4': 3 };
          if (state.difficulty === undefined) state.difficulty = 'normal';
          if (state.activeChallenges === undefined) state.activeChallenges = [];
          if (state.runHistory === undefined) state.runHistory = [];
          state.isInExpedition = false;
          state.currentScene = 'ashfall-archive';
          state.currentLocation = 'archive';
          // Heal fully on fresh page load
          state.vitality = state.maxVitality;
          state.focus = state.maxFocus;
          state.lanternCharge = state.maxLanternCharge;
        }
      },
    }
  )
);
