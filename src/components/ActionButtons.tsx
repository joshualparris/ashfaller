import { motion } from 'framer-motion';
import type { SceneAction } from '../data/scenes';
import { useGameStore } from '../store/gameStore';

interface ActionButtonsProps {
  sceneId: string;
  actions: SceneAction[];
  onActionSelect: (action: SceneAction, index: number) => void;
  disabled?: boolean;
}

export function ActionButtons({
  sceneId,
  actions,
  onActionSelect,
  disabled = false,
}: ActionButtonsProps) {
  const usedActions = useGameStore((state) => state.usedActions);

  // Defensive: handle case where persist may have stored as plain object
  const usedActionsSet =
    usedActions instanceof Set ? usedActions : new Set<string>();

  const getCostPreview = (action: SceneAction): string[] => {
    const costs = [];
    if (action.vitality && action.vitality < 0) costs.push(`−${Math.abs(action.vitality)} Vitality`);
    if (action.lantern && action.lantern < 0) costs.push(`−${Math.abs(action.lantern)} Lantern`);
    if (action.focus && action.focus < 0) costs.push(`−${Math.abs(action.focus)} Focus`);
    return costs;
  };

  return (
    <div className="glass-panel p-3">
      <div className="location-tag text-[10px] mb-2">CHOOSE YOUR ACTION</div>
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => {
          const actionKey = `${sceneId}-${index}`;
          const used = usedActionsSet.has(actionKey);
          const costs = getCostPreview(action);
          const costText = costs.length > 0 ? ` · ${costs.join(', ')}` : '';
          return (
            <motion.button
              key={index}
              className={`btn-action text-left ${
                used ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              aria-label={action.label}
              tabIndex={disabled || used ? -1 : 0}
              onClick={() => onActionSelect(action, index)}
              onKeyDown={(e) => {
                if (!used && !disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onActionSelect(action, index);
                }
              }}
              disabled={disabled || used}
              whileHover={!used ? { scale: 1.02 } : {}}
              whileTap={!used ? { scale: 0.98 } : {}}
              title={used ? 'Already used this action' : disabled ? 'Actions are temporarily disabled' : costs.join('\n')}
            >
              <span className="text-amber-500 font-bold mr-1">▸</span>
              {action.label}
              {costText && <span className="text-amber-700 text-sm">{costText}</span>}
              {used && <span className="text-gray-500 ml-2 text-xs">(used)</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
