import { NextResponse } from "next/server";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const MEAL_LIBRARY = {
  breakfast: ["Ovos mexidos com pão integral e fruta", "Iogurte natural com aveia, banana e chia", "Panqueca de aveia com pasta de amendoim e morangos", "Tapioca com queijo branco e omelete leve"],
  morningSnack: ["Fruta da estação com castanhas", "Iogurte natural com granola sem açúcar", "Sanduíche integral pequeno de ricota", "Vitamina de banana com aveia"],
  lunch: ["Frango grelhado com arroz integral, feijão e salada", "Peixe assado com batata-doce e legumes refogados", "Patinho moído com quinoa e mix de vegetais", "Filé de frango com macarrão integral e salada verde"],
  afternoonSnack: ["Iogurte proteico com fruta", "Sanduíche integral com peito de peru", "Omelete rápida com legumes", "Torradas integrais com cottage"],
  dinner: ["Peixe grelhado com purê de batata-doce e salada", "Frango desfiado com legumes e arroz integral", "Carne magra com legumes no vapor", "Omelete completo com salada e quinoa"],
  supper: ["Iogurte natural com chia", "Leite semidesnatado com cacau e aveia", "Omelete leve de claras", "Queijo branco com fruta pequena"]
} as const;

const OBJECTIVE_CONFIG = {
  hipertrofia: { count: 6, label: "Hipertrofia" },
  emagrecimento: { count: 5, label: "Emagrecimento" },
  manutencao: { count: 5, label: "Manutenção" }
} as const;

function splitTokens(value?: string): string[] {
  if (!value) return [];
  return value.toLowerCase().split(/[,\n;]+/).map(i => i.trim()).filter(Boolean);
}

function pickOption(options: readonly string[], dayIndex: number, offset: number, avoidList: string[]): string {
  const filtered = avoidList.length 
    ? options.filter(opt => !avoidList.some(avoid => opt.toLowerCase().includes(avoid)))
    : options;
  const source = filtered.length > 0 ? filtered : options;
  return source[(dayIndex + offset) % source.length];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const avoidList = splitTokens(`${body.avoidFoods || ""},${body.dietaryAllergy || ""}`);
    const prefs = splitTokens(body.favoriteFoods || "").slice(0, 3).join(", ");
    const config = OBJECTIVE_CONFIG[body.objective as keyof typeof OBJECTIVE_CONFIG] || OBJECTIVE_CONFIG.manutencao;

    const week = DAYS.reduce((acc: any, day, dayIdx) => {
      const isFreeMeal = body.freeMealDay === day;
      
      const meals = [
        { time: "07:00", title: "Café da manhã", foods: `${pickOption(MEAL_LIBRARY.breakfast, dayIdx, 0, avoidList)}.${prefs ? ` Preferências: ${prefs}.` : ""}`, prep: "Prepare com temperos naturais." },
        { time: "10:00", title: "Lanche da manhã", foods: pickOption(MEAL_LIBRARY.morningSnack, dayIdx, 1, avoidList), prep: "Porcione com antecedência." },
        { time: "13:00", title: "Almoço", foods: pickOption(MEAL_LIBRARY.lunch, dayIdx, 2, avoidList), prep: "Priorize proteína magra e vegetais." },
        { time: "16:30", title: "Lanche da tarde", foods: pickOption(MEAL_LIBRARY.afternoonSnack, dayIdx, 3, avoidList), prep: "Foco em saciedade e proteína." },
        { time: "20:00", title: "Jantar", foods: pickOption(MEAL_LIBRARY.dinner, dayIdx, 4, avoidList), prep: "Evite frituras, prefira grelhados." },
        { time: "22:30", title: "Ceia", foods: pickOption(MEAL_LIBRARY.supper, dayIdx, 5, avoidList), prep: "Opção de fácil digestão." }
      ].slice(0, config.count);

      if (isFreeMeal && body.freeMealSlot) {
        const idx = meals.findIndex(m => m.title === body.freeMealSlot);
        if (idx !== -1) {
          meals[idx].foods = "Refeição livre.";
          meals[idx].prep = "Equilíbrio é a chave.";
        }
      }

      acc[day] = {
        objectiveLabel: config.label,
        notes: [
          `Restrições: ${body.dietaryRestriction || "Nenhuma"}`,
          `Alergias: ${body.dietaryAllergy || "Nenhuma"}`,
          isFreeMeal ? `Refeição livre hoje: ${body.freeMealSlot}` : "Rotina normal"
        ],
        meals
      };
      return acc;
    }, {});

    return NextResponse.json({ week });
  } catch {
    return NextResponse.json({ error: "Erro na geração." }, { status: 500 });
  }
}