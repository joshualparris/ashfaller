import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let logIdCounter = 0;
const nextLogId = () => `log-${Date.now()}-${++logIdCounter}`;

export interface GameLog {
  id: string;
  text: string;
  type: 'narrative' | 'action' | 'reward' | 'danger' | 'system';
  timestamp: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  description: string;
  effect?: string;
}

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
  startExpedition: () => void;
  endExpedition: (won: boolean) => void;
  resetGame: () => void;
  spendLantern: (amount: number) => void;
  discoverScene: (sceneId: string) => void;
  markActionUsed: (sceneId: string, actionIndex: number) => void;
  clearUsedActions: () => void;
  spendFocus: (amount: number) => void;
  recoverFocus: (amount: number) => void;
  consumeItem: (keyPrefix: string) => void;
}

export type GameState = GameStateData & GameStateActions;

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
        set((state) => ({
          vitality: Math.max(0, state.vitality - amount),
        }));
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
        set((state) => ({
          lanternCharge: Math.max(0, state.lanternCharge - amount),
        }));
      },

      discoverScene: (sceneId: string) => {
        set((state) => ({
          discoveredScenes: new Set([...state.discoveredScenes, sceneId]),
        }));
      },

      markActionUsed: (sceneId: string, actionIndex: number) => {
        set((state) => ({
          usedActions: new Set([...state.usedActions, `${sceneId}-${actionIndex}`]),
        }));
      },

      clearUsedActions: () => {
        set({ usedActions: new Set<string>() });
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
