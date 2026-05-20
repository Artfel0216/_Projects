import { DayPlan } from '@/app/types/training';

export const INITIAL_WEEKLY_PLAN: DayPlan[] = [
  { day: "Seg", target: "Push", muscles: ["Peito", "Ombros", "Tríceps"], duration: "65 min", calories: "480", exercises: [] },
  { day: "Ter", target: "Pull", muscles: ["Costas", "Bíceps"], duration: "70 min", calories: "510", exercises: [] },
  { day: "Qua", target: "Legs", muscles: ["Pernas", "Panturrilha"], duration: "75 min", calories: "600", exercises: [] },
  { day: "Qui", target: "Cardio e Core", muscles: ["Core"], duration: "40 min", calories: "300", exercises: [] },
  { day: "Sex", target: "Upper Body", muscles: ["Peito", "Costas", "Ombros"], duration: "60 min", calories: "450", exercises: [] },
  { day: "Sáb", target: "Lower Body", muscles: ["Pernas"], duration: "65 min", calories: "550", exercises: [] },
  { day: "Dom", target: "Descanso", muscles: [], duration: "0 min", calories: "0", exercises: [] },
];