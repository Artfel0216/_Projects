"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users, Calendar, TrendingUp, MoreVertical, CalendarDays, User, Plus, Award,
  ChevronRight, Target, Dumbbell, Send, X, Bot, Trash2
} from 'lucide-react';

type Exercise = { name: string; sets: string; reps: string; load: string };
type WeeklyPlan = Record<string, Exercise[]>;
type ProgressEntry = { date: string; weight: string; muscleMass: string; bodyFat: string; note: string };
type Student = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  emergencyContact: string;
  objective: string;
  restrictions: string;
  injuries: string;
  medications: string;
  experience: string;
  availableDays: string;
  height: string;
  weight: string;
  bodyFat: string;
  observations: string;
  lastTraining: string;
  plan: string;
  progress: number;
  weeklyPlan: WeeklyPlan;
  progressHistory: ProgressEntry[];
};

type WeeklyClass = {
  id: string;
  studentId: string;
  day: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'canceled';
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Carlos Silva',
    cpf: '123.456.789-00',
    email: 'carlos@email.com',
    phone: '(11) 98888-0001',
    birthDate: '1991-03-12',
    gender: 'Masculino',
    emergencyContact: 'Marina Silva - (11) 97777-3333',
    objective: 'Hipertrofia',
    restrictions: 'Nenhuma',
    injuries: 'Lesão antiga no ombro esquerdo',
    medications: 'Não utiliza',
    experience: 'Intermediário',
    availableDays: 'Seg, Qua, Sex',
    height: '1.78',
    weight: '84',
    bodyFat: '18',
    observations: 'Boa aderência ao treino. Precisa melhorar mobilidade.',
    lastTraining: 'Hoje',
    plan: 'Premium',
    progress: 85,
    weeklyPlan: {
      Seg: [{ name: 'Supino Reto', sets: '4', reps: '8-10', load: '70kg' }],
      Ter: [{ name: 'Agachamento Livre', sets: '4', reps: '8', load: '90kg' }],
      Qua: [{ name: 'Remada Curvada', sets: '4', reps: '10', load: '60kg' }],
      Qui: [{ name: 'Levantamento Terra', sets: '3', reps: '6', load: '110kg' }],
      Sex: [{ name: 'Desenvolvimento Militar', sets: '4', reps: '10', load: '35kg' }],
      Sab: [],
      Dom: []
    },
    progressHistory: [
      { date: '05/03/2026', weight: '82kg', muscleMass: '+0.6kg', bodyFat: '-0.5%', note: 'Evolução consistente de força.' },
      { date: '05/04/2026', weight: '84kg', muscleMass: '+1.0kg', bodyFat: '-0.8%', note: 'Aumento de massa magra e boa recuperação.' }
    ]
  },
  {
    id: 's2',
    name: 'Ana Souza',
    cpf: '234.567.890-11',
    email: 'ana@email.com',
    phone: '(11) 97777-0002',
    birthDate: '1997-07-21',
    gender: 'Feminino',
    emergencyContact: 'Paulo Souza - (11) 96666-2222',
    objective: 'Condicionamento',
    restrictions: 'Intolerância leve ao impacto',
    injuries: 'Sem histórico',
    medications: 'Não utiliza',
    experience: 'Iniciante',
    availableDays: 'Seg, Ter, Qui',
    height: '1.65',
    weight: '62',
    bodyFat: '29',
    observations: 'Boa disciplina, precisa evoluir técnica.',
    lastTraining: 'Ontem',
    plan: 'Basic',
    progress: 40,
    weeklyPlan: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    progressHistory: [
      { date: '10/03/2026', weight: '64kg', muscleMass: '+0.2kg', bodyFat: '-0.4%', note: 'Início de adaptação.' }
    ]
  },
  {
    id: 's3',
    name: 'Beatriz Luz',
    cpf: '345.678.901-22',
    email: 'bia@email.com',
    phone: '(11) 95555-0003',
    birthDate: '1994-11-03',
    gender: 'Feminino',
    emergencyContact: 'Luciana Luz - (11) 98888-1212',
    objective: 'Emagrecimento',
    restrictions: 'Hipertensão controlada',
    injuries: 'Dor lombar ocasional',
    medications: 'Losartana',
    experience: 'Intermediário',
    availableDays: 'Qua, Qui, Sex',
    height: '1.70',
    weight: '78',
    bodyFat: '34',
    observations: 'Treino + cardiorrespiratório com progressão gradual.',
    lastTraining: 'Há 2 dias',
    plan: 'Premium',
    progress: 65,
    weeklyPlan: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    progressHistory: [
      { date: '01/03/2026', weight: '80kg', muscleMass: '+0.1kg', bodyFat: '-0.7%', note: 'Boa resposta ao treino metabólico.' }
    ]
  }
];

