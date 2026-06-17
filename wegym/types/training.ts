// src/app/types/training.ts
import type React from "react";

export type TrainingModalityId = 
  | 'gym' | 'cycling' | 'running' | 'aerobic' | 'combat' 
  | 'swimming' | 'walking' | 'crossfit' | 'yoga' | 'hiking' 
  | 'basketball' | 'soccer' | 'tennis' | 'climbing' | 'skate' 
  | 'functional' | 'hiit' | 'dance' | 'rowing' | 'other';

export interface Exercise {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  muscle: string;
  obs: string;
  gifUrl?: string;
}

export interface DayPlan {
  day: string;
  dayTKey?: string;
  target: string;
  targetTKey?: string;
  muscles: string[];
  duration: string;
  calories: string;
  exercises: Exercise[];
}

export interface GpsCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ModalitySessionEntry {
  id: string;
  at: string;
  durationSec: number;
  distanceKm?: number;
  avgPaceSecPerKm?: number;
  steps?: number;
  coordinates?: GpsCoordinate[];
}

export type ModalityOption = {
  id: string;
  label: string;
  tKey?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  showDistance?: boolean;
};

export interface AIChatMessage {
  role: "user" | "ai";
  text: string;
}