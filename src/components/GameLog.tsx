import { useEffect, useRef } from 'react';
import type { GameLog as GameLogEntry } from '../store/gameStore';

interface GameLogProps {
  entries: GameLogEntry[];
}

export function GameLog({ entries }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div ref={scrollRef} className="h-full min-h-0 overflow-y-auto pr-3 font-sans text-sm">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`log-entry ${entry.type}`}
        >
          {entry.text}
        </div>
      ))}
    </div>
  );
}
