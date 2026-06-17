import { memo, useState } from 'react';
import { CheckCircle2, X, Play } from 'lucide-react';
import { Exercise } from '@/types/training';
import { getExerciseGifUrl } from '@/lib/exercise-gif';

interface Props {
  ex: Exercise;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export const ExerciseItem = memo(({ ex, isCompleted, onToggle }: Props) => {
  const [showGif, setShowGif] = useState(false);
  const gifUrl = ex.gifUrl || getExerciseGifUrl(ex.name);

  const handleToggle = () => {
    onToggle(ex.id);
    if (!isCompleted && gifUrl) {
      setShowGif(true);
    }
  };

  return (
    <>
      <div className="p-5 flex items-center justify-between border-b border-white/5 transition-all">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer
              ${isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-950 border-zinc-800 hover:border-orange-500'}`}
          >
            {isCompleted ? (
              <CheckCircle2 size={18} className="text-zinc-950" />
            ) : (
              gifUrl && <Play size={14} className="text-zinc-500" />
            )}
          </button>

          <div>
            <button
              onClick={() => gifUrl && setShowGif(true)}
              className={`font-black uppercase italic text-sm text-left cursor-pointer ${isCompleted ? 'text-zinc-600 line-through' : 'text-white hover:text-orange-400'} ${gifUrl ? '' : 'cursor-default'}`}
              title={gifUrl ? 'Ver demonstração' : undefined}
            >
              {ex.name}
            </button>
            <p className="text-[10px] text-orange-500 font-bold">
              {ex.muscle} • {ex.sets}x{ex.reps}
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="number"
            placeholder="0"
            className="bg-zinc-900 border border-white/10 w-16 p-2 rounded-lg text-xs font-bold text-center outline-none focus:border-orange-500 text-white"
          />
          <span className="absolute -top-3 left-0 text-[8px] text-zinc-500 uppercase">Peso</span>
        </div>
      </div>

      {showGif && gifUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowGif(false)}
        >
          <div
            className="relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGif(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
            <div className="bg-zinc-950 p-4 border-b border-white/5">
              <p className="font-black uppercase italic text-sm text-white">{ex.name}</p>
              <p className="text-[10px] text-orange-500 font-bold mt-0.5">{ex.muscle} • {ex.sets}x{ex.reps}</p>
            </div>
            <div className="bg-zinc-900 flex items-center justify-center p-2">
              <img
                src={gifUrl}
                alt={ex.name}
                className="w-full h-auto max-h-[50vh] object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2318181b"/><text x="100" y="100" font-family="sans-serif" font-size="14" fill="%2352525b" text-anchor="middle" dominant-baseline="middle">GIF indisponível</text></svg>';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ExerciseItem.displayName = 'ExerciseItem';