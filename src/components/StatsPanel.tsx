import { motion } from 'framer-motion';

interface StatsPanelProps {
  vitality: number;
  maxVitality: number;
  focus: number;
  maxFocus: number;
  lanternCharge: number;
  maxLanternCharge: number;
  xp: number;
  xpToNextLevel: number;
  level: number;
}

export function StatsPanel({
  vitality,
  maxVitality,
  focus,
  maxFocus,
  lanternCharge,
  maxLanternCharge,
  xp,
  xpToNextLevel,
  level,
}: StatsPanelProps) {
  const vitalityPercent = (vitality / maxVitality) * 100;
  const focusPercent = (focus / maxFocus) * 100;
  const lanternPercent = (lanternCharge / maxLanternCharge) * 100;
  const xpPercent = (xp / xpToNextLevel) * 100;

  return (
    <div className="glass-panel p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-baseline pb-2 border-b border-amber-900/40">
        <div className="location-tag text-[10px]">STATUS</div>
        <div className="text-amber-300 text-lg font-bold">Lv {level}</div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* Vitality */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wide">Vitality</span>
            <span className="text-sm text-amber-300 font-mono">
              {Math.round(vitality)}/{maxVitality}
            </span>
          </div>
          <div className="stat-bar">
            <motion.div
              className="stat-bar-fill"
              animate={{ width: `${vitalityPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Focus */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wide">Focus</span>
            <span className="text-sm text-cyan-300 font-mono">
              {Math.round(focus)}/{maxFocus}
            </span>
          </div>
          <div className="stat-bar focus">
            <motion.div
              className="stat-bar-fill"
              animate={{ width: `${focusPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Lantern */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wide">Lantern</span>
            <span className="text-sm text-red-300 font-mono">
              {Math.round(lanternCharge)}/{maxLanternCharge}
            </span>
          </div>
          <div className="stat-bar lantern">
            <motion.div
              className="stat-bar-fill"
              animate={{ width: `${lanternPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wide">Experience</span>
            <span className="text-sm text-amber-300 font-mono">
              {Math.round(xp)}/{xpToNextLevel}
            </span>
          </div>
          <div className="stat-bar">
            <motion.div
              className="stat-bar-fill"
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
