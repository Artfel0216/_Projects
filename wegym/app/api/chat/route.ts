import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    const msg = message.toLowerCase();

    const library: Record<string, any[]> = {
      peito: [
        { name: "Supino Reto (Barra)", sets: 4, reps: "10-12", load: "Até a falha" },
        { name: "Supino Inclinado (Halteres)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Crucifixo Reto (Halteres)", sets: 3, reps: "15", load: "Leve/Moderado" },
        { name: "Crossover Polia Alta", sets: 4, reps: "15", load: "Controle" },
        { name: "Peck Deck (Voador)", sets: 3, reps: "12-15", load: "Progressivo" },
        { name: "Flexão de Braços (Push-up)", sets: 3, reps: "Máximo", load: "Corpo" },
        { name: "Supino Declinado", sets: 3, reps: "10", load: "Pesado" },
        { name: "Dips (Paralelas - Foco Peito)", sets: 3, reps: "10", load: "Corpo" },
        { name: "Supino Reto (Halteres)", sets: 4, reps: "10", load: "Pesado" },
        { name: "Supino Inclinado (Barra)", sets: 3, reps: "10", load: "Pesado" },
        { name: "Crucifixo Inclinado (Halteres)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Crossover Polia Baixa", sets: 3, reps: "15", load: "Controle" },
        { name: "Chest Press Máquina (Sentado)", sets: 4, reps: "12", load: "Progressivo" },
        { name: "Flexão Inclinada", sets: 3, reps: "15", load: "Corpo" },
        { name: "Flexão Declinada", sets: 3, reps: "12", load: "Corpo" },
        { name: "Pull-over com Halter", sets: 3, reps: "12", load: "Moderado" },
        { name: "Landmine Press (Peito)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Aperto Isométrico de Anilhas", sets: 3, reps: "30s", load: "Anilha" }
      ],
      costas: [
        { name: "Levantamento Terra (Deadlift)", sets: 3, reps: "6-8", load: "Pesado" },
        { name: "Barra Fixa (Pull-up)", sets: 3, reps: "Máximo", load: "Corpo" },
        { name: "Puxada Aberta no Pulley", sets: 4, reps: "12", load: "Moderado" },
        { name: "Remada Curvada (Barra)", sets: 4, reps: "10", load: "Pesado" },
        { name: "Remada Cavalinho", sets: 3, reps: "10", load: "Pesado" },
        { name: "Remada Unilateral (Serrote)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Pulldown com Corda", sets: 3, reps: "15", load: "Leve" },
        { name: "Puxada com Triângulo", sets: 3, reps: "12", load: "Moderado" },
        { name: "Remada Baixa Sentada", sets: 4, reps: "12", load: "Moderado" },
        { name: "Remada Máquina Articulada", sets: 3, reps: "10", load: "Pesado" },
        { name: "Face Pull (Foco Posterior)", sets: 3, reps: "15", load: "Leve" },
        { name: "Chin-up (Barra Supinada)", sets: 3, reps: "8", load: "Corpo" },
        { name: "Remada Pendlay", sets: 3, reps: "8", load: "Pesado" },
        { name: "Puxada Renegade", sets: 3, reps: "10", load: "Halteres" },
        { name: "Crucifixo Inverso no Cabo", sets: 3, reps: "15", load: "Controle" },
        { name: "Good Morning (Bom Dia)", sets: 3, reps: "12", load: "Leve" },
        { name: "Extensão Lombar (Banco Romano)", sets: 3, reps: "15", load: "Peso/Anilha" }
      ],
      pernas: [
        { name: "Agachamento Livre", sets: 4, reps: "8-10", load: "Pesado" },
        { name: "Leg Press 45º", sets: 4, reps: "12-15", load: "Pesado" },
        { name: "Cadeira Extensora", sets: 4, reps: "15", load: "Isolado" },
        { name: "Stiff (RDL)", sets: 4, reps: "10", load: "Moderado" },
        { name: "Mesa Flexora", sets: 4, reps: "12", load: "Moderado" },
        { name: "Agachamento Búlgaro", sets: 3, reps: "10", load: "Moderado" },
        { name: "Elevação Pélvica", sets: 4, reps: "10", load: "Pesado" },
        { name: "Agachamento Sumô", sets: 3, reps: "12", load: "Moderado" },
        { name: "Cadeira Flexora", sets: 3, reps: "15", load: "Isolado" },
        { name: "Afundo/Passada", sets: 3, reps: "20 passos", load: "Halteres" },
        { name: "Agachamento Hack", sets: 3, reps: "12", load: "Pesado" },
        { name: "Cadeira Abdutora", sets: 3, reps: "20", load: "Moderado" },
        { name: "Cadeira Adutora", sets: 3, reps: "20", load: "Moderado" },
        { name: "Gêmeos Sentado", sets: 4, reps: "15", load: "Moderado" },
        { name: "Gêmeos em Pé", sets: 4, reps: "15", load: "Pesado" },
        { name: "Flexão Nórdica", sets: 3, reps: "8", load: "Corpo" },
        { name: "Step Up (Subida no Banco)", sets: 3, reps: "12", load: "Moderado" }
      ],
      ombros: [
        { name: "Desenvolvimento Militar (Barra)", sets: 4, reps: "8", load: "Pesado" },
        { name: "Desenvolvimento Halteres", sets: 4, reps: "10", load: "Moderado" },
        { name: "Elevação Lateral (Halter)", sets: 4, reps: "15", load: "Leve" },
        { name: "Elevação Lateral (Cabo)", sets: 3, reps: "15", load: "Controle" },
        { name: "Elevação Frontal", sets: 3, reps: "12", load: "Moderado" },
        { name: "Crucifixo Inverso (Halter)", sets: 4, reps: "15", load: "Leve" },
        { name: "Desenvolvimento Arnold", sets: 3, reps: "10", load: "Moderado" },
        { name: "Remada Alta (Cabo/Barra)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Encolhimento Halteres", sets: 4, reps: "12", load: "Pesado" }
      ],
      braços: [
        { name: "Rosca Direta (Barra W)", sets: 3, reps: "10", load: "Moderado" },
        { name: "Rosca Martelo", sets: 3, reps: "12", load: "Moderado" },
        { name: "Rosca Scott", sets: 3, reps: "10", load: "Moderado" },
        { name: "Rosca Inclinada (Halter)", sets: 3, reps: "12", load: "Leve" },
        { name: "Tríceps Pulley", sets: 3, reps: "15", load: "Moderado" },
        { name: "Tríceps Testa (Barra W)", sets: 3, reps: "12", load: "Moderado" },
        { name: "Tríceps Corda", sets: 3, reps: "15", load: "Leve" },
        { name: "Tríceps Francês", sets: 3, reps: "12", load: "Moderado" },
        { name: "Mergulho no Banco", sets: 3, reps: "15", load: "Corpo" },
        { name: "Rosca Concentrada", sets: 3, reps: "12", load: "Leve" }
      ]
    };

    let selectedExercises = [];
    let goal = "Treino Personalizado";

    if (msg.includes("peito")) {
      selectedExercises = library.peito;
      goal = "Peitoral Completo";
    } else if (msg.includes("costas")) {
      selectedExercises = library.costas;
      goal = "Dorsais e Densidade";
    } else if (msg.includes("perna")) {
      selectedExercises = library.pernas;
      goal = "Membros Inferiores";
    } else if (msg.includes("ombro")) {
      selectedExercises = library.ombros;
      goal = "Deltoides e Trapézio";
    } else if (msg.includes("braço")) {
      selectedExercises = library.braços;
      goal = "Bíceps e Tríceps";
    } else {
      selectedExercises = [
        library.peito[0],
        library.costas[2],
        library.pernas[0],
        library.ombros[2],
        library.braços[4]
      ];
      goal = "Manutenção e Condicionamento";
    }

    return NextResponse.json({
      text: `Entendido! Gereu a lista de exercícios para **${goal}**.`,
      workoutGenerated: true,
      workoutData: {
        student: "Carlos Silva",
        goal: goal,
        exercises: selectedExercises
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar treino' }, { status: 500 });
  }
}