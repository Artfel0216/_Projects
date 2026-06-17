"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  Users, Calendar, TrendingUp, CalendarDays, Plus, Award,
  ChevronRight, Target, Dumbbell, Send, X, Bot, Trash2,
  Search, UserPlus
} from 'lucide-react';
import { Student, WeeklyClass } from '@/types/personal';
import { INITIAL_STUDENTS, INITIAL_WEEKLY_CLASSES } from '@/mocks/personalData';
import { StatCard, Field } from '@/components/ui/DashboardElements';
import { EXPERIENCE_LEVELS, GENDER_OPTIONS, AVAILABLE_DAYS_OPTIONS, OTHER_DAYS_PREFIX, DAYS } from '@/constants/options';

const createEmptyStudentForm = () => ({
  id: '',
  name: '',
  email: '',
  cpf: '',
  birthDate: '',
  phone: '',
  gender: '',
  emergencyContact: '',
  experience: '',
  objective: '',
  plan: '',
  height: '',
  weight: '',
  availableDays: '',
  notes: '',
  bodyFat: '',
  restrictions: '',
  injuries: '',
  medications: '',
  observations: ''
});





export default function PersonalDashboard() {
  const searchParams = useSearchParams();
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'students' | 'create'>('home');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClass[]>(INITIAL_WEEKLY_CLASSES);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState(createEmptyStudentForm());
  
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState({ day: 'Seg', name: '', sets: '', reps: '', load: '' });
  
  const [historyInput, setHistoryInput] = useState({ date: '', weight: '', muscleMass: '', bodyFat: '', note: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [studentsSearch, setStudentsSearch] = useState('');



const selectedStudent = useMemo(
  () => students.find((student) => student.id === selectedStudentId) ?? null,
  [students, selectedStudentId]
);

const safeNewStudent = useMemo(
  () => ({ ...createEmptyStudentForm(), ...newStudent }),
  [newStudent]
);

const filteredStudents = useMemo(() => {
  const q = studentsSearch.trim().toLowerCase();
  if (!q) return students;
  return students.filter((s) =>
    [s.name, s.objective, s.experience, s.plan]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
}, [students, studentsSearch]);



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
      type RawClass = { id: string; studentId: string; day: string; date: string; time: string; type: string; status: string };
      const formatted = (Array.isArray(data) ? data : data.data ?? []).map((c: RawClass) => ({
        id: c.id,
        studentId: c.studentId,
        day: c.day,
        date: c.date,
        time: c.time,
        type: c.type,
        status: c.status
      }));

      setWeeklyClasses(formatted);
    } catch (err) {
      console.error("Erro ao buscar aulas:", err);
    }
  };

  fetchClasses();
  return () => controller.abort();
}, []);

type AthleteAPI = {
  id: string;
  name: string;
  cpf: string;
  experienceLevel?: string;
  trainingPlans?: { day: string; exercises: unknown[] }[];
  progressEntries?: { date: string; weight: string; muscleMass: string; bodyFat: string; note: string }[];
};

function formatAthlete(a: AthleteAPI) {
  return {
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
    weeklyPlan: (a.trainingPlans ?? []).reduce<Record<string, unknown[]>>((acc, plan) => {
      acc[plan.day] = plan.exercises ?? [];
      return acc;
    }, { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] }),
    progressHistory: (a.progressEntries ?? []).map((p) => ({
      date: p.date ?? '',
      weight: p.weight ?? '',
      muscleMass: p.muscleMass ?? '',
      bodyFat: p.bodyFat ?? '',
      note: p.note ?? ''
    }))
  };
}

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
      const formatted = (data.data ?? []).map(formatAthlete);

      setStudents(formatted);
      setCursor(data.nextCursor ?? null);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    }
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
        const res = await fetch(`/api/athletes?cursor=${cursor}`, { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        const formatted = (data.data ?? []).map(formatAthlete);

        setStudents((prev) => [...prev, ...formatted]);
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.nextCursor);
      } catch (err) {
        console.error("Erro ao carregar mais alunos:", err);
      }

      setLoadingMore(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [cursor, loadingMore, hasMore]);

