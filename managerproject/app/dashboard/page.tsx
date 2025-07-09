'use client'

import { useState } from 'react';
import Header from "@/app/components/header/page";

interface Project {
  id: number;
  name: string;
  datetime: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', datetime: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = () => {
    if (!newProject.name || !newProject.datetime) return;

    if (editingId !== null) {
      // Editar
      setProjects(prev =>
        prev.map(p => (p.id === editingId ? { ...p, ...newProject } : p))
      );
    } else {
      // Criar
      setProjects(prev => [
        ...prev,
        { id: Date.now(), ...newProject }
      ]);
    }

    setNewProject({ name: '', datetime: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (id: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setNewProject({ name: project.name, datetime: project.datetime });
      setEditingId(id);
      setShowModal(true);
    }
  };

  const handleDelete = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  return (
    <main className="bg-black min-h-screen text-white p-4">
      <Header onCreateProject={() => setShowModal(true)} />

      <section className="mt-[2rem] ml-[3rem]">
        <h1 className="text-[2rem] font-bold">Projetos Recentes:</h1>
        {sortedProjects.length === 0 ? (
          <p className="text-white mt-[2rem] font-bold text-[1.3rem]">Nenhum projeto ainda.</p>
        ) : (
          <ol className="list-decimal ml-6 mt-4 space-y-1">
            {sortedProjects.map(project => (
              <li key={project.id} className="flex justify-between items-center">
                <div className='bg-white w-full rounded mr-[1rem] p-4'>
                  <strong className='text-[2rem] text-black'>{project.name}</strong> :{" "}
                  <span className="text-black text-[1.1rem] font-bold ml-[36rem]">
                    {new Date(project.datetime).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="bg-[#FFEB3B] w-[6rem] h-[3rem] rounded font-bold cursor-pointer flex items-center justify-center text-black hover:bg-yellow-400 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-[#F44336] w-[6rem] h-[3rem] rounded font-bold cursor-pointer flex items-center justify-center text-black hover:bg-red-600 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Project" : "New Project"}
            </h2>
            <input
              type="text"
              placeholder="Name of the project"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full border p-2 mb-3 rounded text-black placeholder-black cursor-pointer font-bold"
            />
            <input
              type="datetime-local"
              value={newProject.datetime}
              onChange={(e) => setNewProject({ ...newProject, datetime: e.target.value })}
              className="w-full border p-2 mb-4 rounded cursor-pointer font-bold"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
              >
               Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
