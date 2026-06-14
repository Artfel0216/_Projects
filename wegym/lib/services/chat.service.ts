import { genAI } from '@/lib/gemini';

const LIBRARY = {
  peito: [
    { name: "Supino Reto (Barra)", sets: 4, reps: "10-12", load: "Até a falha" },
    { name: "Supino Inclinado (Halteres)", sets: 3, reps: "12", load: "Moderado" },
    { name: "Crucifixo Reto (Halteres)", sets: 3, reps: "15", load: "Leve/Moderado" },
    { name: "Dips (Paralelas - Foco Peito)", sets: 3, reps: "10", load: "Corpo" },
    { name: "Supino Reto (Halteres)", sets: 4, reps: "10", load: "Pesado" },
    { name: "Flexão Explosiva (Clap Push-up)", sets: 3, reps: "8-10", load: "Potência" },
    { name: "Crossover Polia Alta", sets: 4, reps: "15", load: "Controle" },
    { name: "Peck Deck (Voador)", sets: 3, reps: "12-15", load: "Progressivo" },
    { name: "Supino Declinado (Barra)", sets: 3, reps: "10", load: "Pesado" },
    { name: "Flexão Arqueiro (Archer Push-up)", sets: 3, reps: "8 cada lado", load: "Corpo" },
    { name: "Pullover com Halter", sets: 3, reps: "12", load: "Moderado" },
    { name: "Chest Press Máquina", sets: 4, reps: "12", load: "Progressivo" },
    { name: "Supino Inclinado (Barra)", sets: 3, reps: "10", load: "Pesado" },
    { name: "Floor Press (Supino no Chão)", sets: 3, reps: "10", load: "Estabilidade" }
  ],
  costas: [
    { name: "Levantamento Terra (Deadlift)", sets: 3, reps: "6-8", load: "Pesado" },
    { name: "Barra Fixa (Pull-up)", sets: 3, reps: "Máximo", load: "Corpo" },
    { name: "Remada Curvada (Barra)", sets: 4, reps: "10", load: "Pesado" },
    { name: "Remada Pendlay", sets: 3, reps: "8", load: "Pesado" },
    { name: "Barra Fixa com Carga", sets: 3, reps: "6", load: "Anilha Acoplada" },
    { name: "Puxada Aberta no Pulley", sets: 4, reps: "12", load: "Moderado" },
    { name: "Remada Unilateral (Serrote)", sets: 3, reps: "12", load: "Moderado" },
    { name: "Pulldown com Corda", sets: 3, reps: "15", load: "Leve" },
    { name: "Remada Cavalinho", sets: 3, reps: "10", load: "Pesado" },
    { name: "Barra Fixa Pegada Supinada (Chin-up)", sets: 3, reps: "Máximo", load: "Corpo" },
    { name: "Remada Baixa Sentada (Triângulo)", sets: 4, reps: "12", load: "Moderado" },
    { name: "Face Pull", sets: 3, reps: "20", load: "Leve" },
    { name: "Remada Renegade (Halteres)", sets: 3, reps: "10 cada lado", load: "Core/Estabilidade" },
    { name: "Good Morning (Bom Dia)", sets: 3, reps: "12", load: "Leve/Moderado" }
  ],
  pernas: [
    { name: "Agachamento Livre", sets: 4, reps: "8-10", load: "Pesado" },
    { name: "Leg Press 45º", sets: 4, reps: "12-15", load: "Pesado" },
    { name: "Stiff (RDL)", sets: 4, reps: "10", load: "Moderado" },
    { name: "Agachamento Búlgaro", sets: 3, reps: "10", load: "Moderado" },
    { name: "Pistol Squat (Unilateral)", sets: 3, reps: "6 cada lado", load: "Equilíbrio" },
    { name: "Cadeira Extensora", sets: 4, reps: "15", load: "Isolado" },
    { name: "Mesa Flexora", sets: 4, reps: "12", load: "Controlado" },
    { name: "Elevação Pélvica (Barra)", sets: 4, reps: "10", load: "Pesado" },
    { name: "Agachamento Sumô com Halter", sets: 3, reps: "12", load: "Moderado" },
    { name: "Gêmeos em Pé (Panturrilha)", sets: 4, reps: "20", load: "Progressivo" },
    { name: "Agachamento Frontal (Barra)", sets: 4, reps: "8", load: "Pesado" },
    { name: "Hack Squat", sets: 3, reps: "12", load: "Pesado" },
    { name: "Cadeira Flexora", sets: 4, reps: "15", load: "Moderado" },
    { name: "Afundo com Halteres", sets: 3, reps: "12 cada lado", load: "Moderado" }
  ],
  ombros: [
    { name: "Desenvolvimento Militar (Barra)", sets: 4, reps: "8", load: "Pesado" },
    { name: "Desenvolvimento Arnold", sets: 3, reps: "10", load: "Moderado" },
    { name: "Elevação Lateral (Cabo)", sets: 3, reps: "15", load: "Controle" },
    { name: "Push Press", sets: 4, reps: "6", load: "Potência" },
    { name: "Elevação Lateral (Halteres)", sets: 4, reps: "12-15", load: "Moderado" },
    { name: "Crucifixo Inverso (Halteres)", sets: 3, reps: "15", load: "Leve" },
    { name: "Elevação Frontal (Anilhas)", sets: 3, reps: "12", load: "Moderado" },
    { name: "Encolhimento com Barra", sets: 4, reps: "12", load: "Pesado" },
    { name: "Handstand Push-up", sets: 3, reps: "Máximo", load: "Corpo" },
    { name: "Remada Alta (Barra W)", sets: 3, reps: "12", load: "Moderado" }
  ],
  braços: [
    { name: "Rosca Direta (Barra W)", sets: 3, reps: "10", load: "Moderado" },
    { name: "Tríceps Pulley (Corda)", sets: 3, reps: "15", load: "Leve" },
    { name: "Rosca Martelo (Halteres)", sets: 3, reps: "12", load: "Moderado" },
    { name: "Tríceps Testa (Barra W)", sets: 3, reps: "10", load: "Moderado" },
    { name: "Rosca Scott", sets: 3, reps: "12", load: "Foco Bíceps" },
    { name: "Tríceps Francês (Halter)", sets: 3, reps: "12", load: "Moderado" },
    { name: "Rosca Concentrada", sets: 3, reps: "12", load: "Isolado" },
    { name: "Mergulho no Banco", sets: 3, reps: "15", load: "Corpo" },
    { name: "Tríceps Coice (Cabo)", sets: 3, reps: "15", load: "Leve" },
    { name: "Rosca Inversa (Antebraço)", sets: 3, reps: "12", load: "Moderado" }
  ],
  core_abdominal: [
    { name: "Abdominal Supra (Crunch)", sets: 4, reps: "20", load: "Corpo" },
    { name: "Prancha Isométrica", sets: 3, reps: "60 segundos", load: "Estabilidade" },
    { name: "Elevacão de Pernas Suspenso", sets: 3, reps: "12", load: "Corpo" },
    { name: "Russian Twist (Giro Russo)", sets: 3, reps: "20 cada lado", load: "Anilha" },
    { name: "Abdominal Infra na Paralela", sets: 3, reps: "15", load: "Corpo" },
    { name: "Roda Abdominal (Ab Wheel)", sets: 3, reps: "10", load: "Avançado" },
    { name: "Prancha Lateral", sets: 3, reps: "45 segundos cada", load: "Corpo" },
    { name: "Deadbug", sets: 3, reps: "12 cada lado", load: "Controle" }
  ],
  alta_performance: [
    { name: "Clean and Jerk", sets: 5, reps: "3-5", load: "Alta Intensidade" },
    { name: "Snatch", sets: 5, reps: "3", load: "Pesado" },
    { name: "Burpee Over the Bar", sets: 4, reps: "12", load: "Explosão" },
    { name: "Box Jump", sets: 4, reps: "10", load: "Pliometria" },
    { name: "Wall Ball", sets: 3, reps: "20", load: "Resistência" },
    { name: "Sled Push", sets: 4, reps: "20 metros", load: "Máxima Força" },
    { name: "Muscle-up", sets: 3, reps: "Máximo", load: "Avançado" },
    { name: "Kettlebell Swing", sets: 4, reps: "20", load: "Potência" },
    { name: "Toes to Bar", sets: 3, reps: "15", load: "Core" },
    { name: "Devil Press", sets: 4, reps: "10", load: "Full Body" },
    { name: "Farmer's Walk", sets: 3, reps: "40 metros", load: "Pegada" },
    { name: "Thrusters", sets: 4, reps: "12", load: "Cardio/Força" },
    { name: "Rope Climb (Subida na Corda)", sets: 3, reps: "1 subida", load: "Corpo" }
  ],
  mobilidade_flexibilidade: [
    { name: "Carioca (Mobilidade Quadril)", sets: 2, reps: "20 metros", load: "Dinâmico" },
    { name: "World's Greatest Stretch", sets: 3, reps: "5 cada lado", load: "Corpo" },
    { name: "Mobilidade de Tornozelo na Parede", sets: 2, reps: "12 cada lado", load: "Controle" },
    { name: "Cat-Cow (Coluna)", sets: 2, reps: "15", load: "Respiração" },
    { name: "Cossack Squat", sets: 3, reps: "8 cada lado", load: "Mobilidade" }
  ]
} as const;

