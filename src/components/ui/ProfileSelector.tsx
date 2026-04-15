import { motion } from 'framer-motion';

interface ProfileSelectorProps {
  currentProfile: string;
  onProfileChange: (profile: string) => void;
  onClose: () => void;
}

export function ProfileSelector({ currentProfile, onProfileChange, onClose }: ProfileSelectorProps) {
  const profiles = ['default', 'profile-1', 'profile-2', 'profile-3'];

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel p-6 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-amber-400 mb-4">Select Profile</h2>
        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile}
              onClick={() => {
                onProfileChange(profile);
                onClose();
                // Reload to apply new profile
                window.location.reload();
              }}
              className={`w-full p-3 rounded border text-left ${
                currentProfile === profile
                  ? 'bg-amber-900/20 border-amber-400/60 text-amber-300'
                  : 'bg-obsidian-800/40 border-obsidian-700/50 text-amber-200 hover:border-amber-400/40'
              }`}
            >
              <div className="font-bold">
                {profile === 'default' ? 'Default Profile' : `Profile ${profile.split('-')[1]}`}
              </div>
              <div className="text-sm opacity-70">
                {currentProfile === profile ? 'Currently active' : 'Click to switch'}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 btn-action w-full"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}