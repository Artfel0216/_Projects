"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { GpsCoordinate } from '@/types/training';

function haversineKm(c1: GpsCoordinate, c2: GpsCoordinate): number {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateSteps(distanceKm: number, modality: string): number {
  const strideMeters =
    modality === 'walking' ? 0.75 :
    modality === 'hiking' ? 0.70 :
    0.90;
  return Math.round((distanceKm * 1000) / strideMeters);
}

function computeDistance(coords: GpsCoordinate[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return total;
}

export type GpsState = 'idle' | 'tracking' | 'stopped';

export interface GpsSnapshot {
  distanceKm: number;
  avgPaceSecPerKm: number;
  steps: number;
  durationSec: number;
  coordinates: GpsCoordinate[];
}

export function useGpsTracker(modality: string) {
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSnapshot, setGpsSnapshot] = useState<GpsSnapshot | null>(null);

  const [liveDistKm, setLiveDistKm] = useState(0);
  const [livePace, setLivePace] = useState(0);
  const [liveSteps, setLiveSteps] = useState(0);
  const [liveSec, setLiveSec] = useState(0);
  const [liveCoordinates, setLiveCoordinates] = useState<GpsCoordinate[]>([]);

  const watchIdRef = useRef<number | null>(null);
  const coordsRef = useRef<GpsCoordinate[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStats = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const roundedSec = Math.round(elapsed);
    setLiveSec(roundedSec);

    const coords = coordsRef.current;
    if (coords.length < 2) return;

    const dist = computeDistance(coords);
    const roundedDist = Math.round(dist * 100) / 100;
    const pace = dist > 0 ? roundedSec / dist : 0;
    setLiveDistKm(roundedDist);
    setLivePace(Math.round(pace));
    setLiveSteps(estimateSteps(dist, modality));
  }, [modality]);

  const startGps = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não suportado neste dispositivo.');
      return;
    }

    setGpsError(null);
    setGpsSnapshot(null);
    setLiveDistKm(0);
    setLivePace(0);
    setLiveSteps(0);
    setLiveSec(0);
    setLiveCoordinates([]);
    coordsRef.current = [];
    startTimeRef.current = Date.now();

    // timer MUST start before await — permissions.query can hang on some browsers
    timerRef.current = setInterval(updateStats, 1000);
    setGpsState('tracking');

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        coordsRef.current.push({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        });
        setLiveCoordinates([...coordsRef.current]);
        updateStats();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permissão de localização negada.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Localização indisponível. Tente em área aberta.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Tempo de busca de GPS excedido. Tente novamente.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
    );

    watchIdRef.current = watchId;
  }, [updateStats]);

  const stopGps = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    updateStats();

    const snapshot: GpsSnapshot = {
      distanceKm: liveDistKm,
      avgPaceSecPerKm: livePace,
      steps: liveSteps,
      durationSec: liveSec,
      coordinates: coordsRef.current,
    };

    setGpsSnapshot(snapshot);
    setGpsState('stopped');
    return snapshot;
  }, [liveDistKm, livePace, liveSteps, liveSec, updateStats]);

  const resetGps = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    coordsRef.current = [];
    startTimeRef.current = 0;
    setLiveDistKm(0);
    setLivePace(0);
    setLiveSteps(0);
    setLiveSec(0);
    setLiveCoordinates([]);
    setGpsState('idle');
    setGpsError(null);
    setGpsSnapshot(null);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    gpsState,
    gpsError,
    gpsSnapshot,
    liveDistKm,
    livePace,
    liveSteps,
    liveSec,
    liveCoordinates,
    startGps,
    stopGps,
    resetGps,
  };
}
