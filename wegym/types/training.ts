// src/app/types/training.ts

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
  target: string;
  muscles: string[];
  duration: string;
  calories: string;
  exercises: Exercise[];
}

export interface ModalitySessionEntry {
  id: string;
  at: string;
  durationSec: number;
  distanceKm?: number;
}

export interface AIChatMessage {
  role: "user" | "ai";
  text: string;
}