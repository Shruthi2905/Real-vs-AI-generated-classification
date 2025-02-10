import { Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="w-6 h-6 text-pink animate-pulse" />
      <span className="text-xl font-bold bg-gradient-to-r from-pink via-pink-light to-pink bg-clip-text text-transparent">
        Truth-Behind-Pixels
      </span>
    </div>
  );
}