export const chatService = {
  async generateWorkout(message: string, level: string) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: `Você é um Personal Trainer de elite especializado em musculação, alta performance e mobilidade.
        Sua base de dados é esta LIBRARY: ${JSON.stringify(LIBRARY)}.

        DIRETRIZES DE FILTRAGEM POR NÍVEL:
        - Nível Atual do Aluno: ${level || 'Iniciante'}.
        - Se INICIANTE: Use apenas exercícios básicos e máquinas. Máximo 4 exercícios. Proibido categorias de 'alta_performance' ou 'strongman'.
        - Se INTERMEDIÁRIO: Misture máquinas com pesos livres. 5 a 6 exercícios. Pode incluir core e 1 exercício de explosão.
        - Se AVANÇADO: Use todas as categorias (Strongman, Calistenia Estática, Alta Performance). Foco em intensidade e 6 a 8 exercícios.

        REGRAS DE RESPOSTA:
        - Responda estritamente com um JSON.
        - Não invente exercícios fora da LIBRARY.
        - Formato do JSON:
        {
          "text": "mensagem motivadora explicando a escolha para o nível ${level}",
          "goal": "objetivo do treino",
          "exercises": [{"name": "string", "sets": number, "reps": "string", "load": "string"}]
        }`
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();
    const aiData = JSON.parse(responseText);

    return {
      text: aiData.text,
      workoutGenerated: true,
      workoutData: {
        level: level || 'Iniciante',
        goal: aiData.goal,
        exercises: aiData.exercises
      }
    };
  }
};
