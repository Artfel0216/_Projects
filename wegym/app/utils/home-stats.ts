import { MODALITY_OPTIONS } from '@/app/constants/modalities';
import { TrainingModalityId, ModalitySessionEntry } from '@/app/types/training';
import { HomeStats, ModalityStat, RecentSession, SessionsByModality } from '@/app/types/home';

const MODALITY_LABEL_MAP: Record<string, string> = MODALITY_OPTIONS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m.label }),
  {},
);

function dayKeyFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function startOfThisWeekIso(): number {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export function buildHomeStats(sessions: SessionsByModality): HomeStats {
  const perModality = new Map<TrainingModalityId, ModalityStat>();
  const dayKeys = new Set<string>();
  const allRecent: RecentSession[] = [];
  const weekStart = startOfThisWeekIso();

  let totalSessions = 0;
  let totalSec = 0;
  let totalKm = 0;
  let weekSessions = 0;
  let weekSec = 0;

  for (const id of Object.keys(sessions) as TrainingModalityId[]) {
    const list = sessions[id] ?? [];
    if (!Array.isArray(list) || list.length === 0) continue;

    const stat: ModalityStat = perModality.get(id) ?? {
      id,
      label: MODALITY_LABEL_MAP[id] ?? id,
      count: 0,
      totalSec: 0,
      totalKm: 0,
      lastAt: null,
    };

    for (const entry of list) {
      stat.count += 1;
      stat.totalSec += entry.durationSec ?? 0;
      stat.totalKm += entry.distanceKm ?? 0;
      if (!stat.lastAt || new Date(entry.at).getTime() > new Date(stat.lastAt).getTime()) {
        stat.lastAt = entry.at;
      }

      totalSessions += 1;
      totalSec += entry.durationSec ?? 0;
      totalKm += entry.distanceKm ?? 0;

      const dk = dayKeyFromIso(entry.at);
      if (dk) dayKeys.add(dk);

      const tsMs = new Date(entry.at).getTime();
      if (!Number.isNaN(tsMs) && tsMs >= weekStart) {
        weekSessions += 1;
        weekSec += entry.durationSec ?? 0;
      }

      allRecent.push({
        ...entry,
        modalityId: id,
        modalityLabel: stat.label,
      });
    }

    perModality.set(id, stat);
  }

  const topModalities = Array.from(perModality.values())
    .sort((a, b) => b.count - a.count || b.totalSec - a.totalSec)
    .slice(0, 5);

  const recentSessions = allRecent
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  return {
    totalSessions,
    totalSec,
    totalKm,
    activeDays: dayKeys.size,
    weekSessions,
    weekSec,
    favoriteModality: topModalities[0] ?? null,
    topModalities,
    recentSessions,
  };
}

export function readSessionsFromStorage(storageKey: string): SessionsByModality {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ModalitySessionEntry[]>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `há ${diffD} dias`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
