import axios from 'axios';

const API_URL = 'http://localhost:3001/projects';

export const getProjects = async (date?: string) => {
  const res = await axios.get(API_URL, {
    params: date ? { date } : {},
  });
  return res.data;
};

export const createProject = async (project: { name: string; datetime: string }) => {
  const res = await axios.post(API_URL, project);
  return res.data;
};

export const updateProject = async (id: number, project: { name: string; datetime: string }) => {
  const res = await axios.put(`${API_URL}/${id}`, project);
  return res.data;
};

export const deleteProject = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`);
};