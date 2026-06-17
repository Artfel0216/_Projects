"use client";

import React, { useRef, useState } from 'react';
import type { GpsSnapshot } from '@/hooks/use-gps-tracker';
import html2canvas from 'html2canvas';
import RouteMap from './RouteMap';

interface GpsSessionResultProps {
  snapshot: GpsSnapshot;
  targetTimes: { minSec: number; avgSec: number; maxSec: number } | null;
  targetKm: number;
  selectedTarget: 'min' | 'avg' | 'max' | null;
  onSave: () => void;
  onDiscard: () => void;
  t: (key: string, fallback?: string) => string;
}

function formatPace(secPerKm: number): string {
  if (secPerKm <= 0) return '—';
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const TARGET_LABELS: Record<string, { color: string; labelKey: string }> = {
  min: { color: 'text-emerald-400', labelKey: 'training.minTime' },
  avg: { color: 'text-zinc-400', labelKey: 'training.avgTime' },
  max: { color: 'text-amber-400', labelKey: 'training.maxTime' },
};

export default function GpsSessionResult({ snapshot, targetTimes, targetKm, selectedTarget, onSave, onDiscard, t }: GpsSessionResultProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  const withinMax = targetTimes ? snapshot.durationSec <= targetTimes.maxSec : false;
  const withinAvg = targetTimes ? snapshot.durationSec <= targetTimes.avgSec : false;
  const withinMin = targetTimes ? snapshot.durationSec <= targetTimes.minSec : false;

  let achievement: { label: string; emoji: string; color: string } | null = null;
  if (withinMin && targetTimes) {
    achievement = { label: t('training.achievementElite'), emoji: '🏆', color: 'text-yellow-400' };
  } else if (withinAvg && targetTimes) {
    achievement = { label: t('training.achievementGreat'), emoji: '💪', color: 'text-emerald-400' };
  } else if (withinMax && targetTimes) {
    achievement = { label: t('training.achievementGood'), emoji: '👏', color: 'text-orange-400' };
  }

  const targetLabel = selectedTarget ? TARGET_LABELS[selectedTarget] : null;
  const selectedTargetSec = selectedTarget && targetTimes ? targetTimes[`${selectedTarget}Sec`] : null;

  const handleShare = async () => {
    setSharing(true);
    try {
      const card = cardRef.current;
      if (!card) return;
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: '#09090b',
        allowTaint: false,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      if (navigator.share && navigator.canShare({ files: [new File([blob], 'wegym-treino.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'WEGYM',
          text: `${t('training.shareText')} ${snapshot.distanceKm}km ${formatPace(snapshot.avgPaceSecPerKm)}`,
          files: [new File([blob], 'wegym-treino.png', { type: 'image/png' })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wegym-${snapshot.distanceKm}km.png`;
        a.click();
        URL.revokeObjectURL(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // user cancelled or share failed
    }
    setSharing(false);
  };

  return (
    <div className="fixed inset-0 z-110 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <div ref={cardRef} className="bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="p-6 pb-3 text-center">
            {achievement ? (
              <>
                <p className="text-4xl mb-1">{achievement.emoji}</p>
                <p className={`text-lg font-black uppercase italic ${achievement.color}`}>{achievement.label}</p>
              </>
            ) : targetTimes ? (
              <p className="text-zinc-400 text-sm font-bold">{t('training.resultCompleted')}</p>
            ) : (
              <p className="text-lg font-black uppercase italic text-white">{t('training.sessionResult')}</p>
            )}
          </div>

          <div className="px-6 py-3">
            <div className="bg-zinc-950 rounded-3xl p-3 border border-white/5">
              <div className="w-full rounded-2xl overflow-hidden" style={{ height: 180 }}>
                <RouteMap coordinates={snapshot.coordinates} height={180} interactive={false} />
              </div>
            </div>
          </div>

          <div className="px-6 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-zinc-950 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-zinc-500">{t('training.resultDistance')}</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {snapshot.distanceKm.toFixed(2)}
                  <span className="text-[9px] text-orange-500 ml-0.5">km</span>
                </p>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-zinc-500">{t('training.resultPace')}</p>
                <p className="text-lg font-black text-white mt-0.5 font-mono">
                  {formatPace(snapshot.avgPaceSecPerKm)}
                </p>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-zinc-500">{t('training.resultSteps')}</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {snapshot.steps.toLocaleString()}
                </p>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-3 border border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-zinc-500">{t('training.resultDuration')}</p>
                <p className="text-lg font-black text-white mt-0.5 font-mono">
                  {formatDuration(snapshot.durationSec)}
                </p>
              </div>
            </div>

            {targetTimes && (
              <div className="bg-zinc-950 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black uppercase text-zinc-500 mb-2">{t('training.resultTarget')}</p>
                <div className="space-y-1.5">
                  {(Object.entries(TARGET_LABELS) as [string, { color: string; labelKey: string }][]).map(([key, cfg]) => {
                    const sec = targetTimes[`${key}Sec` as keyof typeof targetTimes] as number;
                    const isSelected = key === selectedTarget;
                    return (
                      <div key={key} className={`flex justify-between items-center ${isSelected ? 'bg-orange-600/10 rounded-lg px-2 py-1 -mx-2' : ''}`}>
                        <span className={`text-[10px] font-bold ${cfg.color}`}>
                          {isSelected ? '▶ ' : ''}{t(cfg.labelKey)}
                        </span>
                        <span className={`text-xs font-mono ${isSelected ? 'text-white font-black' : 'text-zinc-300'}`}>
                          {formatDuration(sec)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t border-white/5 pt-1.5 mt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-orange-500 font-bold">{t('training.resultTime')}</span>
                      <span className="text-xs font-mono text-white font-black">{formatDuration(snapshot.durationSec)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="w-full py-3.5 rounded-xl font-black uppercase italic text-sm bg-white text-black hover:bg-orange-500 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <>✅ {t('common.saved')}</>
              ) : (
                <>{t('training.shareResult')}</>
              )}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDiscard}
                className="flex-1 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                {t('training.discardResult')}
              </button>
              <button
                type="button"
                onClick={onSave}
                className="flex-1 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 transition-all cursor-pointer"
              >
                {t('training.saveResult')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