const INITIAL_WEEKLY_CLASSES: WeeklyClass[] = [
  { id: '1', day: 'Seg', date: '21/04', time: '07:00', studentId: 's1', type: 'Hipertrofia', status: 'confirmed' },
  { id: '2', day: 'Seg', date: '21/04', time: '08:30', studentId: 's2', type: 'Funcional', status: 'confirmed' },
  { id: '3', day: 'Ter', date: '22/04', time: '18:00', studentId: 's1', type: 'Powerlifting', status: 'pending' },
  { id: '4', day: 'Qua', date: '23/04', time: '06:00', studentId: 's3', type: 'Emagrecimento', status: 'confirmed' },
  { id: '5', day: 'Qui', date: '24/04', time: '10:00', studentId: 's3', type: 'Mobilidade', status: 'canceled' }
];

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-orange-600/10 rounded-xl">
        <Icon className="text-orange-500" size={20} />
      </div>
      {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+{trend}%</span>}
    </div>
    <p className="text-zinc-500 text-[10px] font-black uppercase italic">{title}</p>
    <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

const Field = ({
  label,
  required = false,
  className = '',
  children
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
    {children}
  </label>
);

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];
const AVAILABLE_DAYS_OPTIONS = [
  'Seg a Sex',
  'Seg, Qua e Sex',
  'Ter e Qui',
  'Somente fim de semana',
  'Todos os dias',
  'Outros'
];
const EXPERIENCE_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];
const OTHER_DAYS_PREFIX = 'Outros: ';

const emptyStudentForm = (): Omit<Student, 'id' | 'weeklyPlan' | 'progressHistory' | 'lastTraining' | 'progress'> => ({
  name: '',
  cpf: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  emergencyContact: '',
  objective: '',
  restrictions: '',
  injuries: '',
  medications: '',
  experience: '',
  availableDays: '',
  height: '',
  weight: '',
  bodyFat: '',
  observations: '',
  plan: 'Basic'
});

