
export function getSuggestedCardioBlock(km: number, modality: 'cycling' | 'running') {
  if (modality === 'running') {
    const minTimeSec = Math.round(km * 4.5 * 60);
    const maxTimeSec = Math.round(km * 7 * 60);
    return { minTimeSec, maxTimeSec, minHint: '~4:30 /km', maxHint: '~7:00 /km' };
  }

  const vFast = 32; 
  const vSlow = 18; 

  return {
    minTimeSec: Math.round((km / vFast) * 3600),
    maxTimeSec: Math.round((km / vSlow) * 3600),
    minHint: `~${vFast} km/h`,
    maxHint: `~${vSlow} km/h`,
  };
}