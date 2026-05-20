// src/components/ExerciseItem.tsx
import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Exercise } from '@/app/types/training';

interface Props {
  ex: Exercise;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export const ExerciseItem = memo(({ ex, isCompleted, onToggle }: Props) => (
  <div className="p-5 flex items-center justify-between border-b border-white/5 transition-all">
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => onToggle(ex.id)} 
        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all 
          ${isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-950 border-zinc-800 hover:border-orange-500'}`}
      >
        {isCompleted && <CheckCircle2 size={18} className="text-zinc-950" />}
      </button>
      
      <div>
        <p className={`font-black uppercase italic text-sm ${isCompleted ? 'text-zinc-600 line-through' : 'text-white'}`}>
          {ex.name}
        </p>
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
));

ExerciseItem.displayName = 'ExerciseItem';