function AgendaItem({ item, studentName, onOpenStudent }: { item: WeeklyClass; studentName: string; onOpenStudent: () => void }) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-orange-500/50 transition-all group cursor-pointer"
      onClick={onOpenStudent}
    >
      <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center bg-zinc-950 w-14 h-14 rounded-xl border border-white/5">
        <span className="text-[10px] font-black text-orange-500 uppercase">{item.day}</span>
        <span className="text-sm font-black text-white">{item.time}</span>
      </div>
      <div>
        <h4 className="font-black italic uppercase text-sm text-white">{studentName}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item.type}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'confirmed' ? 'bg-emerald-500' : item.status === 'canceled' ? 'bg-red-500' : 'bg-amber-500'}`} />
        </div>
      </div>
      </div>
      <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors cursor-pointer">
      <MoreVertical size={18} />
      </button>
    </div>
  );
}

export default function PersonalDashboard() {
  const router = useRouter();
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'students' | 'create' | 'stats' | 'profile'>('home');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
const [cursor, setCursor] = useState<string | null>(null);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClass[]>(INITIAL_WEEKLY_CLASSES);
const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
const [showNewStudentForm, setShowNewStudentForm] = useState(false);
const [newStudent, setNewStudent] = useState(emptyStudentForm());
const [showExerciseForm, setShowExerciseForm] = useState(false);
const [exerciseToAdd, setExerciseToAdd] = useState({ day: 'Seg', name: '', sets: '', reps: '', load: '' });
const [historyInput, setHistoryInput] = useState({ date: '', weight: '', muscleMass: '', bodyFat: '', note: '' });

const [isChatOpen, setIsChatOpen] = useState(false);
const [input, setInput] = useState('');
const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
const [loading, setLoading] = useState(false);

const selectedStudent = useMemo(
  () => students.find((student) => student.id === selectedStudentId) ?? null,
  [students, selectedStudentId]
);

const safeNewStudent = useMemo(
  () => ({ ...emptyStudentForm(), ...newStudent }),
  [newStudent]
);

const openStudentProfile = (studentId: string) => {
  setSelectedStudentId(studentId);
  setShowExerciseForm(false);
  setShowNewStudentForm(false);
  setActiveMobileTab('students');
};

const updateSelectedStudentField = (field: keyof Student, value: any) => {
  if (!selectedStudentId) return;
  setStudents((prev) =>
    prev.map((student) =>
      student.id === selectedStudentId ? { ...student, [field]: value } : student
    )
  );
};

const addExerciseToSelectedStudent = () => {
  if (!selectedStudentId || !exerciseToAdd.name || !exerciseToAdd.sets || !exerciseToAdd.reps) return;

  setStudents((prev) =>
    prev.map((student) => {
      if (student.id !== selectedStudentId) return student;

      const updatedPlan = { ...student.weeklyPlan };
      const dayExercises = [...(updatedPlan[exerciseToAdd.day] ?? [])];

      dayExercises.push({
        name: exerciseToAdd.name,
        sets: exerciseToAdd.sets || '-',
        reps: exerciseToAdd.reps || '-',
        load: exerciseToAdd.load || '-'
      });

      updatedPlan[exerciseToAdd.day] = dayExercises;

      return { ...student, weeklyPlan: updatedPlan };
    })
  );

  setExerciseToAdd({ day: 'Seg', name: '', sets: '', reps: '', load: '' });
};

const removeExercise = (day: string, idx: number) => {
  if (!selectedStudentId) return;

  setStudents((prev) =>
    prev.map((student) => {
      if (student.id !== selectedStudentId) return student;

      const updatedPlan = { ...student.weeklyPlan };
      const dayExercises = [...(updatedPlan[day] ?? [])];

      dayExercises.splice(idx, 1);
      updatedPlan[day] = dayExercises;

      return { ...student, weeklyPlan: updatedPlan };
    })
  );
};

useEffect(() => {
  const controller = new AbortController();

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes', {
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!res.ok) return;

      const data = await res.json();

      const formatted = (Array.isArray(data) ? data : data.data ?? []).map((c: any) => ({
        id: c.id,
        studentId: c.studentId,
        day: c.day,
        date: c.date,
        time: c.time,
        type: c.type,
        status: c.status
      }));

      setWeeklyClasses(formatted);
    } catch {}
  };

  fetchClasses();

  return () => controller.abort();
}, []);

useEffect(() => {
  const controller = new AbortController();

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/athletes', {
        cache: 'no-store',
        signal: controller.signal
      });

      if (!res.ok) return;

      const data = await res.json();

      const formatted = (data.data ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
        cpf: a.cpf,
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        emergencyContact: '',
        objective: '',
        restrictions: '',
        injuries: '',
        medications: '',
        experience: a.experienceLevel ?? '',
        availableDays: '',
        height: '',
        weight: '',
        bodyFat: '',
        observations: '',
        lastTraining: 'Recente',
        plan: 'Basic',
        progress: 0,
        weeklyPlan: (a.trainingPlans ?? []).reduce((acc: any, plan: any) => {
          acc[plan.day] = plan.exercises ?? [];
          return acc;
        }, { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] }),
        progressHistory: (a.progressEntries ?? []).map((p: any) => ({
          date: p.date ?? '',
          weight: p.weight ?? '',
          muscleMass: p.muscleMass ?? '',
          bodyFat: p.bodyFat ?? '',
          note: p.note ?? ''
        }))
      }));

      setStudents(formatted);
      setCursor(data.nextCursor ?? null);
      setHasMore(!!data.nextCursor);
    } catch {}
  };

  fetchStudents();

  return () => controller.abort();
}, []);

useEffect(() => {
  const handleScroll = async () => {
    if (loadingMore || !hasMore || !cursor) return;

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      setLoadingMore(true);

      try {
        const res = await fetch(`/api/athletes?cursor=${cursor}`, {
          cache: 'no-store'
        });

        if (!res.ok) return;

        const data = await res.json();

        const formatted = (data.data ?? []).map((a: any) => ({
          id: a.id,
          name: a.name,
          cpf: a.cpf,
          email: '',
          phone: '',
          birthDate: '',
          gender: '',
          emergencyContact: '',
          objective: '',
          restrictions: '',
          injuries: '',
          medications: '',
          experience: a.experienceLevel ?? '',
          availableDays: '',
          height: '',
          weight: '',
          bodyFat: '',
          observations: '',
          lastTraining: 'Recente',
          plan: 'Basic',
          progress: 0,
          weeklyPlan: (a.trainingPlans ?? []).reduce((acc: any, plan: any) => {
            acc[plan.day] = plan.exercises ?? [];
            return acc;
          }, { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] }),
          progressHistory: (a.progressEntries ?? []).map((p: any) => ({
            date: p.date ?? '',
            weight: p.weight ?? '',
            muscleMass: p.muscleMass ?? '',
            bodyFat: p.bodyFat ?? '',
            note: p.note ?? ''
          }))
        }));

        setStudents((prev) => [...prev, ...formatted]);
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.nextCursor);
      } catch {}

      setLoadingMore(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [cursor, loadingMore, hasMore]);

const addHistoryEntry = () => {
  if (!selectedStudentId || !historyInput.date || !historyInput.weight) return;

  setStudents((prev) =>
    prev.map((student) =>
      student.id === selectedStudentId
        ? { ...student, progressHistory: [historyInput, ...student.progressHistory] }
        : student
    )
  );

  setHistoryInput({ date: '', weight: '', muscleMass: '', bodyFat: '', note: '' });
};

const deleteSelectedStudent = () => {
  if (!selectedStudentId) return;

  setStudents((prev) => prev.filter((student) => student.id !== selectedStudentId));
  setWeeklyClasses((prev) => prev.filter((item) => item.studentId !== selectedStudentId));
  setSelectedStudentId(null);
};

const createStudent = async () => {
  const availableDaysValue = newStudent.availableDays ?? '';

  const hasValidAvailableDays = availableDaysValue.startsWith(OTHER_DAYS_PREFIX)
    ? availableDaysValue.replace(OTHER_DAYS_PREFIX, '').trim().length > 0
    : availableDaysValue.length > 0;

  if (
    !newStudent.name ||
    !newStudent.cpf ||
    !newStudent.phone ||
    !newStudent.birthDate ||
    !newStudent.gender ||
    !newStudent.objective ||
    !newStudent.experience ||
    !hasValidAvailableDays
  ) return;

  try {
    const age =
      new Date().getFullYear() -
      new Date(newStudent.birthDate).getFullYear();

    const res = await fetch('/api/athletes/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newStudent.email || `${Date.now()}@temp.com`,
        name: newStudent.name,
        cpf: newStudent.cpf,
        age,
        sex: newStudent.gender.toLowerCase(),
        heightCm: Number(newStudent.height) * 100,
        weightKg: Number(newStudent.weight),
        experienceLevel: newStudent.experience.toLowerCase(),
        dietaryRestriction: 'nenhuma',
        city: 'Não informado',
        state: 'Não informado',
        cep: '00000-000',
        phone: newStudent.phone,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    const id = `s${Date.now()}`;

    const student: Student = {
      ...newStudent,
      id,
      lastTraining: 'Novo',
      progress: 0,
      weeklyPlan: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
      progressHistory: []
    };

    setStudents((prev) => [student, ...prev]);
    setNewStudent(emptyStudentForm());
    setShowNewStudentForm(false);
    setSelectedStudentId(id);
  } catch (err: any) {
    alert(err.message || 'Erro ao cadastrar atleta');
  }
};

const handleChat = async () => {
  if (!input.trim()) return;

  const userMsg = { role: 'user', content: input };

  setMessages((prev) => [...prev, userMsg]);
  setInput('');
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: "Houve um erro na conexão, mas gerei um treino padrão para você continuar." }
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            setShowNewStudentForm(false);
            setSelectedStudentId(null);
            setShowExerciseForm(false);
            setIsChatOpen(false);
            setActiveMobileTab('home');
          }}
          className="flex items-center space-x-3 cursor-pointer"
          aria-label="Voltar para a tela inicial do personal"
        >
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Award className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black italic tracking-tighter text-white block leading-none">PRO COACH</span>
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em]">Personal Panel</span>
          </div>
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setShowNewStudentForm((prev) => !prev);
              setNewStudent((prev) => ({ ...emptyStudentForm(), ...prev }));
              setSelectedStudentId(null);
            }}
            className="bg-orange-600 hover:bg-orange-700 p-2.5 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
          >
            <Plus size={20} className="text-white group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase italic pr-1 hidden md:block text-white">ADICIONAR NOVO ALUNO</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {showNewStudentForm && (
          <div className="mb-8 bg-zinc-900/50 rounded-4xl border border-orange-500/20 p-6">
            <h2 className="text-lg font-black italic uppercase text-white mb-4">Cadastro completo de aluno</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Nome completo" required><input required value={safeNewStudent.name} onChange={(e) => setNewStudent({ ...safeNewStudent, name: e.target.value })} placeholder="Nome completo" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="CPF" required><input required value={safeNewStudent.cpf} onChange={(e) => setNewStudent({ ...safeNewStudent, cpf: e.target.value })} placeholder="000.000.000-00" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Email"><input value={safeNewStudent.email} onChange={(e) => setNewStudent({ ...safeNewStudent, email: e.target.value })} placeholder="Email" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Telefone / WhatsApp" required><input required value={safeNewStudent.phone} onChange={(e) => setNewStudent({ ...safeNewStudent, phone: e.target.value })} placeholder="Telefone / WhatsApp" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Data de nascimento" required><input required type="date" value={safeNewStudent.birthDate} onChange={(e) => setNewStudent({ ...safeNewStudent, birthDate: e.target.value })} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white scheme-light" /></Field>
              <Field label="Gênero" required>
                <select required value={safeNewStudent.gender} onChange={(e) => setNewStudent({ ...safeNewStudent, gender: e.target.value })} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white">
                  <option value="">Selecione</option>
                  {GENDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="Contato de emergência"><input value={safeNewStudent.emergencyContact} onChange={(e) => setNewStudent({ ...safeNewStudent, emergencyContact: e.target.value })} placeholder="Contato de emergência" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Objetivo principal" required><input required value={safeNewStudent.objective} onChange={(e) => setNewStudent({ ...safeNewStudent, objective: e.target.value })} placeholder="Objetivo principal" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Nível de experiência" required>
                <select required value={safeNewStudent.experience} onChange={(e) => setNewStudent({ ...safeNewStudent, experience: e.target.value })} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white">
                  <option value="">Selecione</option>
                  {EXPERIENCE_LEVELS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="Dias disponíveis" required>
                <select
                  required
                  value={safeNewStudent.availableDays.startsWith(OTHER_DAYS_PREFIX) ? 'Outros' : safeNewStudent.availableDays}
                  onChange={(e) => setNewStudent({ ...safeNewStudent, availableDays: e.target.value === 'Outros' ? OTHER_DAYS_PREFIX : e.target.value })}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white"
                >
                  <option value="">Selecione</option>
                  {AVAILABLE_DAYS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              {safeNewStudent.availableDays.startsWith(OTHER_DAYS_PREFIX) && (
                <Field label="Informe os dias disponíveis" required className="md:col-span-3">
                  <input
                    required
                    value={safeNewStudent.availableDays.replace(OTHER_DAYS_PREFIX, '')}
                    onChange={(e) => setNewStudent({ ...safeNewStudent, availableDays: `${OTHER_DAYS_PREFIX}${e.target.value}` })}
                    placeholder="Ex.: Seg, Ter e Sábado"
                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white"
                  />
                </Field>
              )}
              <Field label="Altura (m)"><input value={safeNewStudent.height} onChange={(e) => setNewStudent({ ...safeNewStudent, height: e.target.value })} placeholder="Altura (m)" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Peso (kg)"><input value={safeNewStudent.weight} onChange={(e) => setNewStudent({ ...safeNewStudent, weight: e.target.value })} placeholder="Peso (kg)" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="% Gordura corporal"><input value={safeNewStudent.bodyFat} onChange={(e) => setNewStudent({ ...safeNewStudent, bodyFat: e.target.value })} placeholder="% Gordura corporal" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Restrições médicas" className="md:col-span-2"><input value={safeNewStudent.restrictions} onChange={(e) => setNewStudent({ ...safeNewStudent, restrictions: e.target.value })} placeholder="Restrições médicas" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Lesões / histórico ortopédico"><input value={safeNewStudent.injuries} onChange={(e) => setNewStudent({ ...safeNewStudent, injuries: e.target.value })} placeholder="Lesões / histórico ortopédico" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Medicamentos em uso"><input value={safeNewStudent.medications} onChange={(e) => setNewStudent({ ...safeNewStudent, medications: e.target.value })} placeholder="Medicamentos em uso" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Plano"><input value={safeNewStudent.plan} onChange={(e) => setNewStudent({ ...safeNewStudent, plan: e.target.value })} placeholder="Basic, Premium..." className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white" /></Field>
              <Field label="Observações gerais" className="md:col-span-3"><textarea value={safeNewStudent.observations} onChange={(e) => setNewStudent({ ...safeNewStudent, observations: e.target.value })} placeholder="Rotina, preferências e observações" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-white min-h-24 resize-none" /></Field>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={createStudent} className="bg-orange-600 hover:bg-orange-700 rounded-xl px-4 py-2 text-[11px] font-black uppercase italic cursor-pointer">Salvar aluno</button>
              <button onClick={() => setShowNewStudentForm(false)} className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 text-[11px] font-black uppercase italic cursor-pointer">Cancelar</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Alunos Ativos" value="24" icon={Users} trend="12" />
          <StatCard title="Aulas p/ Semana" value="38" icon={CalendarDays} />
          <StatCard title="Faturamento Mês" value="R$ 8.450" icon={TrendingUp} trend="5" />
          <StatCard title="Taxa de Retenção" value="94%" icon={Target} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode='wait'>
              {!selectedStudent ? (
                <motion.div key="agenda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Cronograma Semanal</h2>
                  <div className="space-y-3">
                    {weeklyClasses.map((item) => {
                      const student = students.find((s) => s.id === item.studentId);
                      if (!student) return null;
                      return (
                        <AgendaItem
                          key={item.id}
                          item={item}
                          studentName={student.name}
                          onOpenStudent={() => openStudentProfile(student.id)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="workout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/50 rounded-[40px] border border-white/10 p-8 relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-600 rounded-3xl"><Dumbbell className="text-white" size={32} /></div>
                      <div>
                        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">{selectedStudent.name}</h2>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-[0.2em]">{selectedStudent.objective}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedStudentId(null)} className="text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors cursor-pointer"><X size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <Field label="Nome completo" required><input required value={selectedStudent.name ?? ''} onChange={(e) => updateSelectedStudentField('name', e.target.value)} placeholder="Nome completo" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="CPF" required><input required value={selectedStudent.cpf ?? ''} onChange={(e) => updateSelectedStudentField('cpf', e.target.value)} placeholder="000.000.000-00" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Email"><input value={selectedStudent.email ?? ''} onChange={(e) => updateSelectedStudentField('email', e.target.value)} placeholder="Email" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Telefone" required><input required value={selectedStudent.phone ?? ''} onChange={(e) => updateSelectedStudentField('phone', e.target.value)} placeholder="Telefone" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Data de nascimento" required><input required type="date" value={selectedStudent.birthDate ?? ''} onChange={(e) => updateSelectedStudentField('birthDate', e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none scheme-light" /></Field>
                    <Field label="Gênero" required>
                      <select required value={selectedStudent.gender ?? ''} onChange={(e) => updateSelectedStudentField('gender', e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                        <option value="">Selecione</option>
                        {GENDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Objetivo" required><input required value={selectedStudent.objective ?? ''} onChange={(e) => updateSelectedStudentField('objective', e.target.value)} placeholder="Objetivo" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Experiência de treino" required>
                      <select required value={selectedStudent.experience ?? ''} onChange={(e) => updateSelectedStudentField('experience', e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                        <option value="">Selecione</option>
                        {EXPERIENCE_LEVELS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Dias disponíveis" required>
                      <select
                        required
                        value={(selectedStudent.availableDays ?? '').startsWith(OTHER_DAYS_PREFIX) ? 'Outros' : (selectedStudent.availableDays ?? '')}
                        onChange={(e) => updateSelectedStudentField('availableDays', e.target.value === 'Outros' ? OTHER_DAYS_PREFIX : e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
                      >
                        <option value="">Selecione</option>
                        {AVAILABLE_DAYS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    {(selectedStudent.availableDays ?? '').startsWith(OTHER_DAYS_PREFIX) && (
                      <Field label="Informe os dias disponíveis" required className="md:col-span-2">
                        <input
                          required
                          value={(selectedStudent.availableDays ?? '').replace(OTHER_DAYS_PREFIX, '')}
                          onChange={(e) => updateSelectedStudentField('availableDays', `${OTHER_DAYS_PREFIX}${e.target.value}`)}
                          placeholder="Ex.: Seg, Ter e Sábado"
                          className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
                        />
                      </Field>
                    )}
                    <Field label="Altura (m)"><input value={selectedStudent.height ?? ''} onChange={(e) => updateSelectedStudentField('height', e.target.value)} placeholder="Altura (m)" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Peso (kg)"><input value={selectedStudent.weight ?? ''} onChange={(e) => updateSelectedStudentField('weight', e.target.value)} placeholder="Peso (kg)" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="% Gordura corporal"><input value={selectedStudent.bodyFat ?? ''} onChange={(e) => updateSelectedStudentField('bodyFat', e.target.value)} placeholder="% Gordura corporal" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Restrições médicas"><input value={selectedStudent.restrictions ?? ''} onChange={(e) => updateSelectedStudentField('restrictions', e.target.value)} placeholder="Restrições médicas" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Lesões"><input value={selectedStudent.injuries ?? ''} onChange={(e) => updateSelectedStudentField('injuries', e.target.value)} placeholder="Lesões" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Medicações"><input value={selectedStudent.medications ?? ''} onChange={(e) => updateSelectedStudentField('medications', e.target.value)} placeholder="Medicações" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Observações do aluno" className="md:col-span-2"><textarea value={selectedStudent.observations ?? ''} onChange={(e) => updateSelectedStudentField('observations', e.target.value)} placeholder="Observações do aluno" className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none min-h-24 resize-none" /></Field>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <button onClick={() => setShowExerciseForm((prev) => !prev)} className="bg-orange-600 hover:bg-orange-700 rounded-xl px-4 py-2 text-[11px] font-black uppercase italic cursor-pointer">+ ADICIONAR EXERCÍCIOS</button>
                    <button onClick={deleteSelectedStudent} className="bg-red-600/90 hover:bg-red-600 rounded-xl px-4 py-2 text-[11px] font-black uppercase italic cursor-pointer">Excluir aluno</button>
                  </div>

                  {showExerciseForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-8 p-6 bg-zinc-950/50 rounded-3xl border border-orange-500/20 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Field label="Dia da semana" required>
                        <select required value={exerciseToAdd.day} onChange={e => setExerciseToAdd({ ...exerciseToAdd, day: e.target.value })} className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none">
                          {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </Field>
                      <Field label="Exercício" required>
                        <input required value={exerciseToAdd.name} onChange={e => setExerciseToAdd({ ...exerciseToAdd, name: e.target.value })} placeholder="Exercício" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      </Field>
                      <Field label="Séries" required>
                        <input required value={exerciseToAdd.sets} onChange={e => setExerciseToAdd({ ...exerciseToAdd, sets: e.target.value })} placeholder="Séries" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      </Field>
                      <Field label="Repetições" required>
                        <input required value={exerciseToAdd.reps} onChange={e => setExerciseToAdd({ ...exerciseToAdd, reps: e.target.value })} placeholder="Repetições" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      </Field>
                      <Field label="Carga" className="md:col-span-1">
                        <input value={exerciseToAdd.load} onChange={e => setExerciseToAdd({ ...exerciseToAdd, load: e.target.value })} placeholder="Carga" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      </Field>
                      <div className="md:col-span-3 flex items-end">
                        <button onClick={addExerciseToSelectedStudent} className="w-full bg-orange-600 text-white font-black italic uppercase text-[10px] rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 py-2 cursor-pointer">
                          <Plus size={14} /> Adicionar
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <h3 className="text-white font-black italic uppercase text-sm mb-4">Ficha completa - treinos por dia</h3>
                  <div className="space-y-4 mb-8">
                    {DAYS.map((day) => (
                      <div key={day} className="bg-zinc-950/50 rounded-2xl border border-white/5 p-4">
                        <p className="text-orange-500 font-black uppercase text-xs mb-3">{day}</p>
                        <div className="space-y-2">
                          {(selectedStudent.weeklyPlan[day] ?? []).length === 0 && (
                            <p className="text-[11px] text-zinc-500">Sem exercícios cadastrados.</p>
                          )}
                          {(selectedStudent.weeklyPlan[day] ?? []).map((ex, idx) => (
                            <div key={`${day}-${idx}`} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                              <div>
                                <p className="font-black italic uppercase text-white text-xs">{ex.name}</p>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{ex.sets} séries x {ex.reps}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-zinc-900 px-3 py-1 rounded-lg text-orange-500 font-black italic text-[10px] border border-white/5">{ex.load || '0kg'}</span>
                                <button onClick={() => removeExercise(day, idx)} className="text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-white font-black italic uppercase text-sm mb-3">Histórico de evolução</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                    <Field label="Data" required><input required type="date" value={historyInput.date} onChange={(e) => setHistoryInput({ ...historyInput, date: e.target.value })} className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Peso" required><input required value={historyInput.weight} onChange={(e) => setHistoryInput({ ...historyInput, weight: e.target.value })} placeholder="Peso" className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Ganho de massa"><input value={historyInput.muscleMass} onChange={(e) => setHistoryInput({ ...historyInput, muscleMass: e.target.value })} placeholder="Ganho de massa" className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" /></Field>
                    <Field label="Perda de gordura"><input value={historyInput.bodyFat} onChange={(e) => setHistoryInput({ ...historyInput, bodyFat: e.target.value })} placeholder="Perda de gordura" className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" /></Field>
                    <div className="flex items-end">
                      <button onClick={addHistoryEntry} className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase italic cursor-pointer">Adicionar histórico</button>
                    </div>
                  </div>
                  <Field label="Observação da evolução" className="mb-4">
                    <textarea value={historyInput.note} onChange={(e) => setHistoryInput({ ...historyInput, note: e.target.value })} placeholder="Observação da evolução" className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none min-h-20 resize-none" />
                  </Field>
                  <div className="space-y-2">
                    {selectedStudent.progressHistory.map((entry, idx) => (
                      <div key={`${entry.date}-${idx}`} className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
                        <div className="flex flex-wrap gap-3 text-[10px] uppercase font-bold">
                          <span className="text-zinc-400">{entry.date}</span>
                          <span className="text-white">Peso: {entry.weight}</span>
                          <span className="text-emerald-400">Massa: {entry.muscleMass}</span>
                          <span className="text-orange-400">Gordura: {entry.bodyFat}</span>
                        </div>
                        {entry.note && <p className="text-[11px] text-zinc-300 mt-2">{entry.note}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-6">
            <div className="bg-orange-600 rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 relative overflow-hidden shadow-2xl shadow-orange-600/20">
              <div className="relative z-10">
                <h3 className="text-white font-black italic uppercase text-xl sm:text-2xl leading-tight mb-3 sm:mb-4">Otimização<br />por IA</h3>
                <button onClick={() => setIsChatOpen(true)} className="bg-white text-orange-600 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase italic text-[10px] sm:text-xs flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform shadow-xl cursor-pointer">
                  Falar com Copilot <Bot size={16} />
                </button>
              </div>
              <Bot size={120} className="sm:hidden absolute -right-8 -bottom-8 text-white/10 -rotate-12" />
              <Bot size={160} className="hidden sm:block absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
            </div>

            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6">
              <h3 className="text-white font-black italic uppercase text-sm mb-4">Meus Alunos</h3>
              <div className="space-y-5">
                {students.map((student) => (
                  <div key={student.id} className="flex flex-col gap-2 cursor-pointer hover:translate-x-1 transition-transform" onClick={() => openStudentProfile(student.id)}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">{student.name.charAt(0)}</div>
                        <div>
                          <p className="text-[11px] font-black uppercase text-white">{student.name}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">{student.lastTraining}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 w-95 h-125 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-100 overflow-hidden backdrop-blur-xl">
            <div className="p-4 bg-orange-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white"><Bot size={20} /><span className="font-black italic uppercase text-xs">Gemini Copilot</span></div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{msg.content}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="Gere o treino do Carlos..." className="flex-1 bg-zinc-900 rounded-xl px-4 text-xs text-white outline-none" />
              <button onClick={handleChat} disabled={loading} className="bg-orange-600 p-2.5 rounded-xl text-white cursor-pointer disabled:cursor-not-allowed"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-between items-center lg:hidden z-50">
        <button
          type="button"
          onClick={() => {
            setShowNewStudentForm(false);
            setSelectedStudentId(null);
            setShowExerciseForm(false);
            setIsChatOpen(false);
            setActiveMobileTab('home');
          }}
          className="cursor-pointer"
          aria-label="Ir para início do painel"
        >
          <Calendar size={24} className={activeMobileTab === 'home' ? 'text-orange-500' : 'text-zinc-600'} />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowNewStudentForm(false);
            setShowExerciseForm(false);
            setIsChatOpen(false);
            setActiveMobileTab('students');
          }}
          className="cursor-pointer"
          aria-label="Abrir alunos"
        >
          <Users size={24} className={activeMobileTab === 'students' ? 'text-orange-500' : 'text-zinc-600'} />
        </button>
        <button
          type="button"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center -mt-10 shadow-xl cursor-pointer transition-colors ${
            activeMobileTab === 'create' ? 'bg-orange-600' : 'bg-zinc-800'
          }`}
          onClick={() => {
            setShowNewStudentForm(true);
            setSelectedStudentId(null);
            setShowExerciseForm(false);
            setActiveMobileTab('create');
          }}
          aria-label="Cadastrar novo aluno"
        >
          <Plus size={24} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('stats');
            router.push('/StatsPage');
          }}
          className="cursor-pointer"
          aria-label="Abrir estatísticas"
        >
          <TrendingUp size={24} className={activeMobileTab === 'stats' ? 'text-orange-500' : 'text-zinc-600'} />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab('profile');
            router.push('/ProfilePage');
          }}
          className="cursor-pointer"
          aria-label="Abrir perfil"
        >
          <User size={24} className={activeMobileTab === 'profile' ? 'text-orange-500' : 'text-zinc-600'} />
        </button>
      </nav>
    </div>
  );
}