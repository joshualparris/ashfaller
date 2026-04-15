import { motion } from 'framer-motion';
import type { Achievement, ExpeditionLogEntry } from '../store/gameStore';
import SCENES from '../data/scenes';

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
  const discoveredSceneList = Array.from(discoveredScenes)
    .map(sceneId => SCENES[sceneId])
    .filter(Boolean);

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalAchievements = achievements.length;

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
      </motion.div>
    </motion.div>
  );
}