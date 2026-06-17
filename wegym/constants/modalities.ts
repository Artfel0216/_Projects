import { 
  Dumbbell, Bike, Footprints, HeartPulse, Sword, 
  Waves, Mountain, Target, Trophy, Timer, 
  Flame, Trees, User, Users, Scaling, 
  Zap, Disc, Waves as SwimIcon, HelpCircle
} from 'lucide-react';

export const MODALITY_OPTIONS = [
  { id: 'gym', label: 'Musculação', Icon: Dumbbell, showDistance: false },
  { id: 'cycling', label: 'Ciclismo', Icon: Bike, showDistance: true },
  { id: 'running', label: 'Corrida', Icon: Footprints, showDistance: true },
  { id: 'aerobic', label: 'Aeróbico', Icon: HeartPulse, showDistance: false },
  { id: 'combat', label: 'Combate', Icon: Sword, showDistance: false },
  { id: 'swimming', label: 'Natação', Icon: Waves, showDistance: true },
  { id: 'walking', label: 'Caminhada', Icon: Footprints, showDistance: true },
  { id: 'crossfit', label: 'Cross Training', Icon: Flame, showDistance: false },
  { id: 'yoga', label: 'Yoga & Pilates', Icon: User, showDistance: false },
  { id: 'hiking', label: 'Trilha / Hiking', Icon: Mountain, showDistance: true },
  { id: 'basketball', label: 'Basquete', Icon: Trophy, showDistance: false },
  { id: 'soccer', label: 'Futebol', Icon: Trophy, showDistance: false },
  { id: 'tennis', label: 'Tênis / Beach Tennis', Icon: Target, showDistance: false },
  { id: 'climbing', label: 'Escalada', Icon: Scaling, showDistance: false },
  { id: 'skate', label: 'Skate / Patins', Icon: Disc, showDistance: true },
  { id: 'functional', label: 'Funcional', Icon: Zap, showDistance: false },
  { id: 'hiit', label: 'HIIT', Icon: Timer, showDistance: false },
  { id: 'dance', label: 'Dança', Icon: Users, showDistance: false },
  { id: 'rowing', label: 'Remo', Icon: Waves, showDistance: true },
  { id: 'other', label: 'Outros', Icon: HelpCircle, showDistance: false },
];