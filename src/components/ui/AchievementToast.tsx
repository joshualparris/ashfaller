import { motion } from 'framer-motion';

interface AchievementToastProps {
  achievement: {
    title: string;
    description: string;
  };
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <motion.div
      className="fixed top-4 right-4 z-60 max-w-sm"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
    >
      <div className="glass-panel p-4 border-l-4 border-amber-400">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-bold text-amber-400 mb-1">🏆 Achievement Unlocked!</div>
            <div className="font-bold text-amber-300">{achievement.title}</div>
            <div className="text-sm text-amber-200/80">{achievement.description}</div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 ml-2"
            aria-label="Close achievement notification"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}