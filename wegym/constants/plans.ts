import { DayPlan } from '@/types/training';

export const INITIAL_WEEKLY_PLAN: DayPlan[] = [
  { day: "Seg", dayTKey: "days.mon", target: "Push", targetTKey: "planDayTarget.push", muscles: ["Peito", "Ombros", "Tríceps"], duration: "65 min", calories: "480", exercises: [] },
  { day: "Ter", dayTKey: "days.tue", target: "Pull", targetTKey: "planDayTarget.pull", muscles: ["Costas", "Bíceps"], duration: "70 min", calories: "510", exercises: [] },
  { day: "Qua", dayTKey: "days.wed", target: "Legs", targetTKey: "planDayTarget.legs", muscles: ["Pernas", "Panturrilha"], duration: "75 min", calories: "600", exercises: [] },
  { day: "Qui", dayTKey: "days.thu", target: "Cardio e Core", targetTKey: "planDayTarget.cardioCore", muscles: ["Core"], duration: "40 min", calories: "300", exercises: [] },
  { day: "Sex", dayTKey: "days.fri", target: "Upper Body", targetTKey: "planDayTarget.upperBody", muscles: ["Peito", "Costas", "Ombros"], duration: "60 min", calories: "450", exercises: [] },
  { day: "Sáb", dayTKey: "days.sat", target: "Lower Body", targetTKey: "planDayTarget.lowerBody", muscles: ["Pernas"], duration: "65 min", calories: "550", exercises: [] },
  { day: "Dom", dayTKey: "days.sun", target: "Descanso", targetTKey: "planDayTarget.rest", muscles: [], duration: "0 min", calories: "0", exercises: [] },
];