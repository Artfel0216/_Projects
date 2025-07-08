'use client';

import { useState } from 'react';
import Header from '@/components/header/page';

interface Project {
  name: string;
  description: string;
}

export default function InboxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleCreateProject = () => {
    const newProject = { name: projectName, description: projectDescription };
    setProjects([...projects, newProject]);

    setProjectName('');
    setProjectDescription('');
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(projects[index].name);
    setEditDescription(projects[index].description);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...projects];
    updated[editingIndex] = { name: editName, description: editDescription };
    setProjects(updated);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-black w-full min-h-screen relative">
      <Header />

      {/* Seção de boas-vindas + busca + botão */}
      <section className="mt-8 ml-8 flex flex-col gap-4">
        <h1 className="text-white text-2xl font-bold">Bem-vindo, Arthur!</h1>

        <input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[20rem] p-2 rounded text-black"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit"
        >
          Novo Projeto
        </button>
      </section>

      {/* Seções: Recentes + Agenda */}
      <section className="flex ml-28 mt-12 gap-16 flex-wrap">
        {/* Projetos Recentes */}
        <article className="w-[30rem] min-h-[20rem] bg-[#111111] rounded text-white p-4 font-bold overflow-auto">
          <h2 className="text-[1.6rem]">Recentes:</h2>

          {filteredProjects.length === 0 ? (
            <p className="text-sm mt-4 ml-2 text-gray-400 font-normal">
              Nenhum projeto encontrado.
            </p>
          ) : (
            <ol className="mt-4 ml-6 list-decimal text-sm font-normal">
              {filteredProjects.map((project, index) => (
                <li key={index} className="mb-4">
                  {editingIndex === index ? (
                    <div className="mb-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full mb-2 p-1 rounded text-black"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-1 rounded text-black"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-600 px-2 py-1 rounded text-white hover:bg-green-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 px-2 py-1 rounded text-white hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[#00A3FF] font-semibold">{project.name}</span>
                        <p className="text-white text-xs ml-1">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(index)}
                          className="text-sm text-yellow-400 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </article>

        {/* Agenda */}
        <article className="w-[30rem] h-[20rem] bg-[#111111] rounded text-white p-4 font-bold overflow-auto">
          <h2 className="text-[1.6rem]">Agenda:</h2>
          <ol className="mt-4 ml-6 list-decimal text-sm font-normal">
            <li>Reunião com cliente - 08/07</li>
            <li>Deploy em staging</li>
          </ol>
        </article>
      </section>

      {/* MODAL: Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#111111] text-white p-6 rounded w-[28rem] relative">
            <h2 className="text-xl font-bold mb-4">Novo Projeto</h2>

            <input
              type="text"
              placeholder="Nome do Projeto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 mb-3 text-black rounded"
            />

            <textarea
              placeholder="Descrição"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-2 mb-4 text-black rounded"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Criar Projeto
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-4 text-white text-2xl"
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
