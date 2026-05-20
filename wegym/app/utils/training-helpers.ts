import { TrainingModalityId, Exercise, DayPlan, ModalitySessionEntry } from '@/app/types/training';

export const formatClock = (totalSeconds: number): string => {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = remainingSeconds.toString().padStart(2, '0');

  return `${mStr}:${sStr}`;
};

export const formatDurationHMS = (totalSeconds: number): string => {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  
  if (hours > 0) {
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = remainingSeconds.toString().padStart(2, '0');
    
    return `${hours}:${mStr}:${sStr}`;
  }

  return formatClock(seconds);
};


export const parseKmInput = (input: string): number | null => {
  const sanitized = input.replace(',', '.').trim();
  
  if (!sanitized) return null;
  
  const numericValue = parseFloat(sanitized);
  const isValid = Number.isFinite(numericValue) && numericValue > 0;

  return isValid ? numericValue : null;
};

interface Suggestion {
  minTimeSec: number;
  maxTimeSec: number;
  minHint: string;
  maxHint: string;
}

export const getSuggestedTimeBlock = (
  km: number, 
  modality: TrainingModalityId
): Suggestion => {
  if (modality === 'running') {
    return {
      minTimeSec: Math.round(km * 4.5 * 60), 
      maxTimeSec: Math.round(km * 7.0 * 60), 
      minHint: '~4:30 /km',
      maxHint: '~7:00 /km'
    };
  }

  const SPEED_FAST = 32;
  const SPEED_SLOW = 18;

  return {
    minTimeSec: Math.round((km / SPEED_FAST) * 3600),
    maxTimeSec: Math.round((km / SPEED_SLOW) * 3600),
    minHint: `~${SPEED_FAST} km/h`,
    maxHint: `~${SPEED_SLOW} km/h`,
  };
};
