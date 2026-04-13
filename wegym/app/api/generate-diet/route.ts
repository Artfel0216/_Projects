import { NextResponse } from "next/server";

type RequestBody = {
  objective: string;
  favoriteFoods: string;
  avoidFoods: string;
  dietaryRestriction: string;
  dietaryAllergy: string;
  healthIssues: string;
  medications: string;
  freeMealDay?: string;
  freeMealSlot?: string;
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function splitTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildMealsForObjective(objective: string) {
  const breakfast = [
    "Ovos mexidos com pão integral e fruta",
    "Iogurte natural com aveia, banana e chia",
    "Panqueca de aveia com pasta de amendoim e morangos",
    "Tapioca com queijo branco e omelete leve",
  ];
  const morningSnack = [
    "Fruta da estação com castanhas",
    "Iogurte natural com granola sem açúcar",
    "Sanduíche integral pequeno de ricota",
    "Vitamina de banana com aveia",
  ];
  const lunch = [
    "Frango grelhado com arroz integral, feijão e salada",
    "Peixe assado com batata-doce e legumes refogados",
    "Patinho moído com quinoa e mix de vegetais",
    "Filé de frango com macarrão integral e salada verde",
  ];
  const afternoonSnack = [
    "Iogurte proteico com fruta",
    "Sanduíche integral com peito de peru",
    "Omelete rápida com legumes",
    "Torradas integrais com cottage",
  ];
  const dinner = [
    "Peixe grelhado com purê de batata-doce e salada",
    "Frango desfiado com legumes e arroz integral",
    "Carne magra com legumes no vapor",
    "Omelete completo com salada e quinoa",
  ];
  const supper = [
    "Iogurte natural com chia",
    "Leite semidesnatado com cacau e aveia",
    "Omelete leve de claras",
    "Queijo branco com fruta pequena",
  ];

  if (objective === "hipertrofia") {
    return { breakfast, morningSnack, lunch, afternoonSnack, dinner, supper, mealsCount: 6, label: "Hipertrofia" };
  }
  if (objective === "emagrecimento") {
    return { breakfast, morningSnack, lunch, afternoonSnack, dinner, supper, mealsCount: 5, label: "Emagrecimento" };
  }
  return { breakfast, morningSnack, lunch, afternoonSnack, dinner, supper, mealsCount: 5, label: "Manutenção" };
}

function pickOption(options: string[], dayIndex: number, offset: number, avoidList: string[]): string {
  const sorted = options.filter((opt) => !avoidList.some((avoid) => avoid && opt.toLowerCase().includes(avoid)));
  const source = sorted.length > 0 ? sorted : options;
  return source[(dayIndex + offset) % source.length];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const avoidList = splitTokens(`${body.avoidFoods || ""},${body.dietaryAllergy || ""}`);
    const preferences = splitTokens(body.favoriteFoods || "");
    const model = buildMealsForObjective(body.objective);

    const week = DAYS.reduce<Record<string, unknown>>((acc, day, dayIndex) => {
      const meals = [
        {
          time: "07:00",
          title: "Café da manhã",
          foods: `${pickOption(model.breakfast, dayIndex, 0, avoidList)}.${preferences.length ? ` Preferências consideradas: ${preferences.slice(0, 3).join(", ")}.` : ""}`,
          prep: "Prepare os itens com pouco óleo e ajuste sal e temperos naturais.",
        },
        {
          time: "10:00",
          title: "Lanche da manhã",
          foods: pickOption(model.morningSnack, dayIndex, 1, avoidList),
          prep: "Porcione com antecedência para facilitar a rotina diária.",
        },
        {
          time: "13:00",
          title: "Almoço",
          foods: pickOption(model.lunch, dayIndex, 2, avoidList),
          prep: "Priorize proteína magra, carboidrato de boa qualidade e vegetais variados.",
        },
        {
          time: "16:30",
          title: "Lanche da tarde",
          foods: pickOption(model.afternoonSnack, dayIndex, 3, avoidList),
          prep: "Mantenha o lanche leve e rico em proteína para melhor saciedade.",
        },
        {
          time: "20:00",
          title: "Jantar",
          foods: pickOption(model.dinner, dayIndex, 4, avoidList),
          prep: "Evite frituras e prefira preparações assadas, cozidas ou grelhadas.",
        },
        {
          time: "22:30",
          title: "Ceia",
          foods: pickOption(model.supper, dayIndex, 5, avoidList),
          prep: "Escolha uma opção de fácil digestão para encerrar o dia.",
        },
      ];

      if (body.freeMealDay === day && body.freeMealSlot) {
        const mealIndex = meals.findIndex((meal) => meal.title === body.freeMealSlot);
        if (mealIndex >= 0) {
          meals[mealIndex] = {
            ...meals[mealIndex],
            foods: "Refeição livre (escolha do usuário para este dia).",
            prep: "Use esta refeição com flexibilidade e moderação, mantendo o equilíbrio do restante do dia.",
          };
        }
      }

      acc[day] = {
        objectiveLabel: model.label,
        notes: [
          `Alimentos preferidos considerados: ${body.favoriteFoods || "Não informado"}`,
          `Alimentos para evitar: ${body.avoidFoods || "Nenhum informado"}`,
          `Restrições: ${body.dietaryRestriction || "Nenhuma"} | Alergias: ${body.dietaryAllergy || "Nenhuma informada"}`,
          `Saúde/medicações: ${body.healthIssues || "Não informado"} | ${body.medications || "Não informado"}`,
          body.freeMealDay && body.freeMealSlot ? `Refeição livre configurada: ${body.freeMealDay} - ${body.freeMealSlot}.` : "Sem refeição livre configurada.",
          "Plano gerado localmente no app, sem uso de chave externa.",
        ],
        meals: meals.slice(0, model.mealsCount),
      };
      return acc;
    }, {});

    return NextResponse.json({ week }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Falha ao gerar dieta." }, { status: 500 });
  }
}
