import axios from 'axios';

const BASE = '/api';

export async function uploadCSV(file) {
  const form = new FormData();
  form.append('csv', file);
  const { data } = await axios.post(`${BASE}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getLeads() {
  const { data } = await axios.get(`${BASE}/leads`);
  return data;
}

export async function clearLeads() {
  const { data } = await axios.delete(`${BASE}/leads`);
  return data;
}

export async function scoreLead(id) {
  const { data } = await axios.post(`${BASE}/score/${id}`);
  return data;
}

export async function scoreAll() {
  const { data } = await axios.post(`${BASE}/score`);
  return data;
}

export function exportUrl() {
  return `${BASE}/leads/export`;
}
