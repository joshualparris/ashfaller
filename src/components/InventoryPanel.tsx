import type { InventoryItem } from '../store/gameStore';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface InventoryPanelProps {
  items: InventoryItem[];
  maxSize: number;
}

export function InventoryPanel({ items, maxSize }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="location-tag text-xs mb-4 pb-3 border-b border-amber-900/40">
        RELICS ({items.length}/{maxSize})
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-sm italic">No relics collected</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
          {items.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              className={`p-3 rounded border-2 cursor-pointer transition-all text-left ${
                selectedItem?.id === item.id
                  ? 'bg-amber-900/20 border-amber-400/60'
                  : 'bg-obsidian-800/40 border-obsidian-700/50 hover:border-amber-400/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`text-sm font-bold rarity-${item.rarity}`}>
                {item.name}
              </div>
              <div className={`text-xs mt-1 ${
                item.rarity === 'mythic' ? 'text-amber-400' :
                item.rarity === 'rare' ? 'text-blue-400' :
                item.rarity === 'uncommon' ? 'text-green-400' :
                'text-gray-500'
              }`}>
                [{item.rarity.toUpperCase()}]
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedItem && (
        <motion.div
          className="mt-4 p-4 rounded border-2 border-amber-400/50 bg-amber-900/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-sm text-amber-300 font-bold mb-2">
            {selectedItem.name}
          </div>
          <div className="text-xs text-amber-100/80 leading-relaxed">
            {selectedItem.description}
          </div>
          {selectedItem.effect && (
            <div className="mt-3 text-xs italic text-amber-200/90">
              <span className="font-semibold">Effect:</span> {selectedItem.effect}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
