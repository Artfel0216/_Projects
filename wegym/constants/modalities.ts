import { 
  Dumbbell, Bike, Footprints, HeartPulse, Sword, 
  Waves, Mountain, Target, Trophy, Timer, 
  Flame, Trees, User, Users, Scaling, 
  Zap, Disc, Waves as SwimIcon, HelpCircle
} from 'lucide-react';

export const MODALITY_OPTIONS = [
  { id: 'gym', label: 'Musculação', tKey: 'modality.gym', Icon: Dumbbell, showDistance: false },
  { id: 'cycling', label: 'Ciclismo', tKey: 'modality.cycling', Icon: Bike, showDistance: true },
  { id: 'running', label: 'Corrida', tKey: 'modality.running', Icon: Footprints, showDistance: true },
  { id: 'aerobic', label: 'Aeróbico', tKey: 'modality.aerobic', Icon: HeartPulse, showDistance: false },
  { id: 'combat', label: 'Combate', tKey: 'modality.combat', Icon: Sword, showDistance: false },
  { id: 'swimming', label: 'Natação', tKey: 'modality.swimming', Icon: Waves, showDistance: true },
  { id: 'walking', label: 'Caminhada', tKey: 'modality.walking', Icon: Footprints, showDistance: true },
  { id: 'crossfit', label: 'Cross Training', tKey: 'modality.crossfit', Icon: Flame, showDistance: false },
  { id: 'yoga', label: 'Yoga & Pilates', tKey: 'modality.yoga', Icon: User, showDistance: false },
  { id: 'hiking', label: 'Trilha / Hiking', tKey: 'modality.hiking', Icon: Mountain, showDistance: true },
  { id: 'basketball', label: 'Basquete', tKey: 'modality.basketball', Icon: Trophy, showDistance: false },
  { id: 'soccer', label: 'Futebol', tKey: 'modality.soccer', Icon: Trophy, showDistance: false },
  { id: 'tennis', label: 'Tênis / Beach Tennis', tKey: 'modality.tennis', Icon: Target, showDistance: false },
  { id: 'climbing', label: 'Escalada', tKey: 'modality.climbing', Icon: Scaling, showDistance: false },
  { id: 'skate', label: 'Skate / Patins', tKey: 'modality.skate', Icon: Disc, showDistance: true },
  { id: 'functional', label: 'Funcional', tKey: 'modality.functional', Icon: Zap, showDistance: false },
  { id: 'hiit', label: 'HIIT', tKey: 'modality.hiit', Icon: Timer, showDistance: false },
  { id: 'dance', label: 'Dança', tKey: 'modality.dance', Icon: Users, showDistance: false },
  { id: 'rowing', label: 'Remo', tKey: 'modality.rowing', Icon: Waves, showDistance: true },
  { id: 'other', label: 'Outros', tKey: 'modality.other', Icon: HelpCircle, showDistance: false },
];