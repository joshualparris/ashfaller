import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Achievement, ExpeditionLogEntry } from '../store/gameStore';
import SCENES from '../data/scenes.ts';

interface JournalProps {
  discoveredScenes: Set<string>;
  expeditionLog: ExpeditionLogEntry[];
  achievements: Achievement[];
  lorePoints: number;
  onClose: () => void;
}

export function Journal({
  discoveredScenes,
  expeditionLog,
  achievements,
  lorePoints,
  onClose,
}: JournalProps) {
  const [activeTab, setActiveTab] = useState<'locations' | 'map' | 'crafting' | 'history'>('locations');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const discoveredSceneList = Array.from(discoveredScenes)
    .map(sceneId => SCENES[sceneId])
    .filter(Boolean);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalAchievements = achievements.length;

  // Map data
  const scenePositions: { [key: string]: { x: number; y: number } } = {
    'ashfall-archive': { x: 100, y: 200 },
    'threshold-gate': { x: 200, y: 200 },
    'red-waste-approach': { x: 300, y: 150 },
    'glass-dune': { x: 400, y: 100 },
    'broken-obelisk': { x: 500, y: 150 },
    'hollow-caravan': { x: 350, y: 250 },
    'return-to-archive': { x: 100, y: 300 },
    'veil-lost': { x: 600, y: 200 },
  };

  const sceneConnections: [string, string][] = [
    ['ashfall-archive', 'threshold-gate'],
    ['threshold-gate', 'red-waste-approach'],
    ['red-waste-approach', 'glass-dune'],
    ['red-waste-approach', 'broken-obelisk'],
    ['red-waste-approach', 'hollow-caravan'],
    ['glass-dune', 'broken-obelisk'],
    ['broken-obelisk', 'veil-lost'],
    ['hollow-caravan', 'return-to-archive'],
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-400">📖 Journal</h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 text-xl"
            aria-label="Close journal"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-amber-900/30">
          {[
            { id: 'locations', label: 'Locations', icon: '📍' },
            { id: 'map', label: 'Map', icon: '🗺️' },
            { id: 'crafting', label: 'Crafting', icon: '⚒️' },
            { id: 'history', label: 'History', icon: '📜' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-t border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-900/20 border-amber-400 text-amber-400'
                  : 'border-transparent text-amber-300/60 hover:text-amber-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Locations */}
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-3">Discovered Locations</h3>
              <div className="space-y-2">
                {discoveredSceneList.map((scene) => (
                  <div key={scene.id} className="p-3 bg-obsidian-800/50 rounded border border-amber-900/30">
                    <div className="font-bold text-amber-400">{scene.title}</div>
                    <div className="text-sm text-amber-200/80">{scene.location}</div>
                    <div className="text-xs text-amber-100/60 mt-1">{scene.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expedition Log */}
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-3">Expedition Log</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {expeditionLog.slice(-20).map((entry) => (
                  <div
                    key={entry.id}
                    className={`text-sm p-2 rounded ${
                      entry.type === 'reward' ? 'bg-green-900/20 text-green-300' :
                      entry.type === 'danger' ? 'bg-red-900/20 text-red-300' :
                      entry.type === 'system' ? 'bg-blue-900/20 text-blue-300' :
                      'bg-obsidian-800/30 text-amber-100'
                    }`}
                  >
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-3">
                Achievements ({earnedAchievements.length}/{totalAchievements})
              </h3>
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded border ${
                      achievement.earned
                        ? 'bg-amber-900/20 border-amber-400/50'
                        : 'bg-obsidian-800/30 border-obsidian-700/50'
                    }`}
                  >
                    <div className={`font-bold ${achievement.earned ? 'text-amber-400' : 'text-gray-500'}`}>
                      {achievement.earned ? '✓' : '○'} {achievement.title}
                    </div>
                    <div className={`text-sm ${achievement.earned ? 'text-amber-200' : 'text-gray-600'}`}>
                      {achievement.description}
                    </div>
                    {achievement.earned && achievement.earnedAt && (
                      <div className="text-xs text-amber-300/60 mt-1">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lore Points */}
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-3">Knowledge</h3>
              <div className="p-4 bg-obsidian-800/50 rounded border border-amber-900/30">
                <div className="text-3xl font-bold text-amber-400 mb-2">{lorePoints}</div>
                <div className="text-sm text-amber-200/80">
                  Lore Points accumulated from successful expeditions. Unlocks deeper understanding of the Veil.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-amber-300 mb-4">World Map</h3>
            <div className="bg-obsidian-900/50 p-4 rounded border border-amber-900/30">
              <svg width="700" height="400" viewBox="0 0 700 400" className="border border-amber-900/20 rounded">
                {/* Edges */}
                {sceneConnections.map(([from, to], i) => {
                  const fromPos = scenePositions[from];
                  const toPos = scenePositions[to];
                  if (!fromPos || !toPos) return null;
                  return (
                    <line
                      key={i}
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke="#d97706"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  );
                })}
                {/* Nodes */}
                {Object.entries(scenePositions).map(([sceneId, pos]) => {
                  const scene = SCENES[sceneId];
                  const isDiscovered = discoveredScenes.has(sceneId);
                  if (!scene) return null;
                  return (
                    <g key={sceneId}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill={isDiscovered ? "#d97706" : "#374151"}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        className="cursor-pointer hover:fill-amber-500 transition-colors"
                        onClick={() => isDiscovered && setSelectedScene(sceneId)}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 30}
                        textAnchor="middle"
                        className={`text-xs ${isDiscovered ? 'fill-amber-400' : 'fill-gray-500'}`}
                      >
                        {scene.title}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {selectedScene && (
              <div className="mt-4 p-4 bg-obsidian-800/50 rounded border border-amber-900/30 max-w-md">
                <h4 className="font-bold text-amber-400 mb-2">{SCENES[selectedScene]?.title}</h4>
                <p className="text-sm text-amber-200 mb-2">{SCENES[selectedScene]?.description}</p>
                <div className="text-xs text-amber-300/60 mb-2">
                  Actions available: {SCENES[selectedScene]?.actions.length || 0}
                </div>
                <button
                  onClick={() => setSelectedScene(null)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Close
                </button>
              </div>
            )}
            <div className="text-sm text-amber-200/60 mt-2">
              Click on discovered locations to view details. Undiscovered areas are hidden.
            </div>
          </div>
        )}

        {activeTab === 'crafting' && (
          <div>
            <h3 className="text-lg font-bold text-amber-300 mb-4">Crafting Bench</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useGameStore.getState().inventory
                .filter(item => item.upgrade)
                .map(item => (
                  <div key={item.id} className="p-4 bg-obsidian-800/50 rounded border border-amber-900/30">
                    <h4 className="font-bold text-amber-400">{item.name}</h4>
                    <p className="text-sm text-amber-200 mb-2">{item.effect}</p>
                    <div className="text-xs text-amber-300/60 mb-2">
                      Upgrade: {item.upgrade?.newName}
                    </div>
                    <div className="text-xs text-amber-300/60 mb-3">
                      Cost: {item.upgrade?.cost} lore points
                    </div>
                    <button
                      onClick={() => useGameStore.getState().upgradeItem(item.id)}
                      disabled={lorePoints < (item.upgrade?.cost || 0)}
                      className="btn-action text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upgrade
                    </button>
                  </div>
                ))}
            </div>
            {useGameStore.getState().inventory.filter(i => i.upgrade).length === 0 && (
              <div className="text-center text-amber-200/60 py-8">
                No upgradable relics found. Discover more in your expeditions!
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-bold text-amber-300 mb-4">Expedition History</h3>
            <div className="space-y-4">
              {useGameStore.getState().runHistory.map((run, i) => (
                <div key={i} className="p-4 bg-obsidian-800/50 rounded border border-amber-900/30">
                  <div className="flex justify-between items-center mb-2">
                    <div className={`font-bold ${run.success ? 'text-green-400' : 'text-red-400'}`}>
                      {run.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                    <div className="text-xs text-amber-300/60">
                      {new Date(run.timeSpent).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Scenes: {run.scenesVisited}</div>
                    <div>Relics: {run.relicsFound}</div>
                    <div>XP: {run.xpGained}</div>
                    <div>Lore: +{run.lorePointsEarned}</div>
                  </div>
                  {run.challenges.length > 0 && (
                    <div className="text-xs text-amber-300/60 mt-2">
                      Challenges: {run.challenges.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {useGameStore.getState().runHistory.length === 0 && (
                <div className="text-center text-amber-200/60 py-8">
                  No expeditions completed yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-bold text-amber-300 mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Difficulty</label>
                <select
                  value={useGameStore.getState().difficulty}
                  onChange={(e) => useGameStore.getState().setDifficulty(e.target.value as any)}
                  className="w-full p-2 bg-obsidian-800 border border-amber-900 rounded"
                >
                  <option value="casual">Casual</option>
                  <option value="normal">Normal</option>
                  <option value="hardcore">Hardcore</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Narration Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={useGameStore.getState().narrationSpeed}
                  onChange={(e) => useGameStore.getState().setNarrationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-amber-200">{useGameStore.getState().narrationSpeed}x</div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useGameStore.getState().narrationEnabled}
                    onChange={(e) => useGameStore.getState().setNarrationEnabled(e.target.checked)}
                  />
                  <span className="text-sm font-bold text-amber-400">Enable Narration</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Key Bindings</label>
                <div className="space-y-2">
                  {Object.entries(useGameStore.getState().keyBindings).map(([key, actionIndex]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-amber-200 w-8">Key {key}:</span>
                      <select
                        value={actionIndex}
                        onChange={(e) => useGameStore.getState().setKeyBinding(key, parseInt(e.target.value))}
                        className="p-1 bg-obsidian-800 border border-amber-900 rounded"
                      >
                        <option value={0}>Action 1</option>
                        <option value={1}>Action 2</option>
                        <option value={2}>Action 3</option>
                        <option value={3}>Action 4</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Theme</label>
                <select
                  value={useGameStore.getState().theme || 'default'}
                  onChange={(e) => useGameStore.getState().setTheme(e.target.value as any)}
                  className="w-full p-2 bg-obsidian-800 border border-amber-900 rounded"
                >
                  <option value="default">Default</option>
                  <option value="light">Light</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">Language</label>
                <select
                  value={useGameStore.getState().language || 'en'}
                  onChange={(e) => useGameStore.getState().setLanguage(e.target.value as any)}
                  className="w-full p-2 bg-obsidian-800 border border-amber-900 rounded"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}