useEffect(() => {
  const view = searchParams.get('view');
  if (view === 'students') {
    setShowNewStudentForm(false);
    setShowExerciseForm(false);
    setIsChatOpen(false);
    setActiveMobileTab('students');
  } else if (view === 'create') {
    setSelectedStudentId(null);
    setShowExerciseForm(false);
    setIsChatOpen(false);
    setShowNewStudentForm(true);
    setNewStudent((prev) => ({ ...createEmptyStudentForm(), ...prev }));
    setActiveMobileTab('create');
  } else if (view === 'home') {
    setShowNewStudentForm(false);
    setSelectedStudentId(null);
    setShowExerciseForm(false);
    setIsChatOpen(false);
    setActiveMobileTab('home');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

const openStudentProfile = (studentId: string) => {
  setSelectedStudentId(studentId);
  setShowExerciseForm(false);
  setShowNewStudentForm(false);
  setActiveMobileTab('students');
};

const createStudent = async () => {
  const availableDaysValue = Array.isArray(newStudent.availableDays)
    ? newStudent.availableDays.join(' ')
    : String(newStudent.availableDays ?? '');

  const hasValidAvailableDays = availableDaysValue.startsWith(OTHER_DAYS_PREFIX)
    ? availableDaysValue.replace(OTHER_DAYS_PREFIX, '').trim().length > 0
    : availableDaysValue.length > 0;

  if (
    !newStudent.name || !newStudent.cpf || !newStudent.phone || 
    !newStudent.birthDate || !newStudent.gender || !newStudent.objective || 
    !newStudent.experience || !hasValidAvailableDays
  ) return;

  try {
    const age = new Date().getFullYear() - new Date(newStudent.birthDate).getFullYear();

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
    setNewStudent(createEmptyStudentForm());
    setShowNewStudentForm(false);
    setSelectedStudentId(id);
  } catch (err) {
    alert((err as Error).message || 'Erro ao cadastrar atleta');
  }
};

const updateSelectedStudentField = (field: keyof Student, value: string) => {
  if (!selectedStudentId) return;
  setStudents((prev) =>
    prev.map((student) =>
      student.id === selectedStudentId ? { ...student, [field]: value } : student
    )
  );
};

const deleteSelectedStudent = () => {
  if (!selectedStudentId) return;
  setStudents((prev) => prev.filter((student) => student.id !== selectedStudentId));
  setWeeklyClasses((prev) => prev.filter((item) => item.studentId !== selectedStudentId));
  setSelectedStudentId(null);
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

const AgendaItem: React.FC<{
  item: WeeklyClass;
  studentName: string;
  onOpenStudent: () => void;
}> = ({ item, studentName, onOpenStudent }) => {
  return (
    <button onClick={onOpenStudent} className="w-full text-left bg-zinc-900/30 hover:bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-colors">
      <div>
        <p className="text-sm font-black italic uppercase text-white">{studentName}</p>
        <p className="text-[11px] text-zinc-400">{item.day} · {item.time} · {item.type}</p>
      </div>
      <div className="text-xs text-zinc-500">{item.status}</div>
    </button>
  );
};

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
    <AuthGuard>
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
              setNewStudent((prev) => ({ ...createEmptyStudentForm(), ...prev }));
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
              <button               onClick={createStudent} className="btn-primary">Salvar aluno</button>
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

        <div className={`grid grid-cols-1 gap-8 ${activeMobileTab === 'students' && !selectedStudent ? '' : 'lg:grid-cols-3'}`}>
          <div className={`space-y-6 ${activeMobileTab === 'students' && !selectedStudent ? '' : 'lg:col-span-2'}`}>
            <AnimatePresence mode='wait'>
              {!selectedStudent && activeMobileTab === 'students' ? (
                <motion.div key="students-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">Painel do personal</p>
                      <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter leading-tight">
                        Meus Alunos
                      </h2>
                      <p className="text-[11px] text-zinc-500 font-medium mt-1">
                        {students.length === 0
                          ? 'Nenhum aluno cadastrado ainda.'
                          : `${students.length} ${students.length === 1 ? 'aluno' : 'alunos'} no total${studentsSearch ? ` · ${filteredStudents.length} no filtro` : ''}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewStudentForm(true);
                        setSelectedStudentId(null);
                        setShowExerciseForm(false);
                        setActiveMobileTab('create');
                      }}
                      className="self-stretch sm:self-auto bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase italic text-white cursor-pointer transition-colors"
                    >
                      <UserPlus size={14} />
                      Adicionar aluno
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <input
                      type="search"
                      value={studentsSearch}
                      onChange={(e) => setStudentsSearch(e.target.value)}
                      placeholder="Buscar por nome, objetivo, nível ou plano…"
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/40 transition-colors"
                    />
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-zinc-900/30 rounded-4xl border border-white/5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center mx-auto mb-4">
                        <Users size={22} className="text-zinc-500" />
                      </div>
                      <p className="text-sm font-black italic uppercase text-white tracking-tight">
                        Nenhum aluno por aqui
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto font-medium leading-relaxed">
                        Comece cadastrando seu primeiro aluno e organize a rotina de treinos dele.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewStudentForm(true);
                          setSelectedStudentId(null);
                          setShowExerciseForm(false);
                          setActiveMobileTab('create');
                        }}
                        className="mt-5 bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic text-white cursor-pointer transition-colors inline-flex items-center gap-2"
                      >
                        <UserPlus size={14} />
                        Cadastrar primeiro aluno
                      </button>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-zinc-900/30 rounded-4xl border border-white/5">
                      <p className="text-sm font-black italic uppercase text-white tracking-tight">
                        Nenhum aluno encontrado
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                        Tente outro termo na busca.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStudentsSearch('')}
                        className="mt-4 text-[10px] font-black uppercase italic text-orange-500 hover:text-orange-400 cursor-pointer"
                      >
                        Limpar busca
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredStudents.map((student) => {
                        const initials = student.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p.charAt(0).toUpperCase())
                          .join('');
                        return (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => openStudentProfile(student.id)}
                            className="text-left bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/5 hover:border-orange-500/30 rounded-3xl p-5 flex flex-col gap-4 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-orange-600/15 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0 font-black italic text-sm">
                                {initials || '?'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black italic uppercase text-white truncate leading-tight">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                                  {student.lastTraining || 'Sem registro'}
                                </p>
                              </div>
                              <ChevronRight size={16} className="text-zinc-600 group-hover:text-orange-500 transition-colors shrink-0" />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {student.experience && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase italic tracking-wider text-zinc-300">
                                  <Award size={10} className="text-zinc-500" />
                                  {student.experience}
                                </span>
                              )}
                              {student.plan && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase italic tracking-wider text-zinc-300">
                                  {student.plan}
                                </span>
                              )}
                              {student.objective && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-[9px] font-black uppercase italic tracking-wider text-orange-300 max-w-full truncate">
                                  <Target size={10} className="text-orange-400 shrink-0" />
                                  <span className="truncate">{student.objective}</span>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : !selectedStudent ? (
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
                    <button onClick={() => setShowExerciseForm((prev) => !prev)} className="btn-primary">+ ADICIONAR EXERCÍCIOS</button>
                    <button onClick={deleteSelectedStudent} className="btn-primary bg-red-600/90 hover:bg-red-600">Excluir aluno</button>
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

          {!(activeMobileTab === 'students' && !selectedStudent) && (
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

            <div className="card-base p-6">
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
          )}
        </div>
      </main>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 w-95 h-125 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-100 overflow-hidden backdrop-blur-xl">
            <div className="p-4 bg-orange-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white"><Bot size={20} /><span className="font-black italic uppercase text-xs">Gemini Copilot</span></div>
              <button type="button" onClick={() => setIsChatOpen(false)} className="text-white/80 cursor-pointer"><X size={20} /></button>
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

    </div>
    </AuthGuard>
  );
}