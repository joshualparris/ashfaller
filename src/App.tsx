import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { GameLog } from './components/GameLog';
import { StatsPanel } from './components/StatsPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { ActionButtons } from './components/ActionButtons';
import { Journal } from './components/ui/Journal';
import { AchievementToast } from './components/ui/AchievementToast';
import { ProfileSelector } from './components/ui/ProfileSelector';
import SCENES from './data/scenes';
import type { Scene, SceneAction } from './data/scenes';
import { createItem } from './data/items';

function App() {
  const store = useGameStore();
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const initRef = useRef(false);

  // Initialize game (once, guarded against StrictMode double-invoke)
  useEffect(() => {
    const s = useGameStore.getState();
    if (s.hasStarted || initRef.current) return;
    initRef.current = true;
    
    useGameStore.setState({ hasStarted: true });
    s.addLog('═══════════════════════════════════', 'system');
    s.addLog('Welcome, Ashfaller.', 'narrative');
    s.addLog('The Veil stirs. The Gate calls.', 'narrative');
    s.addLog('═══════════════════════════════════', 'system');
  }, []);

  // Update ambient audio when location changes
  useEffect(() => {
    playAmbient(store.currentLocation);
  }, [store.currentLocation]);

  // Achievement checking
  useEffect(() => {
    const checkAchievements = () => {
      const state = useGameStore.getState();

      // First expedition
      if (state.gameWon && !state.achievements.find(a => a.id === 'first-expedition')?.earned) {
        state.unlockAchievement('first-expedition');
        setAchievementToast({
          title: 'First Steps',
          description: 'Complete your first expedition through the Veil.',
        });
      }

      // Rare collector
      const rareItems = state.inventory.filter(item => item.rarity === 'rare').length;
      if (rareItems >= 3 && !state.achievements.find(a => a.id === 'rare-collector')?.earned) {
        state.unlockAchievement('rare-collector');
        setAchievementToast({
          title: 'Relic Hunter',
          description: 'Find all rare relics in a single expedition.',
        });
      }

      // Lantern master
      if (state.gameWon && state.lanternCharge >= 50 && !state.achievements.find(a => a.id === 'lantern-master')?.earned) {
        state.unlockAchievement('lantern-master');
        setAchievementToast({
          title: 'Light Keeper',
          description: 'Complete an expedition without your lantern dropping below 50%.',
        });
      }

      // Knowledge seeker
      if (state.lorePoints >= 100 && !state.achievements.find(a => a.id === 'knowledge-seeker')?.earned) {
        state.unlockAchievement('knowledge-seeker');
        setAchievementToast({
          title: 'Knowledge Seeker',
          description: 'Accumulate 100 lore points.',
        });
      }
    };

    if (store.gameWon) {
      checkAchievements();
    }
  }, [store.gameWon, store.inventory, store.lorePoints]);

  // Derived item effects
  const hasLocator = store.inventory.some((i) => i.id.startsWith('brass-locator'));
  const hasNameScroll = store.inventory.some((i) => i.id.startsWith('name-scroll'));
  const hasAshwater = store.inventory.some((i) => i.id.startsWith('ashwater-flask'));
  const hasAncientGarb = store.inventory.some((i) => i.id.startsWith('ancient-garb'));
  const hasVeilSalt = store.inventory.some((i) => i.id.startsWith('veil-salt'));
  const hasObeliskFragment = store.inventory.some((i) => i.id.startsWith('obelisk-fragment'));

  const applyLanternCost = (raw: number) => {
    // Locator reduces lantern burn by 20%
    if (hasLocator && raw > 0) return Math.max(1, Math.round(raw * 0.8));
    return raw;
  };
  const applyXpGain = (raw: number) => {
    if (hasNameScroll && raw > 0) return Math.round(raw * 1.2);
    return raw;
  };
  const applyVitalityDamage = (raw: number) => {
    // Ancient Garb (protective clothing) reduces vitality damage by 15%
    if (hasAncientGarb && raw > 0) return Math.max(1, Math.round(raw * 0.85));
    return raw;
  };
  const applyFocusCost = (raw: number) => {
    // Obelisk Fragment (Names of power) reduces focus costs by 20%
    if (hasObeliskFragment && raw > 0) return Math.max(1, Math.round(raw * 0.8));
    return raw;
  };
  const getDangerThreshold = (baseThreshold: number | undefined, currentFocus: number) => {
    // Veil Salt makes danger thresholds less harsh by 10% (gives a buffer)
    if (!baseThreshold) return baseThreshold;
    let adjusted = baseThreshold;
    if (hasVeilSalt) adjusted = Math.round(adjusted * 1.1);
    // High focus reduces danger (you're focused, less likely to get caught); low focus increases it
    // For every 5 Focus above 15, gain +1 to threshold (safer). For every 5 below 15, lose -1 (more danger)
    const focusScale = Math.round((currentFocus - 15) / 5);
    return Math.max(5, adjusted + focusScale);
  };

  const handleAction = async (action: SceneAction, actionIndex: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const s = useGameStore.getState();
    s.markActionUsed(s.currentScene, actionIndex);

    await new Promise((r) => setTimeout(r, 250 * (1 / store.narrationSpeed)));
    s.addLog(action.text, 'action');

    // Apply per-scene lantern drain (atmosphere cost of being in dangerous place)
    const currentSceneData = currentScene;
    if (currentSceneData?.lanternCostPerAction && currentSceneData.lanternCostPerAction > 0) {
      const drainAmount = Math.round(currentSceneData.lanternCostPerAction * difficultyMod.drain);
      s.spendLantern(drainAmount);
      s.addLog(
        `Lantern: −${drainAmount} (atmosphere drain)`,
        'system'
      );
    }

    if (action.xp) {
      const prevLevel = useGameStore.getState().level;
      const xp = applyXpGain(action.xp);
      s.addXP(xp);
      s.addLog(`+${xp} XP${hasNameScroll && xp !== action.xp ? ' (Scroll of Names)' : ''}`, 'reward');
      const newLevel = useGameStore.getState().level;
      if (newLevel > prevLevel) {
        s.addLog(`LEVEL UP! You are now level ${newLevel}.`, 'reward');
        s.addLog('Your vitality surges as your maximum grows.', 'reward');
      }
    }

    if (action.vitality && action.vitality < 0) {
      const damage = applyVitalityDamage(Math.abs(action.vitality));
      s.takeDamage(damage);
      s.addLog(
        `−${damage} Vitality${hasAncientGarb && damage !== Math.abs(action.vitality) ? ' (Ancient Garb)' : ''}`,
        'danger'
      );
    } else if (action.vitality && action.vitality > 0) {
      s.recoverVitality(action.vitality);
      s.addLog(`+${action.vitality} Vitality`, 'reward');
    }

    if (action.focus && action.focus < 0) {
      const focusCost = applyFocusCost(Math.abs(action.focus));
      s.spendFocus(focusCost);
      s.addLog(
        `−${focusCost} Focus${hasObeliskFragment && focusCost !== Math.abs(action.focus) ? ' (Obelisk Fragment)' : ''}`,
        'danger'
      );
    } else if (action.focus && action.focus > 0) {
      s.recoverFocus(action.focus);
      s.addLog(`+${action.focus} Focus`, 'reward');
    }

    if (action.lantern) {
      if (action.lantern < 0) {
        const cost = applyLanternCost(Math.abs(action.lantern));
        s.spendLantern(cost);
        s.addLog(
          `Lantern: −${cost}${hasLocator && cost !== Math.abs(action.lantern) ? ' (Locator)' : ''}`,
          'system'
        );
      } else {
        s.recoverLantern(action.lantern);
        s.addLog(`Lantern: +${action.lantern}`, 'reward');
      }
    }

    if (action.items) {
      for (const itemKey of action.items) s.addItem(createItem(itemKey));
    }

    // Re-read state after mutations
    const after = useGameStore.getState();

    // Ashwater Flask: revive once when vitality hits 0
    if (after.vitality <= 0 && hasAshwater) {
      s.consumeItem('ashwater-flask');
      s.recoverVitality(20);
      s.addLog('The Ashwater Flask shatters — warmth floods your veins. +20 Vitality', 'reward');
    }

    const final = useGameStore.getState();

    // Warn if lantern is getting dangerously low
    if (final.lanternCharge > 0 && final.lanternCharge <= 20 && !action.isEndScene) {
      s.addLog('⚠ Your lantern flickers weakly. Seek the way home soon.', 'danger');
    }

    if (final.vitality <= 0) {
      s.addLog('Your strength fails. Darkness claims you.', 'danger');
      s.addLog('EXPEDITION FAILED', 'danger');
      s.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    if (final.lanternCharge <= 0) {
      s.addLog('Your lantern flickers and dies.', 'danger');
      s.addLog('EXPEDITION FAILED', 'danger');
      s.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    const dangerThreshold = getDangerThreshold(action.dangerThreshold, final.focus);
    if (action.danger && dangerThreshold !== undefined && final.vitality <= dangerThreshold) {
      s.addLog('The Veil closes. You are pulled back, wounded.', 'danger');
      s.addLog('EXPEDITION FAILED', 'danger');
      s.endExpedition(false);
      setIsProcessing(false);
      return;
    }

    if (action.nextScene) {
      await new Promise((r) => setTimeout(r, 400 * (1 / store.narrationSpeed)));
      s.setScene(action.nextScene);
      const nextScene = SCENES[action.nextScene];
      if (nextScene) {
        s.addLog(`── ${nextScene.title.toUpperCase()} ──`, 'system');
        s.addLog(nextScene.description, 'narrative');
        s.addLog(nextScene.atmosphere, 'narrative');
      }
      if (nextScene?.id === 'return-to-archive' || nextScene?.id === 'veil-lost') {
        s.addLog(
          nextScene?.id === 'return-to-archive' ? 'EXPEDITION SUCCESS' : 'VEIL TAKEN',
          'reward'
        );
        s.endExpedition(nextScene?.id === 'return-to-archive');
        if (nextScene?.id === 'return-to-archive') {
          s.addLorePoints(10); // Award lore points for successful expedition
          // Add to expedition log
          s.addExpeditionLogEntry({
            id: `success-${Date.now()}`,
            text: 'Expedition completed successfully',
            type: 'reward',
            timestamp: Date.now(),
            sceneId: s.currentScene,
          });
        }
      }
    }

    setIsProcessing(false);
  };

  const handleRestart = () => {
    store.resetGame();
    initRef.current = false;
    useGameStore.getState().addLog('── A NEW EXPEDITION ──', 'system');
    useGameStore.getState().addLog('Welcome back, Ashfaller. The Gate beckons once more.', 'narrative');
  };

  if (!currentScene) {
    return (
      <div className="w-full h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const gameOver = store.vitality <= 0 || store.lanternCharge <= 0 || !!store.gameWon;
  const runStats = {
    relics: store.inventory.length,
    level: store.level,
    xp: store.xp + (store.level - 1) * 100,
    scenes: store.discoveredScenes instanceof Set ? store.discoveredScenes.size : 0,
  };

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
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-black glow-amber leading-none">ASHFALLER</h1>
            <p className="location-tag text-[10px]">The Veil Between</p>
          </div>
          <div className="text-right min-w-0">
            <div className="text-lg font-bold text-amber-300 leading-tight truncate">
              {currentScene.title}
            </div>
            <div className="location-tag text-[10px]">{currentScene.location}</div>
          </div>
        </div>
      </motion.div>

      {/* Main content area — responsive: stacks under 900px */}
      <div className="main-layout min-h-0 overflow-hidden grid gap-3">
        {/* Left panel */}
        <div
          className="glass-panel p-4 min-w-0 min-h-0 overflow-hidden grid"
          style={{ gridTemplateRows: 'auto minmax(0, 1fr)' }}
        >
          <div className="location-tag mb-2 text-xs">CHRONICLE</div>
          <div className="min-h-0 overflow-hidden">
            <GameLog entries={store.gameLog} />
          </div>
        </div>

        {/* Right sidebar */}
        <div
          className="sidebar min-h-0 overflow-hidden grid gap-3"
          style={{ gridTemplateRows: 'auto minmax(0, 1fr) auto' }}
        >
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
          <div className="min-h-0 overflow-hidden">
            <InventoryPanel items={store.inventory} maxSize={store.maxInventorySize} />
          </div>
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
                onResetActions={() => useGameStore.getState().clearUsedActions()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Journal Modal */}
      <AnimatePresence>
        {showJournal && (
          <Journal
            discoveredScenes={store.discoveredScenes}
            expeditionLog={store.expeditionLog}
            achievements={store.achievements}
            lorePoints={store.lorePoints}
            onClose={() => setShowJournal(false)}
          />
        )}
      </AnimatePresence>

      {/* Profile Selector Modal */}
      <AnimatePresence>
        {showProfileSelector && (
          <ProfileSelector
            currentProfile={store.currentProfile}
            onProfileChange={(profile) => store.setProfile(profile)}
            onClose={() => setShowProfileSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Achievement Toast */}
      <AnimatePresence>
        {achievementToast && (
          <AchievementToast
            achievement={achievementToast}
            onClose={() => setAchievementToast(null)}
          />
        )}
      </AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-panel p-6 max-w-md w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="location-tag text-xs mb-2">EXPEDITION ENDED</div>
              <h2
                className={`text-3xl font-black mb-4 ${
                  store.gameWon ? 'text-amber-300 glow-amber' : 'text-red-400 glow-red'
                }`}
              >
                {store.gameWon ? 'RETURN TO ARCHIVE' : 'VEIL CLAIMED YOU'}
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm my-4">
                <div className="bg-black/40 rounded p-2">
                  <div className="text-amber-400 text-xs">LEVEL</div>
                  <div className="text-amber-200 text-xl font-bold">{runStats.level}</div>
                </div>
                <div className="bg-black/40 rounded p-2">
                  <div className="text-amber-400 text-xs">TOTAL XP</div>
                  <div className="text-amber-200 text-xl font-bold">{runStats.xp}</div>
                </div>
                <div className="bg-black/40 rounded p-2">
                  <div className="text-amber-400 text-xs">RELICS</div>
                  <div className="text-amber-200 text-xl font-bold">{runStats.relics}</div>
                </div>
                <div className="bg-black/40 rounded p-2">
                  <div className="text-amber-400 text-xs">SCENES</div>
                  <div className="text-amber-200 text-xl font-bold">{runStats.scenes}</div>
                </div>
              </div>
              <motion.button
                className="btn-action mt-2"
                onClick={handleRestart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ↻ BEGIN NEW EXPEDITION
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
