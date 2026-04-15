import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { GameLog } from './components/GameLog';
import { StatsPanel } from './components/StatsPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { ActionButtons } from './components/ActionButtons';
import SCENES from './data/scenes';
import type { Scene, SceneAction } from './data/scenes';
import { createItem } from './data/items';

function App() {
  const store = useGameStore();
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize game
  useEffect(() => {
    if (!store.hasStarted) {
      store.addLog('═══════════════════════════════════', 'system');
      store.addLog('Welcome, Ashfaller.', 'narrative');
      store.addLog('The Veil stirs. The Gate calls.', 'narrative');
      store.addLog('═══════════════════════════════════', 'system');
      store.addLog(' ', 'system');
      useGameStore.setState({ hasStarted: true });
    }
  }, [store, store.hasStarted]);

  // Update current scene
  useEffect(() => {
    const scene = SCENES[store.currentScene];
    if (scene) {
      setCurrentScene(scene);
    }
  }, [store.currentScene]);

  const handleAction = async (action: SceneAction, actionIndex: number) => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Mark this action as used
    store.markActionUsed(store.currentScene, actionIndex);

    // Add small delay for narrative feel
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Add action text
    store.addLog(action.text, 'action');

    // Apply effects
    if (action.xp) {
      store.addXP(action.xp);
      store.addLog(`+${action.xp} XP`, 'reward');
    }

    if (action.vitality && action.vitality < 0) {
      store.takeDamage(Math.abs(action.vitality));
      store.addLog(`−${Math.abs(action.vitality)} Vitality`, 'danger');
    } else if (action.vitality && action.vitality > 0) {
      store.recoverVitality(action.vitality);
      store.addLog(`+${action.vitality} Vitality`, 'reward');
    }

    if (action.lantern) {
      store.spendLantern(Math.abs(action.lantern));
      if (action.lantern < 0) {
        store.addLog(`Lantern: −${Math.abs(action.lantern)}`, 'system');
      }
    }

    // Add items
    if (action.items) {
      for (const itemKey of action.items) {
        const item = createItem(itemKey);
        store.addItem(item);
      }
    }

    // Check death condition
    if (store.vitality <= 0) {
      store.addLog(' ', 'system');
      store.addLog('Your strength fails. Darkness claims you.', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.addLog('EXPEDITION FAILED', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.addLog('Return to the Archive to prepare again.', 'system');
      store.addLog(' ', 'system');
      store.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    // Check lantern condition
    if (store.lanternCharge <= 0) {
      store.addLog(' ', 'system');
      store.addLog('Your lantern flickers and dies.', 'danger');
      store.addLog('In the darkness, the gate fades.', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.addLog('EXPEDITION FAILED', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    // Check danger condition
    if (action.danger && action.dangerThreshold && store.vitality <= action.dangerThreshold) {
      store.addLog(' ', 'system');
      store.addLog('The Veil closes. You are pulled back.', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.addLog('EXPEDITION FAILED', 'danger');
      store.addLog('═════════════════════════════════════', 'system');
      store.addLog('You limp back to the Archive, wounded.', 'system');
      store.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    // Move to next scene
    if (action.nextScene) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      store.setScene(action.nextScene);
      const nextScene = SCENES[action.nextScene];
      if (nextScene) {
        store.addLog(' ', 'system');
        store.addLog('─────────────────────────────────', 'system');
        store.addLog(nextScene.title.toUpperCase(), 'system');
        store.addLog(nextScene.location, 'system');
        store.addLog('─────────────────────────────────', 'system');
        store.addLog(nextScene.description, 'narrative');
        store.addLog(nextScene.atmosphere, 'narrative');
      }

      // Check if win condition
      if (nextScene?.id === 'return-to-archive' || nextScene?.id === 'veil-lost') {
        store.addLog(' ', 'system');
        store.addLog('═════════════════════════════════════', 'system');
        store.addLog(nextScene?.id === 'return-to-archive' ? 'EXPEDITION SUCCESS' : 'VEIL TAKEN', 'reward');
        store.addLog('═════════════════════════════════════', 'system');
      }
    }

    setIsProcessing(false);
  };

  const handleRestart = () => {
    store.resetGame();
    store.addLog('═══════════════════════════════════', 'system');
    store.addLog('Welcome back, Ashfaller.', 'narrative');
    store.addLog('The Gate beckons once more.', 'narrative');
    store.addLog('═══════════════════════════════════', 'system');
    store.addLog(' ', 'system');
    store.setScene('ashfall-archive');
  };

  if (!currentScene) {
    return (
      <div className="w-full h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const gameOver = store.vitality <= 0 || store.lanternCharge <= 0;

  return (
    <div
      className="scanlines bg-obsidian-950 overflow-hidden p-3 grid gap-3"
      style={{ height: '100dvh', gridTemplateRows: 'auto minmax(0, 1fr)' }}
    >
      {/* Header */}
      <motion.div
        className="glass-panel px-4 py-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black glow-amber leading-none">ASHFALLER</h1>
            <p className="location-tag text-[10px]">The Veil Between</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-amber-300 leading-tight">{currentScene.title}</div>
            <div className="location-tag text-[10px]">{currentScene.location}</div>
          </div>
        </div>
      </motion.div>

      {/* Main content area */}
      <div
        className="min-h-0 overflow-hidden grid gap-3"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}
      >
        {/* Left panel - Chronicle / Narrative */}
        <div
          className="glass-panel p-4 min-w-0 min-h-0 overflow-hidden grid"
          style={{ gridTemplateRows: 'auto minmax(0, 1fr)' }}
        >
          <div className="location-tag mb-2 text-xs">CHRONICLE</div>
          <div className="min-h-0 overflow-hidden">
            <GameLog entries={store.gameLog} />
          </div>
        </div>

        {/* Right sidebar - Stats, Relics, Actions - grid pins actions at bottom */}
        <div
          className="min-h-0 overflow-hidden grid gap-3"
          style={{ gridTemplateRows: 'auto minmax(0, 1fr) auto' }}
        >
          {/* Stats Panel */}
          <div className="min-h-0 overflow-hidden">
            <StatsPanel
              vitality={store.vitality}
              maxVitality={store.maxVitality}
              focus={store.focus}
              maxFocus={store.maxFocus}
              lanternCharge={store.lanternCharge}
              maxLanternCharge={store.maxLanternCharge}
              xp={store.xp}
              xpToNextLevel={store.xpToNextLevel}
              level={store.level}
            />
          </div>

          {/* Inventory Panel - flexible middle */}
          <div className="min-h-0 overflow-hidden">
            <InventoryPanel items={store.inventory} maxSize={store.maxInventorySize} />
          </div>

          {/* Actions - always visible at bottom of sidebar */}
          <div className="min-h-0">
            {gameOver ? (
              <motion.button
                className="btn-action"
                onClick={handleRestart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ↻ RETURN TO ARCHIVE
              </motion.button>
            ) : (
              <ActionButtons
                sceneId={store.currentScene}
                actions={currentScene.actions}
                onActionSelect={handleAction}
                disabled={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
