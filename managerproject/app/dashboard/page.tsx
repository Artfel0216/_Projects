'use client';

import { useState, useRef, useEffect } from 'react';
import Header from "@/app/components/header/page";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '@/app/services/projectService';

interface Project {
  id: number;
  name: string;
  datetime: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', datetime: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const filterModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (date?: string) => {
    const data = await getProjects(date);
    setProjects(data);
  };

  useEffect(() => {
    if (showModal && nameInputRef.current) nameInputRef.current.focus();
  }, [showModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModal();
        if (showFilterModal) closeFilterModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showFilterModal]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
      if (filterModalRef.current && !filterModalRef.current.contains(e.target as Node)) closeFilterModal();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setNewProject({ name: '', datetime: '' });
    setEditingId(null);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleSave = async () => {
    if (!newProject.name || !newProject.datetime) return;

    if (editingId !== null) {
      await updateProject(editingId, newProject);
    } else {
      await createProject(newProject);
    }

    closeModal();
    await fetchProjects(filterDate || undefined);
  };

  const handleEdit = (id: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setNewProject({ name: project.name, datetime: project.datetime });
      setEditingId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    await fetchProjects(filterDate || undefined);
  };

  return (
    <main className="bg-black min-h-screen text-white p-4">
      <Header
        onCreateProject={() => setShowModal(true)}
        onOpenCalendarModal={() => setShowFilterModal(true)}
      />

      <section className="mt-8 ml-12">
        <h1 className="text-3xl font-bold">Recent Projects:</h1>

        {projects.length === 0 ? (
          <p className="text-white mt-8 text-xl font-bold">No projects found.</p>
        ) : (
          <ol className="list-decimal ml-6 mt-6 space-y-4">
            {projects.map(project => (
              <li key={project.id} className="flex justify-between items-center">
                <div className='bg-white w-full rounded mr-4 p-4'>
                  <strong className='text-2xl text-black'>{project.name}</strong>
                  <span className="text-black text-lg font-bold ml-12">
                    {new Date(project.datetime).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="bg-yellow-400 w-[6rem] h-[3rem] rounded font-bold text-black hover:bg-yellow-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-500 w-[6rem] h-[3rem] rounded font-bold text-black hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Modal: Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white text-black p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Project" : "New Project"}
            </h2>

            <input
              ref={nameInputRef}
              type="text"
              placeholder="Name of the Project"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full border p-2 mb-3 rounded font-bold"
            />

            <input
              type="datetime-local"
              value={newProject.datetime}
              onChange={(e) => setNewProject({ ...newProject, datetime: e.target.value })}
              className="w-full border p-2 mb-4 rounded font-bold"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Filter */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div ref={filterModalRef} className="bg-white text-black p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Filter by Date</h2>

            <input
              type="date"
              onChange={async (e) => {
                const date = e.target.value;
                setFilterDate(date);
                await fetchProjects(date);
              }}
              className="w-full border p-2 mb-4 rounded font-bold"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={async () => {
                  setFilterDate(null);
                  closeFilterModal();
                  await fetchProjects();
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Clear
              </button>
              <button
                onClick={closeFilterModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
