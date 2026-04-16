const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/leads.json');

function readLeads() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeLeads(leads) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
}

function getLeads() {
  return readLeads();
}

function saveLead(lead) {
  const leads = readLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    leads[idx] = lead;
  } else {
    leads.push(lead);
  }
  writeLeads(leads);
  return lead;
}

function saveLeads(newLeads) {
  const existing = readLeads();
  const existingMap = new Map(existing.map((l) => [l.id, l]));
  for (const lead of newLeads) {
    existingMap.set(lead.id, lead);
  }
  const merged = Array.from(existingMap.values());
  writeLeads(merged);
  return merged;
}

function clearLeads() {
  writeLeads([]);
}

module.exports = { getLeads, saveLead, saveLeads, clearLeads };
