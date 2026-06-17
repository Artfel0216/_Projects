import { TrainingModalityId, ModalitySessionEntry } from './training';

export type SessionsByModality = Partial<Record<TrainingModalityId, ModalitySessionEntry[]>>;

export interface ModalityStat {
  id: TrainingModalityId;
  label: string;
  count: number;
  totalSec: number;
  totalKm: number;
  lastAt: string | null;
}

export interface RecentSession extends ModalitySessionEntry {
  modalityId: TrainingModalityId;
  modalityLabel: string;
}

export interface HomeStats {
  totalSessions: number;
  totalSec: number;
  totalKm: number;
  activeDays: number;
  weekSessions: number;
  weekSec: number;
  favoriteModality: ModalityStat | null;
  topModalities: ModalityStat[];
  recentSessions: RecentSession[];
}
